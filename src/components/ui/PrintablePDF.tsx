"use client";

import { useRef, useState } from "react";
import { Loader2, Printer } from "lucide-react";

// ============================================
// PrintablePDF — Browser-Native Print-to-PDF
// Uses Chrome's HarfBuzz engine for PERFECT
// Indic script rendering (Kannada, Telugu, etc.)
// Replaces @react-pdf which cannot shape complex scripts
// ============================================

interface PrintablePDFProps {
  title: string;
  type: "notes" | "quiz" | "flashcards" | "qna";
  data: {
    sections?: Array<{ heading: string; content: string }>;
    questions?: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }>;
    cards?: Array<{ front: string; back: string }>;
    pairs?: Array<{ question: string; answer: string }>;
  };
}

export default function PrintablePDF({
  title,
  type,
  data,
}: PrintablePDFProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      // Build the self-contained print HTML
      const html = buildPrintHTML(title, type, data);

      // Create / reuse hidden iframe for isolated print context
      let iframe = printFrameRef.current;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "-9999px";
        iframe.style.top = "-9999px";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);
        printFrameRef.current = iframe;
      }

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error("Cannot access print frame");

      doc.open();
      doc.write(html);
      doc.close();

      // Wait for Google Fonts to load inside the iframe
      await new Promise<void>((resolve) => {
        const check = () => {
          if (doc.fonts && doc.fonts.ready) {
            doc.fonts.ready.then(() => resolve());
          } else {
            setTimeout(resolve, 800);
          }
        };
        // Allow time for font stylesheet to begin loading
        setTimeout(check, 200);
      });

      // Trigger print dialog — user can choose "Save as PDF"
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("[PrintablePDF] Print failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isPrinting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:translate-y-0.5 disabled:opacity-50"
      aria-label={`Download ${type} as PDF`}
    >
      {isPrinting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Preparing...</span>
        </>
      ) : (
        <>
          <Printer className="w-4 h-4" />
          <span>Download as PDF</span>
        </>
      )}
    </button>
  );
}

// ============================================
// HTML Builder — Self-contained print document
// Uses Google Fonts CSS with full font-family
// fallback stack for mixed-script content
// ============================================

function buildPrintHTML(
  title: string,
  type: string,
  data: PrintablePDFProps["data"]
): string {
  // Detect which Indic scripts are present and load the right Google Fonts
  const contentStr = JSON.stringify(data) + title;
  const fonts: string[] = ["Noto+Sans:wght@400;700"]; // Always include Latin

  if (/[\u0900-\u097F]/.test(contentStr))
    fonts.push("Noto+Sans+Devanagari:wght@400;700");
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(contentStr))
    fonts.push("Noto+Sans+Arabic:wght@400;700");
  if (/[\u0C80-\u0CFF]/.test(contentStr))
    fonts.push("Noto+Sans+Kannada:wght@400;700");
  if (/[\u0B80-\u0BFF]/.test(contentStr))
    fonts.push("Noto+Sans+Tamil:wght@400;700");
  if (/[\u0C00-\u0C7F]/.test(contentStr))
    fonts.push("Noto+Sans+Telugu:wght@400;700");
  if (/[\u0D00-\u0D7F]/.test(contentStr))
    fonts.push("Noto+Sans+Malayalam:wght@400;700");

  const fontUrl = `https://fonts.googleapis.com/css2?${fonts
    .map((f) => `family=${f}`)
    .join("&")}&display=swap`;

  // Render content based on type
  let bodyContent = "";

  if (type === "notes" && data.sections) {
    bodyContent = data.sections
      .map(
        (s) => `
      <div class="section">
        <h2>${esc(s.heading)}</h2>
        <p>${esc(s.content)}</p>
      </div>`
      )
      .join("");
  } else if (type === "quiz" && data.questions) {
    bodyContent = data.questions
      .map(
        (q, i) => `
      <div class="question-box">
        <p class="question"><strong>Q${i + 1}:</strong> ${esc(q.question)}</p>
        <ul class="options">
          ${q.options.map((o) => `<li>${esc(o)}</li>`).join("")}
        </ul>
        <p class="answer">✓ ${esc(q.correctAnswer)}</p>
        ${q.explanation ? `<p class="explanation">${esc(q.explanation)}</p>` : ""}
      </div>`
      )
      .join("");
  } else if (type === "flashcards" && data.cards) {
    bodyContent = data.cards
      .map(
        (c) => `
      <div class="flashcard">
        <p class="front"><strong>Q:</strong> ${esc(c.front)}</p>
        <p class="back"><strong>A:</strong> ${esc(c.back)}</p>
      </div>`
      )
      .join("");
  } else if (type === "qna" && data.pairs) {
    bodyContent = data.pairs
      .map(
        (p) => `
      <div class="qna-box">
        <p class="q-text"><strong>Q:</strong> ${esc(p.question)}</p>
        <p class="a-text">${esc(p.answer)}</p>
      </div>`
      )
      .join("");
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${esc(title)} — ${esc(type)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontUrl}" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Kannada',
                   'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Malayalam',
                   'Noto Sans Arabic', system-ui, sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1e293b;
      padding: 40px;
    }

    @media print {
      body { padding: 0; }
      .section, .question-box, .flashcard, .qna-box { break-inside: avoid; }
      @page { margin: 2cm; size: A4; }
    }

    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 14px;
      margin-bottom: 28px;
    }
    .header .type-label {
      font-size: 10pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
    }
    .header h1 {
      font-size: 20pt;
      color: #0f172a;
      font-weight: 700;
    }

    h2 {
      font-size: 14pt;
      color: #2563eb;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .section { margin-bottom: 22px; }
    .section p { color: #334155; white-space: pre-wrap; }

    .question-box {
      margin-bottom: 18px;
      padding: 14px;
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      border-radius: 4px;
    }
    .question { font-weight: 600; margin-bottom: 8px; }
    .options { margin-left: 22px; margin-bottom: 8px; }
    .options li { margin-bottom: 3px; color: #475569; }
    .answer { color: #059669; font-weight: 600; margin-top: 6px; }
    .explanation { color: #64748b; font-style: italic; font-size: 10pt; margin-top: 4px; }

    .flashcard {
      margin-bottom: 16px;
      padding: 14px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .front { font-weight: 600; color: #1e293b; margin-bottom: 6px; }
    .back { color: #64748b; }

    .qna-box { margin-bottom: 18px; }
    .q-text { font-weight: 600; color: #1e293b; margin-bottom: 6px; }
    .a-text {
      color: #475569;
      padding-left: 14px;
      border-left: 2px solid #cbd5e1;
      margin-top: 4px;
    }

    .footer {
      margin-top: 36px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="type-label">${esc(type)} Study Material</div>
    <h1>${esc(title)}</h1>
  </div>
  ${bodyContent}
  <div class="footer">ExamAI — AI-Powered Exam Learning Platform</div>
</body>
</html>`;
}

/** Escape HTML special characters to prevent XSS in print document */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
