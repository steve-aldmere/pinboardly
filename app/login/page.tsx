import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase-server";
import HomePageClient from "./HomePageClient";

export default async function Page() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return <HomePageClient />;
}
