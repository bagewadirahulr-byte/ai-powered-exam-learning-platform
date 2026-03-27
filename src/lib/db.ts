// ============================================
// Neon Database Connection
// ============================================

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./db/schema";
import "dotenv/config";

// --- Node.js WebSocket Setup ---
// Neon serverless driver needs a WebSocket constructor in Node environments.
neonConfig.webSocketConstructor = ws;

// --- Connection Setup ---
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool, { schema });
