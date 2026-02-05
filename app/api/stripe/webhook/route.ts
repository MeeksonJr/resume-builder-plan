import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Create a single supabase client for interacting with your database
// using the Service Role key to bypass RLS.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;
                // Metadata usually contains the user_id if passed during checkout creation
                // But typically we might rely on client_reference_id or search by email.
                // Best practice: Pass user_id in checking session metadata.
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error("No userId in session metadata");
                    // If we can't find user, we can try to look up by email, but metadata is safer
                    break;
                }

                // Retrieve subscription details to get the current period end
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                await supabaseAdmin
                    .from("profiles")
                    .update({
                        stripe_subscription_id: subscriptionId,
                        stripe_customer_id: customerId,
                        stripe_price_id: subscription.items.data[0].price.id,
                        stripe_current_period_end: new Date(
                            subscription.current_period_end * 1000
                        ).toISOString(),
                        subscription_status: subscription.status,
                    })
                    .eq("id", userId);
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                // We need to find the user by strip_customer_id since metadata might not be on the subscription object directly
                // unless we copied it over. Easier to query profiles by customer_id.

                await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: subscription.status,
                        stripe_price_id: subscription.items.data[0].price.id,
                        stripe_current_period_end: new Date(
                            subscription.current_period_end * 1000
                        ).toISOString(),
                    })
                    .eq("stripe_customer_id", subscription.customer as string);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "canceled",
                        stripe_current_period_end: new Date(
                            subscription.current_period_end * 1000
                        ).toISOString(),
                    })
                    .eq("stripe_customer_id", subscription.customer as string);
                break;
            }
        }
    } catch (error) {
        console.error("Webhook handler failed:", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
