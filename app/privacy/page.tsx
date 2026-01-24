import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: 17 January 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">
              What we collect
            </h2>
            <p className="mt-2">
              When you create an account, we collect your email address and basic
              account information. When you create a pinboard, we store the
              content you add (links, notes, and events) so it can be displayed
              publicly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Payments</h2>
            <p className="mt-2">
              Payments are handled by our payment provider. Pinboardly does not
              store your full card details.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              How we use your data
            </h2>
            <p className="mt-2">
              We use your data to provide and maintain the service, operate your
              pinboards, and manage your account. We may also use limited
              technical logs to diagnose issues and keep the service secure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Analytics</h2>
            <p className="mt-2">
              We use privacy-friendly analytics to understand basic usage of the
              site, such as page views and feature usage. This helps us improve
              Pinboardly.
            </p>
            <p className="mt-2">
              These analytics do not track you across other websites and do not
              collect personal information beyond basic usage data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Public content
            </h2>
            <p className="mt-2">
              Pinboards are designed to be public. Anything you publish to a
              pinboard may be viewed by anyone with the link, depending on the
              status of the pinboard and the settings available within the
              product.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Data retention
            </h2>
            <p className="mt-2">
              We retain account and pinboard data for as long as needed to
              provide the service. If you cancel, some data may remain for a
              limited period in backups or for operational and legal reasons.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Contact</h2>
            <p className="mt-2">
              If you have questions about this privacy policy, please contact us
              via the{" "}
              <Link
                href="/support"
                className="font-medium text-primary hover:text-primary"
              >
                Support
              </Link>{" "}
              page.
            </p>
          </section>

          <section className="pt-6 border-t border-border text-xs text-muted-foreground">
            <p>
              Pinboardly is operated by <strong>Aldmere Ltd</strong>, a company
              registered in England and Wales (Company No. 16961004).
            </p>
            <p className="mt-1">
              Registered office: Shiremoor, North Tyneside, United Kingdom.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
