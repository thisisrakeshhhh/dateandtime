import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { siteConfig } from '@/lib/config';

interface InquiryRecord {
  id: string;
  receivedAt: string;
  destination: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const destination = siteConfig.contactEmail;
    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'No contact email destination is configured on the server.' },
        { status: 400 }
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

    // Record inquiry to persistent file so administrators can read submitted messages
    const inquiryRecord: InquiryRecord = {
      id: `inq_${Date.now()}`,
      receivedAt: new Date().toISOString(),
      destination,
      name: String(name).trim(),
      email: String(email).trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
    };

    const inquiriesFilePath = path.join(process.cwd(), 'data', 'inquiries.json');
    let existing: InquiryRecord[] = [];
    try {
      if (fs.existsSync(inquiriesFilePath)) {
        const fileContent = fs.readFileSync(inquiriesFilePath, 'utf-8');
        existing = JSON.parse(fileContent);
      }
    } catch {
      existing = [];
    }

    existing.unshift(inquiryRecord);
    fs.writeFileSync(inquiriesFilePath, JSON.stringify(existing, null, 2), 'utf-8');

    // If an email provider (such as Resend) is configured, dispatch the message
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TimeBridge Inquiries <notifications@timebridge.app>',
            to: destination,
            reply_to: email,
            subject: `[TimeBridge Contact] ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          }),
        });
      } catch (err) {
        console.warn('Optional Resend dispatch failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Your message has been delivered to ${destination} and logged into our inquiry ledger.`,
      inquiryId: inquiryRecord.id,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error while processing inquiry.';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
