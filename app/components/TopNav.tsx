import Link from "next/link";
import Image from "next/image";

export default function TopNav() {
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
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
