import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-foreground">
      {/* Top area: centred stacked logo only */}
      <header className="border-b border-border">
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

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-10">
        {/* Hero */}
        <div className="mt-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A public pinboard for notes, links and events
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            One simple public page you can share.
            <br />
            For yourself, your group, or anything you run.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3">
            <Link
              href="/demo-board"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary"
            >
              View the demo pinboard
            </Link>
            <p className="text-sm text-muted-foreground">
              See exactly how Pinboardly works before doing anything else.
            </p>
          </div>
        </div>

        {/* What it is */}
        <div className="mt-14 rounded-2xl border border-border bg-white p-6 text-center sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            What Pinboardly is
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Pinboardly replaces scattered links, old posts, and buried documents
            with one clear public pinboard.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Everything lives in one place, stays up to date, and is easy to
            share.
          </p>

          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-border p-5">
              <h3 className="font-semibold">Notes</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Share updates, guidance, or information that stays visible and
                easy to find.
              </p>
            </div>

            <div className="rounded-2xl border border-border p-5">
              <h3 className="font-semibold">Links</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Send people to the right place. Forms, documents, resources,
                websites.
              </p>
            </div>

            <div className="rounded-2xl border border-border p-5">
              <h3 className="font-semibold">Events</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Make dates obvious. With or without times and locations.
              </p>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Everything appears on one public pinboard you control.
          </p>
        </div>

        {/* How people use it */}
        <div className="mt-14 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            How people use it
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Pinboardly works wherever you need a single public source of truth.
          </p>

          <ul className="mx-auto mt-6 max-w-2xl space-y-2 text-left text-foreground">
            <li>• A personal pinboard with everything you want to share</li>
            <li>• A club, PTA, or committee pinboard</li>
            <li>• A community group or society</li>
            <li>• A project, campaign, or ongoing activity</li>
            <li>• Anything that benefits from one clear public page</li>
          </ul>

          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            No feeds. No algorithms. No distractions.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-14 rounded-2xl border border-border bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-center">
            How it works
          </h2>

          <ol className="mx-auto mt-5 max-w-2xl space-y-3 text-foreground">
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                1
              </span>
              <span className="mt-1">Create your pinboard</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                2
              </span>
              <span className="mt-1">Add notes, links and events</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                3
              </span>
              <span className="mt-1">Share one simple URL</span>
            </li>
          </ol>

          <p className="mt-6 text-center text-muted-foreground">That’s it.</p>
        </div>

        {/* Demo spotlight */}
        <div className="mt-14 rounded-2xl border border-border bg-muted p-6 text-center sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            See the demo pinboard
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            The demo shows a complete Pinboardly pinboard with notes, links and
            events, exactly as they appear in everyday use.
          </p>

          <div className="mt-6 flex flex-col items-center gap-2">
            <Link
              href="/demo-board"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary"
            >
              Open the demo pinboard
            </Link>
            <p className="text-sm text-muted-foreground">No account required.</p>
          </div>
        </div>

        {/* Philosophy */}
        <div className="mt-14 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Designed for clarity
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Pinboardly is designed to be calm, predictable, and easy to maintain
            over time.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            It’s a pinboard, not a social network.
          </p>
        </div>

        {/* Pricing */}
        <div className="mt-14 rounded-2xl border border-border bg-white p-6 text-center sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Pricing</h2>

          <div className="mt-4 text-foreground">
            <div className="text-lg font-semibold">£9 per month</div>
            <div className="mt-1 text-muted-foreground">or £79 per year</div>
          </div>

          <ul className="mx-auto mt-5 max-w-2xl space-y-2 text-left text-foreground">
            <li>• One public pinboard</li>
            <li>• Notes, links and events included</li>
            <li>• Up to 50 notes, 50 links and 100 events</li>
            <li>• Cancel anytime</li>
          </ul>

          <div className="mt-6 flex justify-center">
            <Link
              href="/app/pinboards/new"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-6 py-3 text-base font-semibold text-foreground hover:bg-muted"
            >
              Create your own pinboard
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 text-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-foreground">
              Support
            </Link>
            <span className="text-muted-foreground">support@pinboardly.com</span>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            © 2026 Pinboardly. A product of Aldmere Ltd.
          </div>
        </footer>
      </section>
    </main>
  );
}
