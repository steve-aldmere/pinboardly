import { NextResponse } from "next/server";
import Stripe from "stripe";

async function pickBestCustomerForEmail(stripe: Stripe, email: string) {
  const customers = await stripe.customers.list({ email, limit: 100 });

  if (!customers.data.length) return null;
  if (customers.data.length === 1) return customers.data[0];

  const scored = await Promise.all(
    customers.data.map(async (c) => {
      const subs = await stripe.subscriptions.list({
        customer: c.id,
        status: "all",
        limit: 100,
      });

      const created =
        typeof c.created === "number" ? c.created : 0;

      return { customer: c, subCount: subs.data.length, created };
    })
  );

  scored.sort((a, b) => {
    if (b.subCount !== a.subCount) return b.subCount - a.subCount;
    return b.created - a.created;
  });

  return scored[0].customer;
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, pinboardSlug, ownerUserId, title, customerEmail } = body;

    // Validate plan
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'monthly' or 'yearly'" },
        { status: 400 }
      );
    }

    // Validate pinboardSlug
    if (!pinboardSlug || typeof pinboardSlug !== "string" || pinboardSlug.trim() === "") {
      return NextResponse.json(
        { error: "pinboardSlug is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate ownerUserId
    if (!ownerUserId || typeof ownerUserId !== "string" || ownerUserId.trim() === "") {
      return NextResponse.json(
        { error: "ownerUserId is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate title
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Optional: customerEmail
    const email =
      typeof customerEmail === "string" && customerEmail.trim() !== ""
        ? customerEmail.trim()
        : null;

    // Get priceId from environment variables
    const priceId =
      plan === "monthly"
        ? process.env.STRIPE_PRICE_MONTHLY
        : process.env.STRIPE_PRICE_YEARLY;

    if (!priceId) {
      return NextResponse.json(
        { error: `Environment variable STRIPE_PRICE_${plan.toUpperCase()} is not set` },
        { status: 500 }
      );
    }

    // Validate Stripe secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    // Validate APP_URL
    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      return NextResponse.json(
        { error: "APP_URL environment variable is not set" },
        { status: 500 }
      );
    }

    // Create Stripe client
    const stripe = new Stripe(stripeSecretKey);

    const subscriptionDescription = `Pinboardly: ${title} (${pinboardSlug})`;

    // If we have an email, reuse an existing customer to avoid duplicate customers-per-email.
    let existingCustomerId: string | null = null;
    if (email) {
      const bestCustomer = await pickBestCustomerForEmail(stripe, email);
      if (bestCustomer) existingCustomerId = bestCustomer.id;
    }

    // Create checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        allow_promotion_codes: true,
        payment_method_collection: "always",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/billing/cancel`,
        client_reference_id: pinboardSlug,

        ...(existingCustomerId ? { customer: existingCustomerId } : {}),
        ...(!existingCustomerId && email ? { customer_email: email } : {}),

        metadata: {
          pinboard_slug: pinboardSlug,
          owner_user_id: ownerUserId,
          title,
          plan,
        },
        subscription_data: {
          description: subscriptionDescription,
          metadata: {
            pinboard_slug: pinboardSlug,
            owner_user_id: ownerUserId,
            title,
          },
        },
      });
    } catch (e) {
      return NextResponse.json(
        { error: "create-checkout-session failed", detail: e instanceof Error ? e.message : String(e) },
        { status: 500 }
      );
    }

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error && error.name === "StripeError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "An error occurred while creating checkout session" },
      { status: 500 }
    );
  }
}
