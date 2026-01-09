cat > "app/[slug]/links/page.tsx" <<'EOF'
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicPinboard } from "@/lib/pinboard-public";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function LinksPage({
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Pinboard Unavailable</h1>
          <p className="text-gray-600 mb-6">
            This pinboard needs an active subscription to stay live.
          </p>
          <Link href={`/${slug}`} className="text-blue-600 hover:text-blue-700">
            ← Back to overview
          </Link>
        </div>
      </div>
    );
  }

  const pinboard = result.pinboard;

  const supabase = await createServerSupabaseClient();

  // Fetch links (max 50)
  const { data: links } = await supabase
    .from("link_pins")
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
        <h2 className="text-2xl font-semibold text-gray-600 mb-8">Links</h2>

        {!links || links.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No links yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              This pinboard doesn't have any links.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-medium mb-1">{link.title}</h3>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {link.url}
                </a>
                {link.description && (
                  <p className="text-sm text-gray-600 mt-2">{link.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
EOF
