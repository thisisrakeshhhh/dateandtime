import { describe, it, expect } from 'vitest';
import { POST } from '../app/api/contact/route';
import { NextRequest } from 'next/server';

describe('Contact Form API & Serverless Security', () => {
  it('returns 503 when RESEND_API_KEY is not configured', async () => {
    const originalKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        subject: 'Inquiry',
        message: 'Hello world',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('service is not configured');

    process.env.RESEND_API_KEY = originalKey;
  });

  it('rejects incomplete submissions with 400 Bad Request', async () => {
    process.env.RESEND_API_KEY = 're_test_dummy_key';
    process.env.CONTACT_EMAIL = 'support@example.com';

    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'test@example.com',
        subject: '',
        message: '',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});
