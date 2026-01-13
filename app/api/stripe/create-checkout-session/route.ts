import { NextResponse } from "next/server";
import Stripe from "stripe";

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
        {
          error: `Environment variable STRIPE_PRICE_${plan.toUpperCase()} is not set`,
        },
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
        ...(email ? { customer_email: email } : {}),
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
        {
          error: "create-checkout-session failed",
          detail: e instanceof Error ? e.message : String(e),
        },
        { status: 500 }
      );
    }

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error && error.name === "StripeError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while creating checkout session" },
      { status: 500 }
    );
  }
}
