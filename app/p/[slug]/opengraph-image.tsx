import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export const alt = 'Portfolio Preview';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
    const { slug } = await params; // params is a promise in Next.js 15+ (and maybe 16)

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: portfolio } = await supabase
        .from('portfolios')
        .select('full_name, tagline')
        .eq('slug', slug)
        .single();

    const name = portfolio?.full_name || slug;
    const tagline = portfolio?.tagline || 'Professional Portfolio';

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '40px 60px',
                        flexDirection: 'column',
                        alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    }}
                >
                    <div
                        style={{
                            fontSize: 60,
                            fontWeight: 'bold',
                            marginBottom: 20,
                            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        {name}
                    </div>
                    <div
                        style={{
                            fontSize: 30,
                            color: '#cbd5e1',
                            textAlign: 'center',
                            maxWidth: '800px',
                        }}
                    >
                        {tagline}
                    </div>
                    <div
                        style={{
                            marginTop: 40,
                            fontSize: 20,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '4px',
                        }}
                    >
                        Portfolio & Resume
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
