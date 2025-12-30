import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function TopNav() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  const isLoggedIn = !!data?.user;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo / Wordmark */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/pinboardly-wordmark.svg"
            alt="Pinboardly"
            width={160}
            height={32}
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/orgs" className="hover:underline">
            Organisations
          </Link>

          {isLoggedIn ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="hover:underline">
                Sign out
              </button>
            </form>
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
