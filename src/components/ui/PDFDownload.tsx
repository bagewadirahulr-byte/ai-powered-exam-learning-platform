"use client";
import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PDFDocument from "./PDFDocument";
import { Download, Loader2 } from "lucide-react";

interface PDFDownloadProps {
  title: string;
  sections: Array<{ heading: string; content: string }>;
}

/**
 * Client-side component to handle PDF rendering and download
 */
export default function PDFDownload({ title, sections }: PDFDownloadProps) {
  return (
    <PDFDownloadLink
      document={<PDFDocument title={title} sections={sections} />}
      fileName={`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all shadow-lg hover:shadow-primary/20"
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
            <span>Download PDF</span>
          </>
        )
      }
    </PDFDownloadLink>
  );
}
