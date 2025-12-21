// app/login/page.tsx
import { requireNoUser } from "@/lib/supabase-server";
import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await requireNoUser();

  const error =
    typeof searchParams?.error === "string"
      ? searchParams.error
      : Array.isArray(searchParams?.error)
      ? searchParams?.error[0]
      : undefined;

  return <LoginClient error={error} />;
}
