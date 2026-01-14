"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "").trim();
  if (!next || !next.startsWith("/")) return "/app/dashboard";
  return next;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  if (!email || !password) {
    redirect(
      "/app/login?error=" +
        encodeURIComponent("Email or password incorrect.") +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      "/app/login?error=" +
        encodeURIComponent("Email or password incorrect.") +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  if (!email || !password) {
    redirect(
      "/app/login?error=" +
        encodeURIComponent("Email or password incorrect.") +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  const supabase = await createServerSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/app/login?verified=true`,
      // Email confirmation is required (configured in Supabase dashboard)
    },
  });

  if (error) {
    redirect(
      "/app/login?error=" +
        encodeURIComponent(error.message) +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  // Redirect to verify-email page with email parameter
  redirect(`/app/verify-email?email=${encodeURIComponent(email)}`);
}

export async function resendVerificationEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(
      "/app/verify-email?error=" + encodeURIComponent("Email is required")
    );
  }

  const supabase = await createServerSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
    options: {
      emailRedirectTo: `${siteUrl}/app/login?verified=true`,
    },
  });

  if (error) {
    redirect(
      "/app/verify-email?email=" +
        encodeURIComponent(email) +
        "&error=" +
        encodeURIComponent(error.message)
    );
  }

  redirect(
    "/app/verify-email?email=" +
      encodeURIComponent(email) +
      "&message=" +
      encodeURIComponent("Verification email sent. Please check your inbox.")
  );
}

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = getSafeNext(formData);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!email) {
    redirect(
      "/app/login?error=" +
        encodeURIComponent("Please enter your email address.") +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  const supabase = await createServerSupabaseClient();

  // Supabase will send the user to this URL after they click the email link.
  // We'll handle setting the new password on that page.
  const redirectTo = `${siteUrl.replace(/\/$/, "")}/app/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirect(
      "/app/login?error=" +
        encodeURIComponent(error.message) +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  // Back to login with a friendly message (no new UI required)
  redirect(
    "/app/login?message=" +
      encodeURIComponent("Reset link sent. Please check your inbox.") +
      "&next=" +
      encodeURIComponent(next)
  );
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
