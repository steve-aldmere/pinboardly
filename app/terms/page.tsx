import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-gray-600">Last updated: 17 January 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-base font-semibold text-gray-900">
              1. About Pinboardly
            </h2>
            <p className="mt-2">
              Pinboardly is a subscription service that lets you publish a simple public pinboard
              for notes, links and events.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">2. Accounts</h2>
            <p className="mt-2">
              You are responsible for your account credentials and for all activity under your account.
              Please keep your login details secure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">
              3. Subscriptions and billing
            </h2>
            <p className="mt-2">
              Subscriptions renew automatically until cancelled. You can manage or cancel your subscription
              at any time from your account page. Payments are processed by our payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">4. Your content</h2>
            <p className="mt-2">
              You are responsible for the content you publish to your pinboard. Please do not post anything
              unlawful, harmful, or that infringes the rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">5. Availability</h2>
            <p className="mt-2">
              We aim to keep Pinboardly available and reliable, but we do not guarantee uninterrupted service.
              We may update or change parts of the service over time.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">
              6. Limitation of liability
            </h2>
            <p className="mt-2">
              To the maximum extent permitted by law, Pinboardly is provided on an “as is” basis and we are not
              liable for loss of data, loss of profits, or indirect damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">7. Contact</h2>
            <p className="mt-2">
              If you have questions about these terms, please contact us via the{" "}
              <Link
                href="/support"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Support
              </Link>{" "}
              page.
            </p>
          </section>

          <section className="pt-2">
            <h2 className="text-base font-semibold text-gray-900">Company details</h2>
            <p className="mt-2 text-gray-600">
              Pinboardly is a product of Aldmere Ltd. Company number: 16961004. Registered office:
              2 Deleval Crescent, Shiremoor, NE27 0FA.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
