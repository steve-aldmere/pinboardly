import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { restorePinboardAction } from "../pinboards/[pinboardId]/edit/actions";
import UpgradeButton from "./UpgradeButton";

type Pinboard = {
  id: string;
  slug: string;
  title: string;
  status: string;
  trial_ends_at: string | null;
  paid_until: string | null;
  created_at: string;
  removed_at: string | null;
  restore_until: string | null;
  stripe_subscription_id: string | null;
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Require login
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/login");
  }

  // Get user's pinboards
  const { data: pinboards, error } = await supabase
    .from("pinboards")
    .select(
      "id, slug, title, status, trial_ends_at, paid_until, created_at, removed_at, restore_until, stripe_subscription_id"
    )
    .eq("owner_user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .returns<Pinboard[]>();

  const userPinboards = pinboards ?? [];

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Your Pinboards</h1>
        </div>

        {error && <p className="mb-6 text-sm text-red-600">{error.message}</p>}

        {/* Create New Pinboard Button */}
        <div className="mb-6">
          <Link
            href="/app/pinboards/new"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary"
          >
            Create New Pinboard
          </Link>
        </div>

        {/* Pinboards List */}
        {userPinboards.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">You haven't created any pinboards yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first pinboard to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPinboards.map((board) => {
              const isActive = board.status === "trial" || board.status === "active";
              const isRemoved = board.status === "removed";
              const statusColor =
                board.status === "active"
                  ? "text-green-600"
                  : board.status === "trial"
                  ? "text-primary"
                  : board.status === "expired"
                  ? "text-orange-600"
                  : board.status === "removed"
                  ? "text-muted-foreground"
                  : "text-muted-foreground";

              return (
                <div
                  key={board.id}
                  className={`rounded-lg border p-6 ${
                    isRemoved ? "bg-muted border-border opacity-75" : "bg-white border-border"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className={`text-lg font-medium ${isRemoved ? "text-muted-foreground" : ""}`}>
                          {board.title}
                        </h2>
                        {isRemoved ? (
                          <span className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground rounded">
                            Removed
                          </span>
                        ) : (
                          <span className={`text-xs font-medium ${statusColor}`}>{board.status}</span>
                        )}
                      </div>
                      <p className={`mt-1 text-sm ${isRemoved ? "text-muted-foreground" : "text-muted-foreground"}`}>
                        pinboardly.com/{board.slug}
                      </p>
                      {board.status === "trial" && board.trial_ends_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Trial ends {new Date(board.trial_ends_at).toLocaleDateString()}
                        </p>
                      )}
                      {board.status === "active" && board.paid_until && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Paid until {new Date(board.paid_until).toLocaleDateString()}
                        </p>
                      )}
                      {isRemoved && board.restore_until && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Can restore until {new Date(board.restore_until).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!board.stripe_subscription_id && !isRemoved && (
                        <UpgradeButton
                          slug={board.slug}
                          title={board.title}
                          ownerUserId={userData.user.id}
                          customerEmail={userData.user.email ?? null}
                        />
                      )}
                      {isActive && !isRemoved && (
                        <Link
                          href={`/${board.slug}`}
                          className="text-sm text-primary hover:text-primary"
                          target="_blank"
                        >
                          View
                        </Link>
                      )}
                      {isRemoved ? (
                        <form action={restorePinboardAction}>
                          <input type="hidden" name="pinboardId" value={board.id} />
                          <button type="submit" className="text-sm text-primary hover:text-primary">
                            Restore
                          </button>
                        </form>
                      ) : (
                        <Link
                          href={`/app/pinboards/${board.id}/edit`}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
