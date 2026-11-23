import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import { MessageSquare, AlertCircle } from 'lucide-react';
import ContactFormClient from '@/components/ContactFormClient';

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description: `Get in touch with the ${siteConfig.name} team. Submit inquiries regarding time zone corrections, data partnerships, or technical support.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/contact`,
  },
};

export default function ContactPage() {
  const destinationEmail = (process.env.CONTACT_EMAIL || siteConfig.contactEmail || '').trim();
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const isDeliveryConfigured = Boolean(resendApiKey && destinationEmail);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[#C93527] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">Contact</span>
      </nav>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C93527]/10 border border-[#C93527]/20 text-[#C93527] text-xs font-semibold mb-3">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Feedback & Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Contact {siteConfig.name}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
          Have a question about a time zone anomaly, a feature suggestion, or an editorial inquiry?
          We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm md:col-span-1 space-y-4 text-xs">
          <div>
            <span className="text-neutral-400 uppercase font-semibold text-[10px] tracking-wider">
              Contact Mode
            </span>
            <p className="font-medium text-neutral-900 dark:text-white mt-0.5">
              {isDeliveryConfigured ? 'Email Dispatch (Active)' : 'Direct Form (Offline)'}
            </p>
          </div>
          <div>
            <span className="text-neutral-400 uppercase font-semibold text-[10px] tracking-wider">
              Response Time
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 mt-0.5">
              Within 24 to 48 business hours
            </p>
          </div>
          <div>
            <span className="text-neutral-400 uppercase font-semibold text-[10px] tracking-wider">
              Target Audience
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 mt-0.5">
              Users across USA, UK, Canada, Australia, India, and New Zealand
            </p>
          </div>
        </div>

        {/* Contact Form OR Plain Notice */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm md:col-span-2">
          {isDeliveryConfigured ? (
            <ContactFormClient />
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-foreground flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Direct Contact Form Unavailable
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Our direct messaging form is temporarily unavailable as the email delivery service is currently not configured in this environment. Please check back later.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
