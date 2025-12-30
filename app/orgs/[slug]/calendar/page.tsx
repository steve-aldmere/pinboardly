// app/orgs/[slug]/calendar/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getOrgBySlug } from "../org";

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

  // Find the calendar board for this org
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
        <p className="text-gray-600 mt-2">
          No calendar board found for this organisation yet.
        </p>
      </main>
    );
  }

  // Fetch calendar pins (events)
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
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <Link className="underline text-sm" href={`/orgs/${slug}`}>
          Back
        </Link>
      </div>

      <p className="text-gray-600 mt-2">Organisation: {org.name}</p>

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

            return (
              <div key={p.id} className="border rounded-lg p-4">
                <div className="font-medium">{dateLabel}</div>
                {p.content ? (
                  <div className="mt-1 text-sm whitespace-pre-wrap">
                    {p.content}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
