import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/weatherAdapter';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // 1. IP Rate Limiting (60 requests per minute per IP)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`weather:${clientIp}`, 60, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a minute before requesting weather again.' },
        { status: 429 }
      );
    }

    // 2. Validate coordinates query parameters
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json({ success: false, error: 'Missing coordinates' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ success: false, error: 'Invalid coordinates' }, { status: 400 });
    }

    const weather = await fetchWeather(lat, lng);

    return NextResponse.json(weather, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
      },
    });
  } catch {
    // Never expose stack traces or internal details
    return NextResponse.json(
      { success: false, error: 'Unable to fetch weather estimates at this time.' },
      { status: 500 }
    );
  }
}
