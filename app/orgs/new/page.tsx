"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewOrgPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function createOrg(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const cleanName = name.trim();
    const cleanSlug = (slug.trim() ? slug.trim() : slugify(cleanName)).toLowerCase();

    if (!cleanName) {
      setErrorMsg("Please enter an org name.");
      return;
    }
    if (!cleanSlug) {
      setErrorMsg("Please enter an org slug.");
      return;
    }

    setLoading(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("orgs")
      .insert({
        name: cleanName,
        slug: cleanSlug,
      } as any);

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push(`/orgs/${cleanSlug}`);
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between">
        <Link href="/boards" className="text-sm underline">
          Back
        </Link>
      </div>

      <h1 className="mt-6 text-3xl font-semibold">Create an org</h1>
      <p className="mt-2 text-sm text-gray-600">
        You’ll be added as an admin automatically.
      </p>

      <form onSubmit={createOrg} className="mt-6 space-y-3">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slug.trim()) setSlug(slugify(e.target.value));
          }}
          placeholder="Org name (e.g. Tynemouth Sea Scouts)"
          className="w-full border rounded-lg p-3"
        />

        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Org slug (e.g. tynemouth-sea-scouts)"
          className="w-full border rounded-lg p-3"
        />

        {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create org"}
        </button>
      </form>
    </div>
  );
}
