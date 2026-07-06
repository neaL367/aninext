import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'AniNext';
  const description = searchParams.get('description') || 'A premium anime discovery platform powered by AniList.';

  const [boldFont, regularFont] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-sans/Geist-Bold.ttf').then(async (res) => {
      if (!res.ok) {
        console.error(`Bold font fetch failed: ${res.status} ${res.statusText}`);
        return new ArrayBuffer(0);
      }
      return res.arrayBuffer();
    }),
    fetch('https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-sans/Geist-Regular.ttf').then(async (res) => {
      if (!res.ok) {
        console.error(`Regular font fetch failed: ${res.status} ${res.statusText}`);
        return new ArrayBuffer(0);
      }
      return res.arrayBuffer();
    }),
  ]);
  
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
          backgroundColor: '#050505',
          color: 'white',
          fontFamily: 'Geist',
          padding: '60px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            marginBottom: '24px',
            letterSpacing: '-0.02em',
            color: 'white',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#a1a1aa',
            lineHeight: '1.4',
            maxWidth: '900px',
            fontWeight: '400',
          }}
        >
          {description}
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '0.1em',
          }}
        >
          AniNext
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Geist',
          data: boldFont,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: regularFont,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );
}
