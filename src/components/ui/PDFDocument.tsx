"use client";
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Generic English Font
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
});

// Register fonts for Indian Vernacular Languages
Font.register({ family: 'NotoSansDevanagari', src: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf' });
Font.register({ family: 'NotoSansArabic', src: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf' });
Font.register({ family: 'NotoSansKannada', src: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansKannada/NotoSansKannada-Regular.ttf' });
Font.register({ family: 'NotoSansTamil', src: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf' });
Font.register({ family: 'NotoSansTelugu', src: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansTelugu/NotoSansTelugu-Regular.ttf' });
Font.register({ family: 'NotoSansMalayalam', src: 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansMalayalam/NotoSansMalayalam-Regular.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: "#ffffff",
    fontFamily: "Roboto",
  },
  pageDevanagari: { padding: 50, backgroundColor: "#ffffff", fontFamily: "NotoSansDevanagari" },
  pageArabic: { padding: 50, backgroundColor: "#ffffff", fontFamily: "NotoSansArabic" },
  pageKannada: { padding: 50, backgroundColor: "#ffffff", fontFamily: "NotoSansKannada" },
  pageTamil: { padding: 50, backgroundColor: "#ffffff", fontFamily: "NotoSansTamil" },
  pageTelugu: { padding: 50, backgroundColor: "#ffffff", fontFamily: "NotoSansTelugu" },
  pageMalayalam: { padding: 50, backgroundColor: "#ffffff", fontFamily: "NotoSansMalayalam" },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    marginBottom: 8,
    color: "#2563eb",
    fontWeight: "bold",
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#334155",
  },
  questionBox: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftStyle: "solid",
    borderLeftColor: "#3b82f6",
  },
  questionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  option: {
    fontSize: 10,
    color: "#475569",
    marginLeft: 10,
    marginBottom: 2,
  },
  answer: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "bold",
    marginTop: 5,
  },
  explanation: {
    fontSize: 9,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 2,
  },
  flashcard: {
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: 6,
  },
  cardFront: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardBack: {
    fontSize: 11,
    color: "#64748b",
  },
  qnaBox: {
    marginBottom: 15,
  },
  qText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
  },
  aText: {
    fontSize: 11,
    color: "#475569",
    marginTop: 4,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: "#cbd5e1",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 9,
    color: "#94a3b8",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
});

interface PDFDocumentProps {
  title: string;
  type: "notes" | "quiz" | "flashcards" | "qna";
  data: {
    sections?: Array<{ heading: string; content: string }>;
    questions?: Array<{ question: string; options: string[]; correctAnswer: string; explanation: string }>;
    cards?: Array<{ front: string; back: string }>;
    pairs?: Array<{ question: string; answer: string }>;
  };
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ title, type, data }) => {
  // Detect language and swap the page style to the supported font
  const contentString = JSON.stringify(data) + title;
  
  let pageStyle = styles.page;
  if (/[\u0900-\u097F]/.test(contentString)) pageStyle = styles.pageDevanagari; // Hindi
  else if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(contentString)) pageStyle = styles.pageArabic; // Urdu
  else if (/[\u0C80-\u0CFF]/.test(contentString)) pageStyle = styles.pageKannada; // Kannada
  else if (/[\u0B80-\u0BFF]/.test(contentString)) pageStyle = styles.pageTamil; // Tamil
  else if (/[\u0C00-\u0C7F]/.test(contentString)) pageStyle = styles.pageTelugu; // Telugu
  else if (/[\u0D00-\u0D7F]/.test(contentString)) pageStyle = styles.pageMalayalam; // Malayalam

  return (
  <Document>
    <Page size="A4" style={pageStyle}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{type} Study Material</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {type === "notes" && data.sections?.map((section: any, index: number) => (
        <View key={index} style={styles.section} wrap={false}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.content}>{section.content}</Text>
        </View>
      ))}

      {type === "quiz" && data.questions?.map((q: any, index: number) => (
        <View key={index} style={styles.questionBox} wrap={false}>
          <Text style={styles.questionText}>Q{index + 1}: {q.question}</Text>
          {q.options.map((opt: string, i: number) => (
            <Text key={i} style={styles.option}>• {opt}</Text>
          ))}
          <Text style={styles.answer}>Correct Answer: {q.correctAnswer}</Text>
          {q.explanation && <Text style={styles.explanation}>Explanation: {q.explanation}</Text>}
        </View>
      ))}

      {type === "flashcards" && data.cards?.map((card: any, index: number) => (
        <View key={index} style={styles.flashcard} wrap={false}>
          <Text style={styles.cardFront}>Q: {card.front}</Text>
          <Text style={styles.cardBack}>A: {card.back}</Text>
        </View>
      ))}

      {type === "qna" && data.pairs?.map((pair: any, index: number) => (
        <View key={index} style={styles.qnaBox} wrap={false}>
          <Text style={styles.qText}>Q: {pair.question}</Text>
          <Text style={styles.aText}>A: {pair.answer}</Text>
        </View>
      ))}

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `ExamAI — Generated study material for ${title} • Page ${pageNumber} of ${totalPages}`
      )} fixed />
    </Page>
  </Document>
  );
};

export default PDFDocument;
