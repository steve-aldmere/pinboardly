import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Top area: Sign in (small) + centred stacked logo */}
      <header className="border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-start justify-end">
            <Link
              href="/app"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/" aria-label="Pinboardly home">
              <img
                src="/pinboardly-icon2.svg"
                alt="Pinboardly"
                className="h-32 w-32"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-10">
        {/* Hero */}
        <div className="mt-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A virtual public notice board for links, notes and events
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            One simple public page you can share.
            <br />
            For yourself, your group, or anything you run.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3">
            <Link
              href="/demo-board"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800"
            >
              View the demo notice board
            </Link>
            <p className="text-sm text-slate-600">
              See exactly how Pinboardly works before doing anything else.
            </p>
          </div>
        </div>

        {/* What it is */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            What Pinboardly is
          </h2>
          <p className="mt-3 text-slate-700">
            Pinboardly replaces scattered links, old posts, and buried documents
            with one clear public notice board.
          </p>
          <p className="mt-2 text-slate-700">
            Everything lives in one place, stays up to date, and is easy to
            share.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold">Links</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Send people to the right place. Forms, documents, resources,
                websites.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold">Notes</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Share updates, guidance, or information that stays visible and
                easy to find.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold">Events</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Make dates obvious. With or without times and locations.
              </p>
            </div>
          </div>

          <p className="mt-6 text-slate-700">
            Everything appears on one public notice board you control.
          </p>
        </div>

        {/* How people use it */}
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">
            How people use it
          </h2>
          <p className="mt-3 text-slate-700">
            Pinboardly works wherever you need a single public source of truth.
          </p>

          <ul className="mt-5 space-y-2 text-slate-800">
            <li className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 rounded-full bg-slate-900"
                aria-hidden="true"
              />
              <span>
                A personal notice board with everything you want to share
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 rounded-full bg-slate-900"
                aria-hidden="true"
              />
              <span>A club, PTA, or committee notice board</span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 rounded-full bg-slate-900"
                aria-hidden="true"
              />
              <span>A community group or society</span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 rounded-full bg-slate-900"
                aria-hidden="true"
              />
              <span>A project, campaign, or ongoing activity</span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 rounded-full bg-slate-900"
                aria-hidden="true"
              />
              <span>Anything that benefits from one clear public page</span>
            </li>
          </ul>

          <p className="mt-6 text-slate-700">
            No feeds. No algorithms. No distractions.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>

          <ol className="mt-5 space-y-3 text-slate-800">
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                1
              </span>
              <span className="mt-1">Create your notice board</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                2
              </span>
              <span className="mt-1">Add links, notes and events</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                3
              </span>
              <span className="mt-1">Share one simple URL</span>
            </li>
          </ol>

          <p className="mt-6 text-slate-700">That’s it.</p>
        </div>

        {/* Demo spotlight */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            See the demo notice board
          </h2>
          <p className="mt-3 text-slate-700">
            The demo shows a complete Pinboardly notice board with links, notes
            and events, exactly as they appear in everyday use.
          </p>

          <div className="mt-6 flex flex-col items-start gap-2">
            <Link
              href="/demo-board"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800"
            >
              Open the demo notice board
            </Link>
            <p className="text-sm text-slate-600">No account required.</p>
          </div>
        </div>

        {/* Philosophy */}
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">
            Designed for clarity
          </h2>
          <p className="mt-3 text-slate-700">
            Pinboardly is designed to be calm, predictable, and easy to maintain
            over time.
          </p>
          <p className="mt-2 text-slate-700">
            It’s a notice board, not a social network.
          </p>
        </div>

        {/* Pricing (bottom, low emphasis) */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Pricing</h2>

          <div className="mt-4 text-slate-900">
            <div className="text-lg font-semibold">£9 per month</div>
            <div className="mt-1 text-slate-700">or £79 per year</div>
          </div>

          <ul className="mt-5 space-y-2 text-slate-800">
            <li className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 rounded-full bg-slate-900"
                aria-hidden="true"
              />
              <span>One public notice board</span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 rounded-full bg-slate-900"
                aria-hidden="true"
              />
              <span>Links, notes and events included</span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-2 h-2 w-2 rounded-full bg-slate-900"
                aria-hidden="true"
              />
              <span>Cancel anytime</span>
            </li>
          </ul>

          <div className="mt-6">
            <Link
              href="/app/pinboards/new"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50"
            >
              Create your own notice board
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-slate-900">
              Support
            </Link>
            <span className="text-slate-500">support@pinboardly.com</span>
          </div>

          <div className="mt-6 text-sm text-slate-600">
            <div>© 2026 Aldmere Ltd. All rights reserved.</div>
            <div>Pinboardly is a product of Aldmere Ltd.</div>
          </div>
        </footer>
      </section>
    </main>
  );
}
