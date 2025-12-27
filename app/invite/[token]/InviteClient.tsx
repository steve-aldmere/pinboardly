"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function InviteClient({ token }: { token: string }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [msg, setMsg] = useState("Redeeming invite...");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setMsg("Redeeming invite...");
      setErrorMsg("");

      const { data: userData } = await supabase.auth.getUser();
if (!userData?.user) {
  setErrorMsg("You appear to be signed out in this browser session. Please sign in, then reopen the invite link.");
  setMsg("Not signed in.");
  return;
}

      const { data, error } = await supabase.rpc("redeem_org_invite", {
        p_token: token,
      });

      if (cancelled) return;

      if (error) {
        setErrorMsg(error.message);
        setMsg("Invite failed.");
        return;
      }

      // Expect RPC returns org slug as text, e.g. "test-org-2"
      const orgSlug = typeof data === "string" ? data.replaceAll('"', "") : "";
      if (!orgSlug) {
        setErrorMsg("Invite redeemed but org slug missing from RPC result.");
        setMsg("Invite failed.");
        return;
      }

      setMsg("Invite redeemed. Redirecting...");
      router.replace(`/orgs/${orgSlug}`);
      router.refresh();
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase, token]);

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold">Join org</h1>
      <p className="mt-4 text-sm text-gray-600">{msg}</p>
      {errorMsg ? <p className="mt-4 text-sm text-red-600">{errorMsg}</p> : null}
    </div>
  );
}
