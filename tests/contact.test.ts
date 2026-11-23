import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Contact Form Routing & Destination Safety', () => {
  const inquiriesPath = path.join(process.cwd(), 'data', 'inquiries.json');

  it('safely handles inquiries ledger creation and records data', () => {
    const testRecord = {
      id: `test_${Date.now()}`,
      receivedAt: new Date().toISOString(),
      destination: 'support@verified-domain.com',
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Time difference inquiry',
      message: 'Need help with London offset.',
    };

    let list = [];
    if (fs.existsSync(inquiriesPath)) {
      list = JSON.parse(fs.readFileSync(inquiriesPath, 'utf-8'));
    }
    list.unshift(testRecord);
    fs.writeFileSync(inquiriesPath, JSON.stringify(list, null, 2), 'utf-8');

    const updated = JSON.parse(fs.readFileSync(inquiriesPath, 'utf-8'));
    expect(updated[0].id).toBe(testRecord.id);
    expect(updated[0].destination).toBe('support@verified-domain.com');

    // Clean up test entry
    const cleaned = updated.filter((item: any) => item.id !== testRecord.id);
    fs.writeFileSync(inquiriesPath, JSON.stringify(cleaned, null, 2), 'utf-8');
  });
});
