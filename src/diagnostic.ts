import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, generatedContent, credits } from "./lib/db/schema";

const DATABASE_URL = "postgresql://neondb_owner:npg_m4NBpCGK3IHa@ep-aged-cake-a1aoex8o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql_conn = neon(DATABASE_URL);
const db = drizzle(sql_conn);

async function diagnostic() {
  console.log("--- NEON DATABASE DIAGNOSTIC ---");
  try {
    const userList = await db.select().from(users).limit(10);
    console.log(`\n[Users] Total in DB: ${userList.length}`);
    userList.forEach(u => console.log(`- ID: ${u.id}, Clerk: ${u.clerkId}, Name: ${u.name}`));

    const contentList = await db.select().from(generatedContent).limit(10);
    console.log(`\n[Content] Total in DB: ${contentList.length}`);
    contentList.forEach(c => console.log(`- ID: ${c.id}, UserID: ${c.userId}, Topic: ${c.topic}, Type: ${c.type}`));

    const creditList = await db.select().from(credits).limit(10);
    console.log(`\n[Credits] Total in DB: ${creditList.length}`);
    
  } catch (error) {
    console.error("\n[ERROR] Diagnostic Failed:", error);
  }
}

diagnostic();
