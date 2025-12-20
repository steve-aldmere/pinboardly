import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import BoardsClient from "./BoardsClient";

export default async function BoardsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/login");
  }

  const { data: boards, error } = await supabase
    .from("boards")
    .select("id,title,description,board_type,is_public,slug,created_at,org_slug")
    .order("created_at", { ascending: true });

  return (
    <BoardsClient
      initialBoards={boards ?? []}
      initialError={error?.message ?? ""}
    />
  );
}
