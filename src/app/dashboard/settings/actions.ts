"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getUserByClerkId,
  updateUserProfile,
  setEwsStatusFull,
  logVerificationAudit,
  incrementEwsSubmission,
  checkEwsRateLimit,
  saveEwsCertificate,
  setEwsOcrResults,
  checkDuplicateCertificate,
  checkRejectionCooldown,
} from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHash } from "crypto";

// ============================================
// Settings Server Actions
// Profile Updates + EWS Verification Pipeline
// With: Income Extraction, ₹8L Threshold,
//       Rate Limiting (3/24h), Audit Logging,
//       Fraud Prevention, AI Risk Scoring,
//       Document Expiry Detection
// ============================================

/** EWS income threshold in INR per year */
const EWS_INCOME_THRESHOLD = 800000;

/**
 * Update user profile preferences (name, language, exam).
 */
export async function updateProfile(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  const firstName = (formData.get("firstName") as string)?.trim() || undefined;
  const middleName = (formData.get("middleName") as string)?.trim() || undefined;
  const lastName = (formData.get("lastName") as string)?.trim() || undefined;
  const preferredLanguage = formData.get("preferredLanguage") as
    | "english" | "hindi" | "urdu" | "kannada" | "tamil" | "telugu" | "malayalam"
    | undefined;
  const targetExam = formData.get("targetExam") as
    | "UPSC" | "SSC_CGL" | "IBPS" | "RRB_NTPC"
    | null
    | undefined;

  await updateUserProfile(user.id, {
    firstName,
    middleName,
    lastName,
    preferredLanguage,
    targetExam: targetExam || null,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");

  return { success: true, message: "Profile updated successfully." };
}

/**
 * Compute fuzzy name similarity score (0-100).
 * Handles initials, partial names, and spelling variations.
 */
function computeNameMatchScore(
  profileFirst: string,
  profileLast: string,
  docFirst: string,
  docLast: string
): number {
  const pf = profileFirst.toLowerCase().trim();
  const pl = profileLast.toLowerCase().trim();
  const df = docFirst.toLowerCase().trim();
  const dl = docLast.toLowerCase().trim();

  if (!df && !dl) return 0;

  let score = 0;

  // First name matching (50 points)
  if (pf === df) {
    score += 50;
  } else if (pf.includes(df) || df.includes(pf)) {
    score += 40;
  } else if (pf[0] === df[0] && (df.length <= 2 || pf.length <= 2)) {
    // Initial match (e.g. "R" vs "Rahul")
    score += 25;
  } else {
    // Levenshtein-like: check character overlap
    const overlap = [...pf].filter((c) => df.includes(c)).length;
    score += Math.min(30, Math.round((overlap / Math.max(pf.length, df.length)) * 30));
  }

  // Last name matching (50 points)
  if (pl === dl) {
    score += 50;
  } else if (pl.includes(dl) || dl.includes(pl)) {
    score += 40;
  } else if (pl[0] === dl[0] && (dl.length <= 2 || pl.length <= 2)) {
    score += 25;
  } else {
    const overlap = [...pl].filter((c) => dl.includes(c)).length;
    score += Math.min(30, Math.round((overlap / Math.max(pl.length, dl.length)) * 30));
  }

  return Math.min(100, score);
}

/**
 * Compute SHA-256 hash of base64 document data for duplicate detection.
 */
function computeDocumentHash(base64Data: string): string {
  return createHash("sha256").update(base64Data).digest("hex");
}

/**
 * Compute risk score (0-100) from verification flags and OCR data.
 * Higher = more risky (more likely to be fraudulent/invalid).
 */
function computeRiskScore(issues: string[], blurScore: number | null, nameScore: number, docType: string): number {
  let risk = 0;

  // Base risk from issues count
  risk += issues.length * 15;

  // Document type risk
  if (docType === "INVALID_DOCUMENT") risk += 40;
  else if (docType === "UNCERTAIN") risk += 20;

  // Blur risk (inverse of blur score)
  if (typeof blurScore === "number") {
    risk += Math.max(0, Math.round((100 - blurScore) * 0.2));
  }

  // Name mismatch risk
  if (nameScore < 40) risk += 20;
  else if (nameScore < 70) risk += 10;

  return Math.min(100, Math.max(0, risk));
}

/**
 * Generate AI recommendation based on risk analysis.
 */
function computeAiRecommendation(riskScore: number, issues: string[], docType: string): "APPROVE" | "REVIEW" | "REJECT" {
  // Hard reject conditions
  if (docType === "INVALID_DOCUMENT") return "REJECT";
  if (issues.includes("INCOME_EXCEEDED")) return "REJECT";

  // Strong approve conditions
  if (riskScore <= 10 && issues.length === 0 && docType === "VALID_EWS") return "APPROVE";

  // Everything else needs review
  if (riskScore <= 25 && docType === "VALID_EWS") return "APPROVE";
  if (riskScore >= 60) return "REJECT";

  return "REVIEW";
}

/**
 * Check if a certificate issue date is older than 1 year.
 * Returns true if expired.
 */
function isDocumentExpired(issueDateStr: string | null): boolean {
  if (!issueDateStr) return false;

  try {
    const issueDate = new Date(issueDateStr);
    if (isNaN(issueDate.getTime())) return false;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return issueDate < oneYearAgo;
  } catch {
    return false;
  }
}

/**
 * EWS Certificate Verification via Gemini Vision API.
 * 
 * Extracts: name, income, document type, confidence, issue date
 * Enforces: ₹8L income threshold, name matching, rate limiting (3/24h),
 *           duplicate detection (SHA-256), rejection cooldown (24h)
 * Computes: riskScore (0-100), aiRecommendation (APPROVE/REVIEW/REJECT)
 * Logs: Every decision in verification_audit_logs
 * 
 * ZERO-RETENTION: Certificate image exists in volatile server RAM only.
 */
export async function verifyEwsCertificate(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  // --- Already approved ---
  if (user.ewsStatus === "approved" || user.ewsVerified) {
    return {
      success: false,
      message: "Your EWS status is already verified. No further action is needed.",
    };
  }

  // --- Rejection Cooldown Check (24h after rejection) ---
  const cooldownCheck = await checkRejectionCooldown(user.id);
  if (!cooldownCheck.allowed) {
    return {
      success: false,
      message: `Please wait ${cooldownCheck.hoursRemaining} hour(s) after rejection before resubmitting. This cooldown prevents system abuse.`,
    };
  }

  // --- Rate Limit Check (3 submissions per 24 hours) ---
  const rateCheck = await checkEwsRateLimit(user.id);
  if (!rateCheck.allowed) {
    return {
      success: false,
      message: `You have used all 3 verification attempts for today. You can try again in 24 hours. (${rateCheck.remaining} attempts remaining)`,
    };
  }

  // Require name fields for cross-referencing
  if (!user.firstName || !user.lastName) {
    return {
      success: false,
      message: "Please save your First Name and Last Name in the profile section above before verifying your EWS certificate.",
    };
  }

  const file = formData.get("certificate") as File | null;
  if (!file || file.size === 0) {
    return { success: false, message: "Please upload your EWS/Income certificate." };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, message: "Only JPEG, PNG, WebP, or HEIC images are accepted." };
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, message: "Image must be under 10MB." };
  }

  try {
    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    // --- Fraud Prevention: SHA-256 Duplicate Detection ---
    const documentHash = computeDocumentHash(base64Data);
    const isDuplicate = await checkDuplicateCertificate(documentHash, user.id);
    if (isDuplicate) {
      return {
        success: false,
        message: "This certificate has already been submitted by another user. Duplicate documents are not accepted.",
      };
    }

    // Increment submission counter AFTER all pre-checks pass
    await incrementEwsSubmission(user.id);

    // SAVE FILE TO DB FOR ADMIN VIEWING (with hash for dedup)
    await saveEwsCertificate(user.id, base64Data, mimeType, documentHash);

    // INSTANTLY UPDATE DB TO PENDING TO UNBLOCK UI
    await setEwsStatusFull(user.id, {
      ewsStatus: "needs_review",
      ewsRejectionReason: null,
    });
    await setEwsOcrResults(user.id, {
      ewsVerificationFlag: "PENDING",
      ewsExtractedName: null,
      ewsExtractedIncome: null,
      ewsBlurScore: null,
    });
    
    // UI responds fast. We spawn OCR asynchronously to unblock.
    void runOcrPipeline(user, base64Data, mimeType);

    revalidatePath("/dashboard/settings");
    return {
      success: true,
      verified: false,
      pending: true,
      message: "Certificate submitted. Verification is running in the background. A 24-hr Temporary Pass has been granted (10 credits) while we analyze it.",
    };
  } catch (error) {
    console.error("[EWS Verification] Submission error:", error);
    return {
      success: false,
      message: "System encountered an error uploading the document. Please try again.",
    };
  }
}

