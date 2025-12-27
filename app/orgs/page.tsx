import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function OrgsIndexPage() {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  const isLoggedIn = !!userData?.user;

  const { data: orgs, error } = await supabase
    .from("orgs")
    .select("slug,name,description,is_public")
    .order("name", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 pb-20">
      <h1 className="text-3xl font-semibold mb-6">Organisations</h1>

      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}

      <div className="flex gap-3 text-sm mb-6">
  {isLoggedIn ? (
    <p className="text-gray-600">
      Joining an organisation is invite-only.
    </p>
  ) : (
    <Link className="underline" href="/login">
      Sign in
    </Link>
  )}
</div>

      {!orgs || orgs.length === 0 ? (
        <p className="text-gray-600">No organisations yet.</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((o: any) => (
            <div key={o.slug} className="border rounded-lg p-4">
              <div className="font-medium">{o.name ?? o.slug}</div>
              <div className="text-sm text-gray-600">
                {o.is_public ? "Public" : "Private"}
              </div>
              {o.description ? (
                <div className="text-sm text-gray-700 mt-1">{o.description}</div>
              ) : null}
              <div className="mt-2 text-sm">
                <Link className="underline" href={`/${o.slug}`}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
