import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
import NewPinboardForm from "./NewPinboardForm";
import EmailVerificationNotice from "./EmailVerificationNotice";

export default async function NewPinboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/login");
  }

  const isAdmin = isAdminEmail(userData.user.email);
  const isEmailVerified = !!userData.user.email_confirmed_at;

  // Allow admin to bypass email verification
  if (!isEmailVerified && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="mb-6">
            <a href="/app/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
              ← Back to dashboard
            </a>
          </div>

          <h1 className="text-3xl font-semibold mb-8">Create New Pinboard</h1>

          <EmailVerificationNotice 
            email={userData.user.email || ""} 
            error={params.error}
            message={params.message}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <a href="/app/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
            ← Back to dashboard
          </a>
        </div>

        <h1 className="text-3xl font-semibold mb-8">Create New Pinboard</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <NewPinboardForm isAdmin={isAdmin} error={params.error} />
        </div>
      </div>
    </div>
  );
}