// ============================================
// Neon Database Connection
// ============================================

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";

// --- Connection Setup (HTTP mode — works in all environments) ---
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
