import { Inngest } from "inngest";

// Create a client to send and receive events with schemas defined as a record
export const inngest = new Inngest({ 
  id: "exam-learning-platform",
  schemas: {
    "exam/generate.content": {
      data: {} as {
        userId: string;
        topic: string;
        type: "notes" | "quiz" | "flashcards" | "qna";
        prompt: string;
      },
    },
  },
});
