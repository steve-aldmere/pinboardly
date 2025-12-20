// app/page.tsx
import { requireUser } from "@/lib/supabase-server";
import HomePageClient from "./HomePageClient";

export default async function Page() {
  await requireUser();
  return <HomePageClient />;
}
