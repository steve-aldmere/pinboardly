"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function TopNav() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function syncAuthState() {
      // getSession reads the local client session (fast)
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      // getUser validates with Supabase and can detect stale sessions
      const { data: userData } = await supabase.auth.getUser();
      const realUser = userData?.user;

      const user = realUser ?? sessionUser;

      if (!mounted) return;

      setIsLoggedIn(!!user);
      setEmail(user?.email ?? "");
    }

    syncAuthState();

    const { data } = supabase.auth.onAuthStateChange(() => {
      syncAuthState();
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase, pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Pinboardly
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/boards" className="underline">
            Boards
          </Link>

          <Link href="/orgs" className="underline">
            Orgs
          </Link>

          {isLoggedIn ? (
            <button onClick={signOut} className="underline">
              Sign out
            </button>
          ) : (
            <Link href="/login" className="underline">
              Sign in
            </Link>
          )}
        </nav>
      </div>

      {/* TEMP DEBUG STRIP: remove once confirmed */}
      
    </header>
  );
}
