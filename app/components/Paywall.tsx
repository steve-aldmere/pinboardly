// app/components/Paywall.tsx
import Link from "next/link";

export default function Paywall({
  slug,
  ownerCanFix,
}: {
  slug: string;
  ownerCanFix?: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto mt-10 px-6 pb-20">
      <h1 className="text-3xl font-semibold">Pinboard inactive</h1>

      <p className="mt-4 text-gray-700">
        This Pinboard is no longer active. To keep your Pinboard and its URL, you need an active
        Pinboardly account.
      </p>

      <div className="mt-6 flex gap-4 text-sm">
        <Link className="underline" href="/orgs">
          Back to all Pinboards
        </Link>

        {ownerCanFix ? (
          <Link className="underline" href={`/login?next=${encodeURIComponent(`/orgs/${slug}`)}`}>
            Sign in to reactivate
          </Link>
        ) : null}
      </div>
    </div>
  );
}
