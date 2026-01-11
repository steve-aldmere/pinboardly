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
  const plan = String(formData.get("plan") ?? "yearly").trim(); // Default to yearly

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

  // Check if slug already exists
  const { data: existingPinboard } = await supabase
    .from("pinboards")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existingPinboard) {
    redirect("/app/pinboards/new?error=" + encodeURIComponent("That address is already in use. Please try another."));
  }

  // Check if admin
  const admin = isAdminEmail(userData.user.email);

  // Guardrail: Payment required for non-admins
  if (!admin) {
    // For non-admins, create Stripe checkout session instead of inserting
    // Validate plan
    if (plan !== "monthly" && plan !== "yearly") {
      redirect("/app/pinboards/new?error=" + encodeURIComponent("Invalid plan. Please select monthly or yearly."));
    }

    try {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const response = await fetch(`${appUrl}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          pinboardSlug: slug,
          ownerUserId: userData.user.id,
          title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        redirect("/app/pinboards/new?error=" + encodeURIComponent(errorData.error || "Failed to create checkout session. Please try again."));
      }

      const { url } = await response.json();
      if (url) {
        redirect(url);
      } else {
        redirect("/app/pinboards/new?error=" + encodeURIComponent("Failed to create checkout session. Please try again."));
      }
    } catch (error) {
      redirect("/app/pinboards/new?error=" + encodeURIComponent("Something went wrong. Please try again."));
    }
    return; // Should not reach here, but TypeScript safety
  }

  // Admin flow: still allow direct creation for admins
  const now = new Date();
  const paidUntil = "2030-12-31T23:59:59Z";

  // Insert pinboard for admin
  const { data: pinboard, error } = await supabase
    .from("pinboards")
    .insert({
      owner_user_id: userData.user.id,
      slug: slug,
      title: title,
      status: "active",
      trial_ends_at: null,
      paid_until: paidUntil,
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate slug error (should not happen due to check above, but handle gracefully)
    if (error.code === "23505") {
      redirect("/app/pinboards/new?error=" + encodeURIComponent("That address is already in use. Please try another."));
    }
    redirect("/app/pinboards/new?error=" + encodeURIComponent("Something went wrong. Please try again."));
  }

  // Success! Redirect to edit page
  redirect(`/app/pinboards/${pinboard.id}/edit`);
}