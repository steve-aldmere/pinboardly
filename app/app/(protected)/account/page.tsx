import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import AccountClient from "./AccountClient";
import ManageSubscriptionButton from "./ManageSubscriptionButton";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/login");
  }

  const email = userData.user.email || "";
  const isEmailVerified = !!userData.user.email_confirmed_at;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/app/dashboard" className="text-sm text-primary hover:text-primary">
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-semibold mb-8">Account Settings</h1>

        <div className="space-y-4 mb-6">
          <ManageSubscriptionButton />

          <div className="rounded-lg border border-border bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Subscriptions are managed securely by Stripe. Each pinboard has its own subscription, so if you have more
              than one pinboard you may see multiple subscriptions in Stripe. You can manage or cancel any subscription
              at any time.
            </p>
          </div>
        </div>

        <AccountClient
          email={email}
          isEmailVerified={isEmailVerified}
          error={params.error}
          success={params.success}
        />
      </div>
    </div>
  );
}
