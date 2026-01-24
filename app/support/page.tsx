import Link from "next/link";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:text-primary"
        >
          ← Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Support
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          If you need help with Pinboardly or have a question, get in touch and we’ll
          do our best to help.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-muted p-6">
          <p className="text-sm text-muted-foreground">
            Email:{" "}
            <a
              href="mailto:support@pinboardly.com"
              className="font-medium text-primary hover:text-primary"
            >
              support@pinboardly.com
            </a>
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            If your query relates to a specific pinboard, please include the
            pinboard URL and a brief description of the issue.
          </p>
        </div>
      </div>
    </main>
  );
}
