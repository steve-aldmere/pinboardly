import { createSupabaseServerClient } from "@/lib/supabase/server";
import TopNavClient from "./TopNavClient";

export default async function TopNav() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <TopNavClient
      user={user ? { id: user.id, email: user.email } : null}
    />
  );
}