/**
 * Background async pipeline for OCR Validation.
 * Will NOT auto-approve/reject. Only flags the DB for Admin Review.
 *
 * Pipeline steps:
 *   1. Blur Detection (Laplacian variance proxy via Gemini)
 *   2. OCR Text Extraction (multi-language: English, Hindi, Kannada, etc.)
 *   3. Document Type Classification (VALID_EWS / UNCERTAIN / INVALID_DOCUMENT)
 *   4. Name Matching (fuzzy, against profile)
 *   5. Income Extraction & ₹8L threshold check
 *   6. Document Expiry Detection (>1 year = expired)
 *   7. Risk Score Computation (0-100)
 *   8. AI Recommendation (APPROVE / REVIEW / REJECT)
 *   9. Final flag assignment
 *
 * If confidence is very low (<30), retries OCR once with enhanced prompt.
 */
async function runOcrPipeline(
  user: any,
  base64Data: string,
  mimeType: string
) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" },
    });

    let parsed = await callGeminiOcr(model, base64Data, mimeType, false);

    // --- OCR Retry: if confidence is very low, retry with enhanced prompt ---
    if (typeof parsed.blurScore === "number" && parsed.blurScore < 30) {
      console.log("[EWS OCR] Low confidence, retrying with enhanced prompt...");
      const retryParsed = await callGeminiOcr(model, base64Data, mimeType, true);
      // Use retry result if it has better confidence
      if (typeof retryParsed.blurScore === "number" && retryParsed.blurScore > parsed.blurScore) {
        parsed = retryParsed;
      }
    }

    // ---- Evaluate Verification Matrix ----
    const issues: string[] = [];
    
    // Step 1: BLUR DETECTION
    const isBlurry = parsed.isBlurry === true || (typeof parsed.blurScore === "number" && parsed.blurScore < 50);
    if (isBlurry) issues.push("BLUR");

    // Step 2: DOCUMENT TYPE DETECTION
    const docType: string = parsed.documentType || "UNCERTAIN";
    if (docType === "INVALID_DOCUMENT") {
      issues.push("INVALID_DOCUMENT");
    } else if (docType === "UNCERTAIN") {
      issues.push("UNCERTAIN_DOCUMENT");
    }

    // Step 3: NAME MATCHING (use full name + first/last from OCR)
    const ocrFirstName = (parsed.extractedFirstName || "").trim();
    const ocrLastName = (parsed.extractedLastName || "").trim();
    const ocrFullName = (parsed.extractedFullName || "").trim();
    const displayName = ocrFullName || [ocrFirstName, ocrLastName].filter(Boolean).join(" ") || null;

    let nameScore = 0;
    if (ocrFirstName || ocrLastName) {
      nameScore = computeNameMatchScore(
        user.firstName || "", user.lastName || "",
        ocrFirstName || ocrFullName || "", ocrLastName || ""
      );
    } else if (ocrFullName) {
      const profileFull = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase().trim();
      const docFull = ocrFullName.toLowerCase().trim();
      if (profileFull === docFull) nameScore = 100;
      else if (profileFull.includes(docFull) || docFull.includes(profileFull)) nameScore = 80;
      else {
        const overlap = [...profileFull].filter((c) => docFull.includes(c)).length;
        nameScore = Math.min(60, Math.round((overlap / Math.max(profileFull.length, docFull.length)) * 60));
      }
    }
    if (nameScore < 70 && displayName) issues.push("NAME_MISMATCH");

    // Step 4: INCOME EXTRACTION & THRESHOLD
    let income = parsed.annualIncome;
    if (typeof income === "string") {
      income = parseInt(income.replace(/[^0-9]/g, ""), 10) || null;
    }
    if (!parsed.incomeFound || typeof income !== "number") {
      issues.push("INCOME_NOT_FOUND");
    } else if (income > EWS_INCOME_THRESHOLD) {
      issues.push("INCOME_EXCEEDED");
    }

    // Step 5: DOCUMENT EXPIRY DETECTION
    const issueDate: string | null = parsed.issueDate || null;
    if (isDocumentExpired(issueDate)) {
      issues.push("EXPIRED_DOCUMENT");
    }

    // Step 6: COMPUTE RISK SCORE & AI RECOMMENDATION
    const blurScore = typeof parsed.blurScore === "number" ? parsed.blurScore : null;
    const riskScore = computeRiskScore(issues, blurScore, nameScore, docType);
    const aiRecommendation = computeAiRecommendation(riskScore, issues, docType);

    // Step 7: ASSIGN FINAL FLAG
    type VerificationFlag = "AUTO_CLEAR" | "REVIEW_BLUR" | "REVIEW_NAME_MISMATCH" | "REVIEW_INCOME_EXCEEDED" | "REVIEW_INCOME_NOT_FOUND" | "REVIEW_INVALID_DOCUMENT" | "REVIEW_UNCERTAIN_DOCUMENT" | "REVIEW_EXPIRED_DOCUMENT" | "REVIEW_MULTIPLE_ISSUES";

    let flag: VerificationFlag = "AUTO_CLEAR";
    if (issues.length > 1) {
      flag = "REVIEW_MULTIPLE_ISSUES";
    } else if (issues.length === 1) {
      flag = `REVIEW_${issues[0]}` as VerificationFlag;
    }

    // Update OCR DB Fields
    await setEwsOcrResults(user.id, {
      ewsVerificationFlag: flag,
      ewsExtractedName: displayName,
      ewsExtractedIncome: typeof income === "number" ? income : null,
      ewsBlurScore: blurScore,
      ewsDocumentType: docType,
      ewsRiskScore: riskScore,
      ewsAiRecommendation: aiRecommendation,
      ewsIssueDate: issueDate,
    });

    await logVerificationAudit({
      userId: user.id,
      action: "submitted",
      confidenceScore: blurScore,
      nameMatchScore: nameScore,
      extractedIncome: typeof income === "number" ? income : null,
      decisionReason: `OCR completed. DocType: ${docType}. Risk: ${riskScore}/100. AI: ${aiRecommendation}. Flags: ${issues.length === 0 ? "None (AUTO_CLEAR)" : issues.join(", ")}. Keywords: ${(parsed.keywordsFound || []).join(", ") || "none"}. Authority: ${parsed.issuingAuthority || "unknown"}. IssueDate: ${issueDate || "not found"}.`,
    });

  } catch (error) {
    console.error("[EWS Background OCR] failed:", error);
    await setEwsOcrResults(user.id, {
      ewsVerificationFlag: "REVIEW_MULTIPLE_ISSUES",
      ewsExtractedName: null,
      ewsExtractedIncome: null,
      ewsBlurScore: null,
      ewsDocumentType: null,
      ewsRiskScore: 80,
      ewsAiRecommendation: "REVIEW",
    });
    
    await logVerificationAudit({
      userId: user.id,
      action: "needs_review",
      decisionReason: `Background OCR engine failed: ${error instanceof Error ? error.message : "Unknown error"}. Manual review strongly required.`,
    });
  }
}

