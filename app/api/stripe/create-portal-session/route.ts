import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function pickBestCustomerForEmail(stripe: Stripe, email: string) {
  // Stripe can return multiple customers for the same email (especially if older code created new customers each checkout).
  const customers = await stripe.customers.list({ email, limit: 100 });

  if (!customers.data.length) return null;
  if (customers.data.length === 1) return customers.data[0];

  // Pick the customer with the most subscriptions (active or otherwise).
  // If there is a tie, pick the most recently created customer.
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
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      return NextResponse.json(
        { error: "APP_URL environment variable is not set" },
        { status: 500 }
      );
    }

    // Auth: current user
    const supabase = await createServerSupabaseClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = authData.user;
    const email = user.email;
    if (!email) {
      return NextResponse.json({ error: "No email found for user" }, { status: 400 });
    }

    // Optional returnUrl (default /app/account). Only allow same-origin relative paths.
    let returnUrl = `${appUrl}/app/account`;
    try {
      const body = await req.json();
      if (body?.returnUrl && typeof body.returnUrl === "string" && body.returnUrl.startsWith("/")) {
        returnUrl = `${appUrl}${body.returnUrl}`;
      }
    } catch {
      // Body is optional
    }

    const stripe = new Stripe(stripeSecretKey);

    const customer = await pickBestCustomerForEmail(stripe, email);

    if (!customer) {
      return NextResponse.json(
        { error: "No Stripe customer found for this account yet. Complete checkout once first." },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (e) {
    return NextResponse.json(
      { error: "create-portal-session failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
