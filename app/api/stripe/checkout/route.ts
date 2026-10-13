import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, is_pro")
            .eq("id", user.id)
            .single();

        if (!profile) {
            return new NextResponse("Profile not found", { status: 404 });
        }

        // If already pro, redirect to billing portal (TODO) or dashboard
        if (profile.is_pro) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        let customerId = profile.stripe_customer_id;

        if (customerId) {
            try {
                const existingCustomer = await stripe.customers.retrieve(customerId);
                if ((existingCustomer as any).deleted) {
                    customerId = null;
                }
            } catch (retrieveError: any) {
                console.warn(`[STRIPE_CHECKOUT] Customer ${customerId} invalid in current Stripe mode: ${retrieveError.message}. Generating fresh customer.`);
                customerId = null;
            }
        }

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id,
                },
            });
            customerId = customer.id;

            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        // Resolve Stripe Price ID exclusively from environment variables
        const isTestKey = (process.env.STRIPE_SECRET_KEY || "").includes("51SxFWu");
        const priceId = process.env.STRIPE_PRICE_ID || 
            (isTestKey ? process.env.STRIPE_PRO_PRICE_ID_TEST : process.env.STRIPE_PRO_PRICE_ID_LIVE);

        if (!priceId) {
            return new NextResponse("Stripe Price ID not configured", { status: 500 });
        }

        const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "https://resume-builder-plan.vercel.app";

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/dashboard?success=true`,
            cancel_url: `${baseUrl}/pricing?canceled=true`,
            metadata: {
                userId: user.id,
            },
        });

        return NextResponse.redirect(session.url!);
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT]", error?.message || error);
        return new NextResponse(
            `Internal Error: ${error?.message || "Failed to initiate Stripe Checkout"}`,
            { status: 500 }
        );
    }
}
