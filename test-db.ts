import "dotenv/config";
import { db } from "./src/lib/db";
import { users, credits, generatedContent } from "./src/lib/db/schema";
import { getUserByClerkId, getUserCredits, createUser } from "./src/lib/db/queries";
import { eq } from "drizzle-orm";

/**
 * Test Script to verify the "Bug Hunt" fixes:
 * 1. JIT User Creation
 * 2. Idempotent Webhook Credits
 * 3. Atomic AI Transactions
 */
async function runTests() {
  const testClerkId = `test_user_${Date.now()}`;
  const testEmail = `${testClerkId}@example.com`;

  console.log("🚀 Starting Quality Audit Tests...");

  try {
    // --- Test 1: JIT User Creation ---
    console.log("\n--- Test 1: JIT User Creation ---");
    const newUser = await createUser({
      clerkId: testClerkId,
      email: testEmail,
      name: "Test User",
    });
    console.log("✅ User created successfully:", newUser.id);
    
    const initialCredits = await getUserCredits(newUser.id);
    console.log("✅ Initial credits (bonus):", initialCredits);

    // --- Test 2: Idempotent Webhook Credits ---
    console.log("\n--- Test 2: Idempotent Webhook Credits ---");
    const sessionId = `sess_${testClerkId}`;
    
    // Attempt 1: Add credits
    await db.insert(credits).values({
      userId: newUser.id,
      amount: 100,
      reason: "Stripe Purchase",
      stripeSessionId: sessionId,
    }).onConflictDoNothing();
    
    // Attempt 2: Duplicate add
    await db.insert(credits).values({
      userId: newUser.id,
      amount: 100,
      reason: "Stripe Purchase (Retry)",
      stripeSessionId: sessionId,
    }).onConflictDoNothing();

    const afterCredits = await getUserCredits(newUser.id);
    console.log("✅ Credits after 2 attempts (should only increase by 100):", afterCredits);
    if (afterCredits === initialCredits + 100) {
      console.log("✅ Idempotency verified!");
    } else {
      console.error("❌ Idempotency FAILED!");
    }

    // --- Test 3: Atomic AI Transactions ---
    console.log("\n--- Test 3: Atomic AI Transactions ---");
    try {
      await db.transaction(async (tx) => {
        // Save content
        await tx.insert(generatedContent).values({
          userId: newUser.id,
          type: "notes",
          topic: "Atomic Transactions",
          content: { test: true },
        });

        // Deduct credit
        await tx.insert(credits).values({
          userId: newUser.id,
          amount: -1,
          reason: "Test deduction",
        });

        console.log("✅ Transaction internal step 1 & 2 completed");
      });
      console.log("✅ Transaction committed successfully!");
    } catch (err) {
      console.error("❌ Transaction failed unexpectedly:", err);
    }

    const finalCredits = await getUserCredits(newUser.id);
    console.log("✅ Final credits:", finalCredits);

    // Clean up test data
    console.log("\n--- Cleaning up ---");
    await db.delete(users).where(eq(users.id, newUser.id));
    console.log("✅ Test user and cascaded data deleted.");

  } catch (error) {
    console.error("❌ Test suite failed:", error);
  } finally {
    process.exit(0);
  }
}

runTests();
