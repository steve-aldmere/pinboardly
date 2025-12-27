"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function SignOutButton() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={signOut}
      disabled={busy}
      className="text-sm underline disabled:opacity-50"
    >
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
