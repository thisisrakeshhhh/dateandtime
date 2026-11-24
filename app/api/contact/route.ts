import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/lib/config';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting (5 contact submissions per minute per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`contact:${clientIp}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a minute before submitting again.' },
        { status: 429 }
      );
    }

    // 2. Body size check (maximum 10 KB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 10240) {
      return NextResponse.json(
        { success: false, error: 'Request payload exceeds maximum allowed size (10 KB).' },
        { status: 413 }
      );
    }

    // 3. Service configuration check (503 if missing credentials)
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const destination = (process.env.CONTACT_EMAIL || siteConfig.contactEmail)?.trim();

    if (!resendApiKey || !destination) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact email service is not configured.',
        },
        { status: 503 }
      );
    }

    // 4. Parse and validate JSON body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields (name, email, subject, message) are required.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email) || email.length > 150) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Input fields exceed allowed character limits.' },
        { status: 400 }
      );
    }

    // 5. Send email through Resend API
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
        reply_to: email,
        subject: `[TimeBridge Contact] ${subject}`,
        text: `Sender Name: ${name}\nSender Email: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      }),
    });

    if (!resendResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to deliver message via email provider.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully.',
    });
  } catch {
    // Sanitized error - never return stack traces
    return NextResponse.json(
      { success: false, error: 'An unexpected internal error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
