import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import AccountClient from "./AccountClient";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/login");
  }

  const email = userData.user.email || "";
  const isEmailVerified = !!userData.user.email_confirmed_at;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/app/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-semibold mb-8">Account Settings</h1>

        <AccountClient 
          email={email}
          isEmailVerified={isEmailVerified}
          error={params.error}
          success={params.success}
        />
      </div>
    </div>
  );
}



