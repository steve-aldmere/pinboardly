// app/page.tsx
import { requireUser } from "@/lib/supabase-server";
import HomePageClient from "./HomePageClient.tsx";

export default async function Page() {
  await requireUser();
  return <HomePageClient />;
}
