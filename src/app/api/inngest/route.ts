import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processGeneration } from "@/lib/inngest/functions";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Log database status on every Inngest request to help with debugging
const checkDb = async () => {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("[Inngest Route] Database connection: OK");
  } catch (err) {
    console.error("[Inngest Route] Database connection: FAILED", err);
  }
};

// Create an API route that Inngest can use to communicate with your app
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processGeneration,
  ],
});

// We can't easily run async code in the export top level, but we can log that it's loaded
console.log("[Inngest Route] Route handler initialized");
checkDb();
