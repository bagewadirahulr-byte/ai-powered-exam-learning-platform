"use client";
import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PDFDocument from "./PDFDocument";
import { Download, Loader2 } from "lucide-react";

interface PDFDownloadProps {
  title: string;
  type: "notes" | "quiz" | "flashcards" | "qna";
  data: {
    sections?: Array<{ heading: string; content: string }>;
    questions?: Array<{ question: string; options: string[]; correctAnswer: string; explanation: string }>;
    cards?: Array<{ front: string; back: string }>;
    pairs?: Array<{ question: string; answer: string }>;
  };
}

/**
 * Client-side component to handle PDF rendering and download for all study types
 */
export default function PDFDownload({ title, type, data }: PDFDownloadProps) {
  return (
    <PDFDownloadLink
      document={<PDFDocument title={title} type={type} data={data} />}
      fileName={`${title.toLowerCase().replace(/\s+/g, "-")}-${type}.pdf`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:translate-y-0.5"
    >
      {({ loading }) =>
        loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Preparing PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download {type} as PDF</span>
          </>
        )
      }
    </PDFDownloadLink>
  );
}
