import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;

  const next =
    typeof sp.next === "string" && sp.next.startsWith("/")
      ? sp.next
      : "/boards";

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  // If already signed in, go to next (or boards)
  if (data?.user) redirect(next);

  return <LoginClient error={sp.error} next={next} />;
}
