import { getContentById, getUserByClerkId } from "@/lib/db/queries";
import { currentUser } from "@clerk/nextjs/server";

export default async function DebugContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clerkUser = await currentUser();
  const dbUser = clerkUser ? await getUserByClerkId(clerkUser.id) : null;
  const contentItem = await getContentById(id);
  
  return (
    <div className="p-10 bg-black text-white xl text-left w-full h-full min-h-screen pt-32">
        <h1 className="text-3xl font-bold mb-8">Debug Data</h1>
        <pre className="p-4 bg-gray-900 rounded overflow-auto">
{JSON.stringify({
    params_id: id,
    clerkUser_exists: !!clerkUser,
    dbUser_id: dbUser?.id,
    contentItem_id: contentItem?.id,
    contentItem_userId: contentItem?.userId,
    match: contentItem?.userId === dbUser?.id
}, null, 2)}
        </pre>
    </div>
  )
}
