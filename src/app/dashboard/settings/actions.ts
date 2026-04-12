"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, updateUserProfile, setEwsStatus } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================
// Settings Server Actions
// Profile Updates + EWS Verification Pipeline
// ============================================

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
 * EWS Certificate Verification via Gemini Vision API.
 * 
 * ZERO-RETENTION: The certificate image exists purely in volatile
 * server RAM during the API call. It is never saved to DB or storage.
 */
export async function verifyEwsCertificate(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

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
    // --- Step 1: Convert image to base64 (volatile RAM only) ---
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // --- Step 2: Gemini Vision structured extraction ---
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      },
      {
        text: `You are an Official Document Verification AI for the Indian Government's Economically Weaker Section (EWS) certification program.

Analyze this uploaded certificate image carefully and extract the following information.

Respond STRICTLY in this JSON format:
{
  "firstName": "extracted first name or empty string",
  "lastName": "extracted last name or empty string",
  "documentType": "type of document detected (e.g., EWS Certificate, Income Certificate, BPL Card)",
  "confidenceScore": 0-100,
  "isGovernmentDocument": true/false,
  "extractionNotes": "any relevant notes about document quality"
}

Rules:
- confidenceScore reflects how clearly you can read and verify the document
- If the document is blurry, handwritten, or partially visible, lower the confidence score
- If it is clearly NOT a government certificate, set confidenceScore to 0
- Extract names exactly as they appear on the document`,
      },
    ]);

    // base64Data is now eligible for garbage collection — ZERO RETENTION
    const responseText = result.response.text();
    let parsed: {
      firstName: string;
      lastName: string;
      documentType: string;
      confidenceScore: number;
      isGovernmentDocument: boolean;
      extractionNotes: string;
    };

    try {
      parsed = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        message: "AI could not process the document. Please upload a clearer image.",
      };
    }

    // --- Step 3: Name cross-reference ---
    const userFirstName = user.firstName!.toLowerCase().trim();
    const userLastName = user.lastName!.toLowerCase().trim();
    const docFirstName = (parsed.firstName || "").toLowerCase().trim();
    const docLastName = (parsed.lastName || "").toLowerCase().trim();

    const nameMatch =
      (docFirstName.includes(userFirstName) || userFirstName.includes(docFirstName)) &&
      (docLastName.includes(userLastName) || userLastName.includes(docLastName));

    // --- Step 4: Decision logic ---
    if (!parsed.isGovernmentDocument || parsed.confidenceScore < 30) {
      return {
        success: false,
        message: "This does not appear to be a valid government-issued EWS or Income certificate. Please upload an authentic document.",
      };
    }

    if (parsed.confidenceScore >= 80 && nameMatch) {
      // HIGH CONFIDENCE: Instant verification
      await setEwsStatus(user.id, {
        ewsVerified: true,
        ewsPending: false,
        ewsTempPassExpiry: null,
      });

      revalidatePath("/dashboard/settings");
      return {
        success: true,
        verified: true,
        message: `EWS verification successful! Your certificate has been verified with ${parsed.confidenceScore}% confidence. You now have access to 50 daily AI credits.`,
      };
    }

    // LOW CONFIDENCE or NAME MISMATCH: Grant 24-hour Temporary Pass
    const tempExpiry = new Date();
    tempExpiry.setHours(tempExpiry.getHours() + 24);

    await setEwsStatus(user.id, {
      ewsVerified: false,
      ewsPending: true,
      ewsTempPassExpiry: tempExpiry,
    });

    revalidatePath("/dashboard/settings");

    const reason = !nameMatch
      ? "The name on the certificate does not fully match your profile."
      : "The document quality is not clear enough for automatic verification.";

    return {
      success: true,
      verified: false,
      pending: true,
      message: `${reason} A 24-hour Temporary EWS Pass (50 credits) has been granted while your document is queued for manual review.`,
    };
  } catch (error) {
    console.error("[EWS Verification] Gemini Vision error:", error);
    return {
      success: false,
      message: "AI verification service is temporarily unavailable. Please try again in a few minutes.",
    };
  }
}
