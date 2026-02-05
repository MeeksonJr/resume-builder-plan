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
                        backgroundColor: "#fff",
                        backgroundImage: "linear-gradient(to bottom right, #eff6ff, #fff)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "white",
                            padding: "40px 80px",
                            borderRadius: "20px",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 60,
                                fontWeight: 900,
                                marginBottom: 20,
                                lineHeight: 1.2,
                                backgroundImage: "linear-gradient(90deg, #2563eb, #7c3aed)",
                                backgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            {name}
                        </div>
                        <div
                            style={{
                                fontSize: 30,
                                color: "#64748b",
                                fontWeight: 500,
                                marginBottom: 40,
                            }}
                        >
                            {title}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 30px",
                                backgroundColor: "#f1f5f9",
                                borderRadius: "50px",
                                fontSize: 24,
                                color: "#0f172a",
                                fontWeight: 600,
                            }}
                        >
                            View Verified Resume
                        </div>
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            bottom: 40,
                            display: "flex",
                            alignItems: "center",
                            fontSize: 20,
                            color: "#94a3b8",
                        }}
                    >
                        Built with details
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
