import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return NextResponse.redirect(new URL("/pricing", req.url), { status: 303 });
        }

        try {
            const customer = await stripe.customers.retrieve(profile.stripe_customer_id);
            if ((customer as any).deleted) {
                return NextResponse.redirect(new URL("/pricing", req.url), { status: 303 });
            }
        } catch {
            return NextResponse.redirect(new URL("/pricing", req.url), { status: 303 });
        }

        const returnUrl = new URL("/dashboard/subscription", req.url).toString();

        // Create Stripe Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: returnUrl,
        });

        return NextResponse.redirect(session.url, { status: 303 });
    } catch (error) {
        console.error("Error creating portal session:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
