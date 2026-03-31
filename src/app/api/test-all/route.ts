
import { NextResponse } from "next/server";
import { generateContentJSON } from "@/lib/gemini";
import { db } from "@/lib/db";
import { users, generatedContent } from "@/lib/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic") || "Photosynthesis";

  console.log("--- STARTING END-TO-END TEST ---");
  
  try {
    // 1. Find a test user
    const allUsers = await db.select().from(users).limit(1);
    if (allUsers.length === 0) return NextResponse.json({ error: "No users in DB" }, { status: 404 });
    const user = allUsers[0];
    console.log("Test User:", user.id);

    // 2. Test Gemini
    console.log("Testing Gemini...");
    const prompt = `Generate 2 study notes for ${topic}. Return JSON: { "sections": [{ "heading": "...", "content": "..." }] }`;
    const aiContent = await generateContentJSON(prompt);
    console.log("Gemini Response Received");

    // 3. Test DB Save
    console.log("Testing DB Save...");
    const newContent = await db.insert(generatedContent).values({
      userId: user.id,
      topic: topic + " (TEST)",
      type: "notes",
      content: aiContent,
    }).returning();
    console.log("DB Save Successful:", newContent[0].id);

    return NextResponse.json({
      success: true,
      user: user.id,
      contentId: newContent[0].id,
      data: aiContent
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error("TEST FAILED:", error);
    return NextResponse.json({ 
      error: errMsg, 
      stack: errStack 
    }, { status: 500 });
  }
}
