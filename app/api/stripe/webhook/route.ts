import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js"; // Use admin client for webhooks

// Need admin rights to update profiles without auth user context
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return new NextResponse("Stripe Webhook Secret not configured", { status: 500 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        if (event.type === "checkout.session.completed") {
            const subscription = await stripe.subscriptions.retrieve(session.subscription) as any;

            if (!session.metadata?.userId) {
                console.error("User ID missing in session metadata");
                return new NextResponse("User ID missing", { status: 400 });
            }

            await supabaseAdmin
                .from("profiles")
                .update({
                    is_pro: true,
                    stripe_subscription_id: subscription.id,
                    stripe_customer_id: subscription.customer as string,
                    stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq("id", session.metadata.userId);
        }

        if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as any;

            // We need to find the user by subscription ID or customer ID
            await supabaseAdmin
                .from("profiles")
                .update({
                    is_pro: false,
                    stripe_current_period_end: null,
                })
                .eq("stripe_subscription_id", subscription.id);
        }

        if (event.type === "invoice.payment_succeeded") {
            const subscription = await stripe.subscriptions.retrieve(session.subscription) as any;

            // We might want to extend the period end here
            await supabaseAdmin
                .from("profiles")
                .update({
                    stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq("stripe_subscription_id", subscription.id);
        }

        return new NextResponse(null, { status: 200 });

    } catch (error) {
        console.error("[STRIPE_WEBHOOK_HANDLER]", error);
        return new NextResponse("Webhook Handler failed", { status: 500 });
    }
}
