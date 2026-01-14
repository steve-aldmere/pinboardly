"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function TopNavClient({
  user,
}: {
  user: { id: string; email?: string | null } | null;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Pinboardly home">
          <Image
            src="/pinboardly-wordmark.svg"
            alt="Pinboardly"
            width={180}
            height={32}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
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

        {/* Mobile menu */}
        <div className="relative sm:hidden" ref={menuRef}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Menu
                <span className="ml-2 text-gray-500">{open ? "▲" : "▼"}</span>
              </button>

              {open ? (
                <div
                  role="menu"
                  aria-label="Account menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
                >
                  <Link
                    href="/app/dashboard"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/app/account"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    Account
                  </Link>
                  <div className="border-t border-gray-100" />
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      role="menuitem"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : null}
            </>
          ) : (
            <Link
              href="/app/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
