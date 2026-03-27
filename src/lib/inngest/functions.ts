import { inngest } from "./client";
import { generateContentJSON } from "../gemini";
import { db } from "../db";
import { generatedContent, credits } from "../db/schema";

/**
 * Inngest function - Corrected to use the 'triggers' array as required by the SDK.
 */
export const processGeneration = inngest.createFunction(
  { 
    id: "process-generation", 
    name: "Process AI Generation",
    triggers: [{ event: "exam/generate.content" }] 
  },
  async ({ event, step }) => {
    const { userId, topic, type, prompt } = event.data;

    // 1. Generate Content via Gemini
    const content = await step.run("generate-ai-content", async () => {
      const res = await generateContentJSON(prompt);
      return res as Record<string, unknown>;
    });

    // 2. Save to Database & Deduct Credit (Atomic Transaction)
    await step.run("save-to-db", async () => {
      await db.transaction(async (tx) => {
        // Save content
        await tx.insert(generatedContent).values({
          userId,
          topic,
          type,
          content,
        });

        // Deduct 1 credit
        await tx.insert(credits).values({
          userId,
          amount: -1,
          reason: `Generated ${type}: ${topic}`,
        });
      });
    });

    return { success: true, topic };
  }
);
