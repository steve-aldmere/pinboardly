"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";

type OrgMemberRow = {
  user_id: string;
  role: string | null;
  created_at: string;
};

export default function OrgClient({ slug }: { slug: string }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [members, setMembers] = useState<OrgMemberRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.replace(`/login?next=${encodeURIComponent(`/orgs/${slug}`)}`);
        return;
      }

      // Fetch members (RLS decides what you are allowed to see)
      const { data, error } = await supabase
        .from("org_members")
        .select("user_id,role,created_at")
        .eq("org_slug", slug)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        setErr(error.message);
        setMembers([]);
      } else {
        setMembers((data ?? []) as OrgMemberRow[]);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router, slug, supabase]);

  if (loading) {
    return <p className="p-6 text-sm text-gray-600">Loading org...</p>;
  }

  if (err) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{err}</p>
        <div className="mt-4">
          <Link href="/orgs/${slug}" className="underline text-sm">
            Back to boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between">
        <Link href="/orgs/${slug}" className="underline text-sm">
          Back to boards
        </Link>
        <span className="text-sm text-gray-600">Org</span>
      </div>

      <h1 className="mt-4 text-3xl font-semibold">{slug}</h1>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Members</h2>
        {members.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">No members visible.</p>
        ) : (
          <div className="mt-4 grid gap-2">
            {members.map((m) => (
              <div key={m.user_id} className="rounded border p-3">
                <div className="font-mono text-xs text-gray-600">
                  {m.user_id}
                </div>
                <div className="text-sm">
                  Role: <span className="font-semibold">{m.role ?? "member"}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Joined: {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
