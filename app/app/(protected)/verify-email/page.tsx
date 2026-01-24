import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import VerifyEmailClient from "./VerifyEmailClient";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; message?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;
  
  // Get the current user to find their email
  const { data: userData } = await supabase.auth.getUser();
  
  // If no user is logged in, redirect to login
  if (!userData?.user) {
    redirect("/app/login");
  }

  const email = params.email || userData.user.email || "";

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <img
              src="/pinboardly-icon2.svg"
              alt="Pinboardly"
              className="w-32 h-32 mx-auto mb-6"
            />
          </a>
        </div>

        <div className="bg-white rounded-lg border border-border p-8 shadow-sm">
          <VerifyEmailClient email={email} error={params.error} message={params.message} />
        </div>
      </div>
    </div>
  );
}



