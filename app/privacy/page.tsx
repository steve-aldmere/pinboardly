import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-base font-semibold text-gray-900">What we collect</h2>
            <p className="mt-2">
              When you create an account, we collect your email address and basic account information.
              When you create a pinboard, we store the content you add (links, notes, events) so it can be displayed.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">Payments</h2>
            <p className="mt-2">
              Payments are handled by our payment provider. We do not store your full card details on Pinboardly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">How we use your data</h2>
            <p className="mt-2">
              We use your data to provide the service, maintain your account, and operate your pinboards.
              We may also use technical logs to diagnose issues and keep the service secure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">Analytics</h2>
            <p className="mt-2">
              We use privacy-friendly analytics to understand basic usage of the site, such as
              page views and which buttons are clicked. This helps us improve Pinboardly.
            </p>
            <p className="mt-2">
              These analytics do not use cookies, do not track you across sites, and do not
              collect personal information.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">Public content</h2>
            <p className="mt-2">
              Pinboards are designed to be public. Anything you publish to a pinboard may be viewed by anyone
              with the link, depending on your pinboard status and settings within the product.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">Data retention</h2>
            <p className="mt-2">
              We retain account and pinboard data for as long as needed to provide the service. If you cancel,
              some data may remain for a period in backups or for operational reasons.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">Contact</h2>
            <p className="mt-2">
              For privacy questions, please contact us via the{" "}
              <Link href="/support" className="font-medium text-blue-600 hover:text-blue-700">
                Support
              </Link>{" "}
              page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