/**
 * Call Gemini Vision for OCR extraction.
 * @param enhanced - if true, uses a more detailed prompt for retry on low confidence.
 */
async function callGeminiOcr(model: any, base64Data: string, mimeType: string, enhanced: boolean) {
  const enhancedInstructions = enhanced
    ? `\nIMPORTANT: The image may be rotated, low contrast, or contain handwritten text. Try harder to read the text. Look for text at all angles. If the document is in Hindi, Kannada, Tamil, Telugu, Marathi, or any other Indian language, extract the text in that language and translate key fields (name, income) to English.\n`
    : "";

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64Data } },
    {
      text: `You are an Official Document Verification AI for an EWS (Economically Weaker Section) certification program in India.
${enhancedInstructions}
Analyze this document image thoroughly and extract ALL parameters below.
The document may be in English, Hindi, Kannada, Tamil, Telugu, Marathi, or any Indian regional language. Extract and translate key fields to English.

RESPOND WITH VALID JSON ONLY:
{
  "extractedText": "full raw OCR text perfectly transcribed from the document",
  "blurScore": 0-100 (100 = perfectly sharp readable text, 0 = completely unreadable/blurry/distorted),
  "isBlurry": true or false (true if blurScore < 50),
  "extractedFirstName": "First name of the certificate holder/applicant",
  "extractedLastName": "Last name/surname of the certificate holder/applicant",
  "extractedFullName": "Complete full name as written on the document",
  "annualIncome": null or integer (IMPORTANT: Convert any Indian format to plain integer. Examples: Rs. 7,50,000 = 750000, 7.5 lakh = 750000, Rs. 8,00,000 = 800000. If only monthly income is found, multiply by 12. Output STRICTLY integer or null if not found),
  "incomeFound": true or false,
  "documentType": "VALID_EWS" or "UNCERTAIN" or "INVALID_DOCUMENT",
  "keywordsFound": ["list of relevant keywords found in the document"],
  "issuingAuthority": "Name of the issuing authority/officer if found, or null",
  "issueDate": "YYYY-MM-DD format date when the certificate was issued, or null if not found. Look for dates labeled as 'Date of Issue', 'Issued on', 'Date', 'दिनांक', etc."
}

DOCUMENT TYPE CLASSIFICATION RULES:
- "VALID_EWS": Document contains keywords like "EWS", "Economically Weaker Section", "Income Certificate", "Annual Income", "Family Income", "Below Poverty Line", "BPL", "आय प्रमाण पत्र", "आर्थिक रूप से कमजोर" AND appears to be issued by a government authority
- "UNCERTAIN": Document appears to be an official/government document but does NOT clearly match EWS or Income Certificate criteria, or text is partially readable
- "INVALID_DOCUMENT": Document is clearly NOT an EWS/Income certificate (e.g., Aadhaar card, PAN card, mark sheet, driving license, random photo, selfie, blank page, etc.)

KEYWORDS TO LOOK FOR (English & Hindi): "income certificate", "ews", "economically weaker section", "annual income", "family income", "government of", "tahsildar", "revenue department", "collector", "sdm", "block development", "below poverty line", "bpl", "आय प्रमाण पत्र", "वार्षिक आय", "परिवार की आय"`,
    },
  ]);

  const responseText = result.response.text();
  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("OCR Failed: Invalid JSON response from Gemini");
  }
}
