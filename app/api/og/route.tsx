import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>&name=<name>
        const title = searchParams.get("title")?.slice(0, 100) || "Professional Resume";
        const name = searchParams.get("name")?.slice(0, 100) || "Job Seeker";

        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#0d1b1e",
                        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(16, 43, 43, 0.4) 0%, rgba(13, 27, 30, 0) 90%), radial-gradient(circle at 90% 80%, rgba(13, 130, 116, 0.15) 0%, rgba(13, 27, 30, 0) 90%)",
                    }}
                >
                    {/* Decorative Top Accent Bar */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "8px",
                            backgroundImage: "linear-gradient(90deg, #0d8274, #d8f36b)",
                        }}
                    />

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "60px 80px",
                            borderRadius: "24px",
                            textAlign: "center",
                            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
                            maxWidth: "1000px",
                        }}
                    >
                        {/* Verified Badge */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "6px 14px",
                                backgroundColor: "rgba(216, 243, 107, 0.1)",
                                border: "1px solid rgba(216, 243, 107, 0.2)",
                                borderRadius: "100px",
                                fontSize: "14px",
                                color: "#d8f36b",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "1.5px",
                                marginBottom: "28px",
                            }}
                        >
                            ✓ Verified Candidate
                        </div>

                        {/* Name */}
                        <div
                            style={{
                                fontSize: 64,
                                fontWeight: 900,
                                marginBottom: 16,
                                lineHeight: 1.15,
                                color: "#ffffff",
                                letterSpacing: "-1.5px",
                            }}
                        >
                            {name}
                        </div>

                        {/* Target Title / Subtitle */}
                        <div
                            style={{
                                fontSize: 26,
                                color: "rgba(255, 255, 255, 0.65)",
                                fontWeight: 500,
                                marginBottom: 44,
                                letterSpacing: "-0.5px",
                            }}
                        >
                            {title}
                        </div>

                        {/* Action CTA Button */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "12px 36px",
                                backgroundColor: "#d8f36b",
                                borderRadius: "12px",
                                fontSize: 22,
                                color: "#0d1b1e",
                                fontWeight: 800,
                                boxShadow: "0 8px 25px rgba(216, 243, 107, 0.25)",
                            }}
                        >
                            View Resume & Credentials
                        </div>
                    </div>

                    {/* Footer watermark */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 40,
                            display: "flex",
                            alignItems: "center",
                            fontSize: 18,
                            color: "rgba(255, 255, 255, 0.35)",
                            fontWeight: 600,
                            letterSpacing: "1px",
                        }}
                    >
                        POWERED BY <span style={{ color: "#d8f36b", marginLeft: "6px" }}>RESUMEAI PRO</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
