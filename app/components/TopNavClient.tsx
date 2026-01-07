"use client";
import Link from "next/link";
import Image from "next/image";

export default function TopNavClient({
  user,
}: {
  user: { id: string; email?: string | null } | null;
}) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/pinboardly-wordmark.svg"
            alt="Pinboardly"
            width={180}
            height={32}
            priority
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link href="/app/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/app/account" className="hover:underline">
                Account
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="hover:underline">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/app/login" className="hover:underline">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

