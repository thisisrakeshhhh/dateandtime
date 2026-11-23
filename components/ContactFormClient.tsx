'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ContactFormClientProps {
  destinationEmail: string;
}

export default function ContactFormClient({ destinationEmail }: ContactFormClientProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setStatusMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatus('error');
        setStatusMsg(data.error || 'Failed to send inquiry. Please try again later.');
      } else {
        setStatus('success');
        setStatusMsg(data.message || `Message dispatched successfully to ${destinationEmail}`);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch {
      setStatus('error');
      setStatusMsg('Network connection error while submitting the form.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
        Messages submitted through this form are forwarded directly to{' '}
        <strong className="text-neutral-900 dark:text-white font-mono">{destinationEmail}</strong> and logged in our support inbox.
      </div>

      {status === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Message Delivered</div>
            <div className="mt-0.5">{statusMsg}</div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Submission Failed</div>
            <div className="mt-0.5">{statusMsg}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Your Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C93527]/30"
          />
        </div>

        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C93527]/30"
          />
        </div>

        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Question regarding Daylight Saving Time or Time Difference..."
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C93527]/30"
          />
        </div>

        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Message
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your inquiry or question in detail..."
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C93527]/30 resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C93527] hover:bg-[#a62519] disabled:opacity-60 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          {status === 'loading' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
        </button>
      </form>
    </div>
  );
}
