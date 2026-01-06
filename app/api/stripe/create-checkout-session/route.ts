import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, pinboardSlug } = body;

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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancel`,
      client_reference_id: pinboardSlug,
      metadata: {
        pinboard_slug: pinboardSlug,
        plan,
      },
      subscription_data: {
        metadata: {
          pinboard_slug: pinboardSlug,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error && error.name === "StripeError") {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON with 'plan' field." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while creating checkout session" },
      { status: 500 }
    );
  }
}

