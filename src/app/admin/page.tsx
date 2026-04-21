import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAdminDashboardData } from "./actions";
import AdminDashboard from "./AdminDashboard";
import Navbar from "@/components/layout/Navbar";

// ============================================
// Admin Panel — Server Component
// Protected by email whitelist
// ============================================

const ADMIN_EMAILS = [
  "bagewadirahulr@gmail.com",
];

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.emailAddresses[0]?.emailAddress;
  console.log("Logged-in email:", email);
  
  if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
    redirect("/dashboard");
  }

  const data = await getAdminDashboardData();

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              🛡️ Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Platform analytics, user management, and EWS verification review
            </p>
          </div>
          <AdminDashboard data={data} />
        </div>
      </main>
    </>
  );
}
