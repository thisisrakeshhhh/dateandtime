import { ImageResponse } from 'next/og';

export const alt = 'TimeBridge - World Time Difference & Interactive Map';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #131b2e 50%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#E85D4E',
              boxShadow: '0 0 24px rgba(232, 93, 78, 0.9)',
            }}
          />
          <span
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            TimeBridge
          </span>
        </div>
        <p
          style={{
            fontSize: '30px',
            fontWeight: 600,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '920px',
            margin: '0 0 36px 0',
            lineHeight: 1.4,
          }}
        >
          Live World Time Difference, Interactive Day/Night Solar Map &amp; Best Time to Call
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '12px 28px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '20px',
            fontWeight: 600,
            color: '#f8fafc',
          }}
        >
          <span>IANA Time Zones</span>
          <span style={{ color: '#E85D4E' }}>•</span>
          <span>Astronomical Day/Night Shadow</span>
          <span style={{ color: '#E85D4E' }}>•</span>
          <span>Minute-Accurate Calling Windows</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
