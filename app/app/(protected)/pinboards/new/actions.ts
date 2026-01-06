"use server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";

// Reserved slugs per spec Section 3.3
const RESERVED_SLUGS = [
  "_next",
  "api",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "app",
  "pricing",
  "terms",
  "privacy",
  "support",
];

export async function createPinboardAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();

  // Validation
  if (!title || title.length > 80) {
    redirect("/app/pinboards/new?error=" + encodeURIComponent("Invalid pinboard title."));
  }

  if (!slug || slug.length > 40) {
    redirect("/app/pinboards/new?error=" + encodeURIComponent("Invalid slug."));
  }

  // Check slug format (spec Section 6.1)
  const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
  if (!slugRegex.test(slug)) {
    redirect("/app/pinboards/new?error=" + encodeURIComponent("That address isn't valid. Use letters, numbers, and dashes only."));
  }

  // Check reserved slugs
  if (RESERVED_SLUGS.includes(slug)) {
    redirect("/app/pinboards/new?error=" + encodeURIComponent("That address is reserved. Please try another."));
  }

  // Check if admin
  const admin = isAdminEmail(userData.user.email);

  // Determine status and dates
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  let status: string;
  let paidUntil: string | null = null;

  if (admin) {
    // Admin gets active status with far future paid_until
    status = "active";
    paidUntil = "2030-12-31T23:59:59Z";
  } else {
    // Regular users get trial
    status = "trial";
  }

  // Insert pinboard
  const { data: pinboard, error } = await supabase
    .from("pinboards")
    .insert({
      owner_user_id: userData.user.id,
      slug: slug,
      title: title,
      status: status,
      trial_ends_at: admin ? null : trialEndsAt.toISOString(),
      paid_until: paidUntil,
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate slug error
    if (error.code === "23505") {
      redirect("/app/pinboards/new?error=" + encodeURIComponent("That address is already in use. Please try another."));
    }
    redirect("/app/pinboards/new?error=" + encodeURIComponent("Something went wrong. Please try again."));
  }

  // Success! Redirect to edit page
  redirect(`/app/pinboards/${pinboard.id}/edit`);
}