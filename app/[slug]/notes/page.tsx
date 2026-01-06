import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import NotesClient from "./NotesClient";

type Pinboard = {
  id: string;
  slug: string;
  title: string;
  status: string;
};

type NotePin = {
  id: string;
  title: string | null;
  body_markdown: string;
};

export default async function NotesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: pinboard } = await supabase
    .from("pinboards")
    .select("id, slug, title, status")
    .eq("slug", slug)
    .single();

  if (!pinboard) {
    notFound();
  }

  if (pinboard.status === "expired") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">{pinboard.title}</h1>
          <p className="text-gray-600 mb-6">This pinboard needs an active subscription to stay live.</p>
          <Link href={`/${slug}`} className="text-blue-600 hover:text-blue-700">
            ← Back to overview
          </Link>
        </div>
      </div>
    );
  }

  if (pinboard.status === "removed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Pinboard Removed</h1>
          <p className="text-gray-600">This pinboard has been removed by its owner.</p>
        </div>
      </div>
    );
  }

  if (pinboard.status === "suspended") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Pinboard Suspended</h1>
          <p className="text-gray-600">This pinboard is currently unavailable.</p>
        </div>
      </div>
    );
  }

  // Fetch notes (max 50)
  const { data: notes } = await supabase
    .from("note_pins")
    .select("*")
    .eq("pinboard_id", pinboard.id)
    .order("sort_order", { ascending: true })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href={`/${slug}`} className="text-sm text-blue-600 hover:text-blue-700">
            ← Back to overview
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">{pinboard.title}</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-8">Notes</h2>

        <NotesClient notes={notes || []} />
      </div>
    </div>
  );
}

