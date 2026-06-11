import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title');
    const area = searchParams.get('area');
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    const isSpot = title && area && category;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0a0a0a',
            padding: '80px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Top Logo / Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '0.25em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            backdoorcity
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {isSpot ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 36,
                    color: '#888888',
                    marginBottom: 20,
                  }}
                >
                  {city ? `${city} · ` : ''}{category}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: 84,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    lineHeight: 1.1,
                    marginBottom: 20,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 48,
                    fontWeight: 500,
                    color: '#aaaaaa',
                  }}
                >
                  <span style={{ marginRight: '16px' }}>📍</span>
                  <span>{area}</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: 96,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    lineHeight: 1.1,
                    marginBottom: 30,
                  }}
                >
                  <span>India's underground</span>
                  <span>city guide.</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 48,
                    fontWeight: 500,
                    color: '#888888',
                  }}
                >
                  Discover the best spots in the city.
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom branding / decorative */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '2px solid #333',
              paddingTop: '40px',
            }}
          >
             <div style={{ display: 'flex', fontSize: 32, color: '#555' }}>
                Curated by locals.
             </div>
             <div style={{ display: 'flex', fontSize: 32, color: '#555', fontFamily: 'monospace' }}>
                {isSpot ? 'share/spot' : 'explore/city'}
             </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
