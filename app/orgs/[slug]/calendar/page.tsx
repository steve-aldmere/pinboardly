// app/orgs/[slug]/calendar/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getOrgBySlug } from "../org";
import CalendarAddForm from "./CalendarAddForm";

type Pin = {
  id: string;
  content: string | null;
  event_date: string | null;
  created_at: string | null;
};

function Locked() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Subscription required</h1>
      <p className="text-gray-600 mt-2">
        This organisation’s boards are locked until a trial or paid subscription is active.
      </p>
    </main>
  );
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { org, isActive } = await getOrgBySlug(slug);
  if (!org) notFound();
  if (!isActive) return <Locked />;

  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  const isLoggedIn = !!userData?.user;

  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id")
    .eq("org_slug", slug)
    .eq("board_type", "calendar")
    .maybeSingle();

  if (boardError) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <p className="text-red-600 text-sm mt-2">{boardError.message}</p>
      </main>
    );
  }

  if (!board?.id) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <p className="text-gray-600 mt-2">No calendar board found.</p>
      </main>
    );
  }

  const { data: pins, error: pinsError } = await supabase
    .from("pins")
    .select("id,content,event_date,created_at")
    .eq("board_id", board.id)
    .order("event_date", { ascending: true });

  if (pinsError) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <p className="text-red-600 text-sm mt-2">{pinsError.message}</p>
      </main>
    );
  }

  const rows = (pins ?? []) as Pin[];

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <Link className="underline text-sm" href={`/orgs/${slug}`}>
          Back
        </Link>
      </div>

      <p className="text-gray-600 mt-2">Organisation: {org.name}</p>

      {isLoggedIn ? (
        <CalendarAddForm boardId={board.id} />
      ) : (
        <p className="mt-6 text-sm text-gray-600">
          <Link className="underline" href={`/login?next=/orgs/${slug}/calendar`}>
            Sign in
          </Link>{" "}
          to add events.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="text-gray-600 mt-6">No upcoming events.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((p) => {
            const dateLabel = p.event_date
              ? new Date(p.event_date).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No date";

            const raw = (p.content || "").trim();
            const parts = raw.split(/\n\s*\n/);
            const title = (parts[0] || "").trim();
            const details = parts.slice(1).join("\n\n").trim();

            return (
              <div key={p.id} className="border rounded-lg p-4">
                <div className="font-medium">
                  {dateLabel}
                  {title ? ` · ${title}` : ""}
                </div>
                {details ? (
                  <div className="mt-1 text-sm whitespace-pre-wrap">{details}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
