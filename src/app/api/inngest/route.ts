import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processGeneration } from "@/lib/inngest/functions";

// Create an API route that Inngest can use to communicate with your app
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processGeneration,
  ],
});
