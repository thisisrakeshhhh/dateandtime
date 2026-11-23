import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const destination = (process.env.CONTACT_EMAIL || siteConfig.contactEmail)?.trim();

    if (!resendApiKey || !destination) {
      return NextResponse.json(
        { success: false, error: 'Contact email service is not configured.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields (name, email, subject, message) are required.' },
        { status: 400 }
      );
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'TimeBridge Contact <onboarding@resend.dev>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: destination,
        reply_to: String(email).trim(),
        subject: `[TimeBridge Contact] ${String(subject).trim()}`,
        text: `Sender Name: ${String(name).trim()}\nSender Email: ${String(email).trim()}\nSubject: ${String(subject).trim()}\n\nMessage:\n${String(message).trim()}`,
      }),
    });

    if (!resendResponse.ok) {
      const errData = await resendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errData.message || 'Email delivery failed through API provider.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully via email.',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error while processing inquiry.';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
