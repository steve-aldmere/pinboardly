import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET environment variable is not set" },
        { status: 500 }
      );
    }

    // Read raw body as text
    const body = await req.text();

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Create Stripe client
    const stripe = new Stripe(stripeSecretKey);

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Determine pinboardSlug
      const pinboardSlug =
        session.metadata?.pinboardSlug ??
        session.metadata?.pinboard_slug ??
        session.client_reference_id ??
        null;

      if (!pinboardSlug) {
        console.debug("Ignored checkout.session.completed without pinboardSlug", {
          sessionId: session.id,
        });
        return NextResponse.json({ received: true });
      }

      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!customerId || !subscriptionId) {
        console.debug(
          "Ignored checkout.session.completed missing customerId/subscriptionId",
          {
            sessionId: session.id,
            customerId,
            subscriptionId,
          }
        );
        return NextResponse.json({ received: true });
      }

      // Retrieve subscription from Stripe
      const subRes = await stripe.subscriptions.retrieve(subscriptionId);
      const subscription = (
        "data" in subRes ? subRes.data : subRes
      ) as Stripe.Subscription;

      const currentPeriodEndIso =
        typeof (subscription as any).current_period_end === "number" &&
        Number.isFinite((subscription as any).current_period_end)
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null;

      // Update pinboard with subscription info
      const { error: updateError } = await supabase
        .from("pinboards")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: subscription.status,
          current_period_end: currentPeriodEndIso,
        })
        .eq("slug", pinboardSlug);

      if (updateError) {
        console.error("Error updating pinboard:", updateError);
        return NextResponse.json(
          { error: "Failed to update pinboard" },
          { status: 500 }
        );
      }
    }

    // Handle customer.subscription.created and customer.subscription.updated events
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      // Determine pinboardSlug from subscription metadata
      const pinboardSlug =
        subscription.metadata?.pinboardSlug ??
        subscription.metadata?.pinboard_slug ??
        null;

      if (!pinboardSlug) {
        console.warn("Missing pinboard_slug in subscription metadata", {
          subscriptionId: subscription.id,
        });
        return NextResponse.json({ received: true });
      }

      const subscriptionId = subscription.id;

      // Retrieve full subscription from Stripe
      const fullSubRes = await stripe.subscriptions.retrieve(subscriptionId);
      const fullSub = (
        "data" in fullSubRes ? fullSubRes.data : fullSubRes
      ) as Stripe.Subscription;

      const customerId =
        typeof fullSub.customer === "string" ? fullSub.customer : fullSub.customer.id;

      // Compute currentPeriodEndIso: prefer current_period_end, fallback to billing_cycle_anchor
      const periodEndUnix =
        typeof (fullSub as any).current_period_end === "number" &&
        Number.isFinite((fullSub as any).current_period_end)
          ? (fullSub as any).current_period_end
          : typeof (fullSub as any).billing_cycle_anchor === "number" &&
            Number.isFinite((fullSub as any).billing_cycle_anchor)
          ? (fullSub as any).billing_cycle_anchor
          : null;

      const currentPeriodEndIso = periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null;

      // Update pinboard with subscription info
      const { error: updateError } = await supabase
        .from("pinboards")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: fullSub.status,
          current_period_end: currentPeriodEndIso,
          paid_until: currentPeriodEndIso,
        })
        .eq("slug", pinboardSlug);

      if (updateError) {
        console.error("Error updating pinboard:", updateError);
        return NextResponse.json(
          { error: "Failed to update pinboard" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "An error occurred processing webhook" },
      { status: 500 }
    );
  }
}
