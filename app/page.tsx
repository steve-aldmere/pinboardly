import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { PlausibleLink } from "./components/PlausibleTrack";

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  // If already signed in, go to dashboard
  if (data?.user) {
    redirect("/app/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top block: centred stacked logo only */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl justify-center px-6 py-10">
          <Link href="/" aria-label="Pinboardly home">
            <img
              src="/pinboardly-icon2.svg"
              alt="Pinboardly"
              className="h-32 w-32"
            />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-5xl px-6 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
              A simple public pinboard for links, notes and events.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Share one clean page with the essentials. No clutter, no feeds, no
              fuss. Perfect for groups, teams, projects, or your own personal hub.
            </p>

            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <PlausibleLink
                href="/app/pinboards/new"
                event="home_create_click"
                className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign in to create your pinboard
              </PlausibleLink>

              <PlausibleLink
                href="/demo-board"
                event="home_demo_click"
                className="rounded-lg border border-gray-200 px-5 py-3 text-center text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                View the demo pinboard
              </PlausibleLink>

              <Link
                href="/app/login"
                className="py-2 text-center text-sm font-medium text-gray-600 hover:text-gray-900 sm:py-0"
              >
                Sign in / Sign up
              </Link>
            </div>

            {/* Expectation setting */}
            <div className="mt-4 space-y-1">
              <p className="text-xs text-gray-500">
                Sign in is required to create and manage a pinboard.
              </p>
              <p className="text-xs text-gray-500">No sign in needed to view the demo.</p>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              You choose your address once. Your pinboard stays live while your
              subscription is active.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-6 pb-14">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">Links</h2>
              <p className="mt-2 text-sm text-gray-600">
                Share the important URLs with short descriptions, all in one place.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
              <p className="mt-2 text-sm text-gray-600">
                Post updates, guidance or key info. Supports simple formatting.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">Events</h2>
              <p className="mt-2 text-sm text-gray-600">
                Keep dates visible, with optional times, locations and descriptions.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <div className="grid gap-8 md:grid-cols-2 md:items-start">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Straightforward pricing
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Each pinboard has its own subscription. That keeps things simple if you
                  want separate pinboards for different groups or projects.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-semibold text-gray-900">Yearly</div>
                  <div className="text-sm text-gray-600">£79 / year</div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-sm font-semibold text-gray-900">Monthly</div>
                  <div className="text-sm text-gray-600">£9.99 / month</div>
                </div>

                <div className="mt-5">
                  <PlausibleLink
                    href="/app/pinboards/new"
                    event="home_create_click"
                    props={{ location: "pricing" }}
                    className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Create a pinboard
                  </PlausibleLink>
                  <p className="mt-3 text-xs text-gray-500">
                    You’ll be taken to secure checkout to confirm your subscription. You can cancel any time.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <PlausibleLink
                href="/demo-board"
                event="home_demo_click"
                props={{ location: "footer" }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Not sure yet? View the demo →
              </PlausibleLink>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="text-xs text-gray-500">© {new Date().getFullYear()} Pinboardly</div>
              <div className="flex gap-4">
                <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-700">
                  Terms
                </Link>
                <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-700">
                  Privacy
                </Link>
                <Link href="/support" className="text-xs text-gray-500 hover:text-gray-700">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
