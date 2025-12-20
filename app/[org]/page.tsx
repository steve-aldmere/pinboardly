import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import OrgBoardsClient from "./OrgBoardsClient";

export default async function OrgPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .select("*")
    .eq("slug", orgSlug)
    .single();

  if (orgErr || !org) notFound();

  return <OrgBoardsClient org={org} />;
}
