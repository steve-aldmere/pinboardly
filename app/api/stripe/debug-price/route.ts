import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan } = body;

    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'monthly' or 'yearly'" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      plan,
      priceId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON with 'plan' field." },
      { status: 400 }
    );
  }
}

