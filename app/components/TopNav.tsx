// app/components/TopNav.tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function TopNav() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  const isLoggedIn = !!data?.user;

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block border px-1 text-sm">B</span>
          Pinboardly
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/orgs" className="hover:underline">
            Boards
          </Link>

          {isLoggedIn ? (
            <Link href="/auth/signout" className="hover:underline">
              Sign out
            </Link>
          ) : (
            <Link href="/login" className="hover:underline">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
