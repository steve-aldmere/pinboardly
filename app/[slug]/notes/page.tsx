import { notFound } from "next/navigation";
import Link from "next/link";
import NotesClient from "./NotesClient";
import { getPublicPinboard } from "@/lib/pinboard-public";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type NotePin = {
  id: string;
  title: string | null;
  body_markdown: string;
};

export default async function NotesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await getPublicPinboard(slug);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();

    // inactive
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Pinboard Unavailable</h1>
          <p className="text-muted-foreground mb-6">
            This pinboard needs an active subscription to stay live.
          </p>
          <Link href={`/${slug}`} className="text-primary hover:text-primary">
            ← Back to overview
          </Link>
        </div>
      </div>
    );
  }

  const pinboard = result.pinboard;

  const supabase = await createServerSupabaseClient();

  // Fetch notes (max 50)
  const { data: notes } = await supabase
    .from("note_pins")
    .select("*")
    .eq("pinboard_id", pinboard.id)
    .order("sort_order", { ascending: true })
    .limit(50);

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href={`/${slug}`} className="text-sm text-primary hover:text-primary">
            ← Back to overview
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">{pinboard.title}</h1>
        <h2 className="text-2xl font-semibold text-muted-foreground mb-8">Notes</h2>

        <NotesClient notes={(notes as NotePin[]) || []} />
      </div>
    </div>
  );
}
