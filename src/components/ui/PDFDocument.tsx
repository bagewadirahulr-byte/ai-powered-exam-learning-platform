"use client";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: 1,
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
    borderLeft: 3,
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
    border: 1,
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
    borderLeft: 1,
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
    borderTop: 1,
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

const PDFDocument: React.FC<PDFDocumentProps> = ({ title, type, data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
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

export default PDFDocument;
