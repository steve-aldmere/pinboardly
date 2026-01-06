"use server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function updatePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/app/account?error=" + encodeURIComponent("All password fields are required."));
  }

  if (newPassword !== confirmPassword) {
    redirect("/app/account?error=" + encodeURIComponent("New passwords do not match."));
  }

  if (newPassword.length < 6) {
    redirect("/app/account?error=" + encodeURIComponent("New password must be at least 6 characters."));
  }

  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/login");
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email!,
    password: currentPassword,
  });

  if (signInError) {
    redirect("/app/account?error=" + encodeURIComponent("Current password is incorrect."));
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    redirect("/app/account?error=" + encodeURIComponent(updateError.message));
  }

  redirect("/app/account?success=" + encodeURIComponent("Password updated successfully."));
}



