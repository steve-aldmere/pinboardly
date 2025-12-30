// app/orgs/[slug]/links/page.tsx
export default function LinksPage({
    params,
  }: {
    params: { slug: string };
  }) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Links</h1>
        <p className="text-gray-600 mt-2">
          Organisation: {params.slug}
        </p>
      </main>
    );
  }
  