"use server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function resendVerificationEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/app/verify-email?error=" + encodeURIComponent("Email is required"));
  }

  const supabase = await createServerSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${siteUrl}/app/login?verified=true`,
    }
  });

  if (error) {
    redirect("/app/verify-email?email=" + encodeURIComponent(email) + "&error=" + encodeURIComponent(error.message));
  }

  redirect("/app/verify-email?email=" + encodeURIComponent(email) + "&message=" + encodeURIComponent("Verification email sent. Please check your inbox."));
}





