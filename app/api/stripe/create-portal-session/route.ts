import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY environment variable is not set" }, { status: 500 });
    }

    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "APP_URL environment variable is not set" }, { status: 500 });
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

    // Find Stripe customer by email.
    // (Later we can store stripe_customer_id in Supabase to avoid email lookup.)
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

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
