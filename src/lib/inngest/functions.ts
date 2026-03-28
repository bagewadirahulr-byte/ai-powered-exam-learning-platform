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
    console.log(`[Inngest] Starting generation for User UUID: ${userId}`);
    console.log(`[Inngest] Topic: ${topic}, Type: ${type}`);

    // 1. Generate Content via Gemini
    const content = await step.run("generate-ai-content", async () => {
      try {
        console.log("[Inngest] Calling Gemini API...");
        const res = await generateContentJSON(prompt);
        console.log("[Inngest] Gemini API call successful");
        return res as Record<string, unknown>;
      } catch (error) {
        console.error("[Inngest] Gemini Generation Error:", error);
        throw error;
      }
    });

    // 2. Save to Database & Deduct Credit (Atomic Transaction)
    await step.run("save-to-db", async () => {
      console.log(`[Inngest] Saving to database for User UUID: ${userId}...`);
      try {
        await db.transaction(async (tx) => {
          // Save content
          await tx.insert(generatedContent).values({
            userId, // This is the Database UUID sent from the server action
            topic,
            type,
            content,
          });

          // Deduct 1 credit
          await tx.insert(credits).values({
            userId, // This is the Database UUID
            amount: -1,
            reason: `Generated ${type}: ${topic}`,
          });
        });
        console.log("[Inngest] Database transaction complete");
      } catch (error) {
        console.error("[Inngest] Database Transaction Error:", error);
        throw error;
      }
    });

    return { success: true, topic };
  }
);
