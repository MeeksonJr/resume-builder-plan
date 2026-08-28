import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data: keys, error } = await supabase
            .from("user_api_keys")
            .select("id, name, token_preview, created_at, last_used_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[API_KEYS_GET_ERROR]", error);
            return new NextResponse("Error fetching keys", { status: 500 });
        }

        return NextResponse.json(keys);
    } catch (error) {
        console.error("[API_KEYS_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { name } = await req.json();
        if (!name || typeof name !== "string") {
            return new NextResponse("Invalid name", { status: 400 });
        }

        // Generate Stripe-like token preview/hash pair
        const rawToken = "rf_live_" + crypto.randomBytes(24).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const tokenPreview = rawToken.slice(0, 12) + "..." + rawToken.slice(-4);

        const { data: newKey, error } = await supabase
            .from("user_api_keys")
            .insert({
                user_id: user.id,
                name,
                token_preview: tokenPreview,
                token_hash: tokenHash,
            })
            .select()
            .single();

        if (error) {
            console.error("[API_KEYS_POST_ERROR]", error);
            return new NextResponse("Error generating key", { status: 500 });
        }

        // Return the raw token ONLY ONCE during generation
        return NextResponse.json({
            id: newKey.id,
            name: newKey.name,
            token_preview: newKey.token_preview,
            created_at: newKey.created_at,
            rawToken, // Crucial: display this once to the user
        });
    } catch (error) {
        console.error("[API_KEYS_POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const keyId = searchParams.get("id");

        if (!keyId) {
            return new NextResponse("Missing key ID", { status: 400 });
        }

        const { error } = await supabase
            .from("user_api_keys")
            .delete()
            .eq("id", keyId)
            .eq("user_id", user.id);

        if (error) {
            console.error("[API_KEYS_DELETE_ERROR]", error);
            return new NextResponse("Error deleting key", { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API_KEYS_DELETE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
