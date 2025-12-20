// app/login/page.tsx
import { requireNoUser } from "@/lib/supabase-server";
import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await requireNoUser();
  return <LoginClient searchParams={searchParams} />;
}
