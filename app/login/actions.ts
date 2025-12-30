"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "").trim();
  if (!next || !next.startsWith("/")) return "/orgs";
  return next;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  if (!email || !password) {
    redirect(
      "/login?error=" +
        encodeURIComponent("Enter email and password.") +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      "/login?error=" +
        encodeURIComponent(error.message) +
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
      "/login?error=" +
        encodeURIComponent("Enter email and password.") +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(
      "/login?error=" +
        encodeURIComponent(error.message) +
        "&next=" +
        encodeURIComponent(next)
    );
  }

  // If confirm-email is enabled, they must confirm then sign in.
  redirect(
    "/login?error=" +
      encodeURIComponent("Account created. Please sign in.") +
      "&next=" +
      encodeURIComponent(next)
  );
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
