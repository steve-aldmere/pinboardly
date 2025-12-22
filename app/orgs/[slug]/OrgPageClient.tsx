"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type Org = {
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
};

export default function OrgPageClient({ slug }: { slug: string }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg("");

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orgs")
        .select("slug,name,description,logo_url,primary_color,accent_color")
        .eq("slug", slug)
        .single();

      if (error) {
        setOrg(null);
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setOrg(data as Org);
      setLoading(false);
    }

    load();
  }, [slug, supabase, router]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between">
        <Link href="/boards" className="text-sm underline">
          Back
        </Link>
        <Link href="/orgs/new" className="text-sm underline">
          New org
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">Loading org...</p>
      ) : errorMsg ? (
        <div className="mt-6">
          <h1 className="text-2xl font-semibold">Error</h1>
          <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
        </div>
      ) : !org ? (
        <p className="mt-6 text-sm text-gray-600">Org not found.</p>
      ) : (
        <div className="mt-6">
          <h1 className="text-3xl font-semibold">{org.name}</h1>
          <p className="mt-2 text-sm text-gray-600">/{org.slug}</p>

          {org.description ? (
            <p className="mt-4">{org.description}</p>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No description.</p>
          )}

          <div className="mt-8 rounded border p-4 text-sm text-gray-600">
            Next step: list this org’s boards and let admins create org boards.
          </div>
        </div>
      )}
    </div>
  );
}
