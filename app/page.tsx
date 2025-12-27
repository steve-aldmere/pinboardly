import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  // If already signed in, skip the landing page
  if (data?.user) {
    redirect("/orgs");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <Link href="/login" aria-label="Go to sign in">
        <img
          src="/pinboardly-icon2.svg"
          alt="Pinboardly"
          className="w-[220px] h-[220px]"
        />
      </Link>

      <Link
        href="/login"
        className="text-sm underline text-gray-600"
      >
        Sign in
      </Link>
    </div>
  );
}
