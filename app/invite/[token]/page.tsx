import { redirect, notFound } from "next/navigation";
import InviteClient from "./InviteClient";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) notFound();

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  // If not signed in, send them to login and bring them back to this invite URL
  if (!data?.user) redirect(`/login?next=/invite/${encodeURIComponent(token)}`);

  return <InviteClient token={token} />;
}
