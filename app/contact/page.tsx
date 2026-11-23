import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import { MessageSquare, AlertCircle } from 'lucide-react';
import ContactFormClient from '@/components/ContactFormClient';

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description: `Get in touch with the ${siteConfig.name} team. Inquire about time zone corrections, data partnerships, or general technical support.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/contact`,
  },
};

export default function ContactPage() {
  const hasDestination = Boolean(siteConfig.contactEmail);

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
              Email Destination
            </span>
            <p className="font-mono font-medium text-neutral-900 dark:text-white mt-0.5 break-all">
              {hasDestination ? (
                <a href={`mailto:${siteConfig.contactEmail}`} className="hover:underline text-[#C93527]">
                  {siteConfig.contactEmail}
                </a>
              ) : (
                <span className="text-neutral-400 italic">No destination configured</span>
              )}
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

        {/* Contact Form OR Clear Disabled Note */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm md:col-span-2">
          {hasDestination ? (
            <ContactFormClient destinationEmail={siteConfig.contactEmail} />
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-foreground flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    Direct Contact Form Disabled
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Direct messaging is currently inactive because no destination email address (CONTACT_EMAIL) or ticketing integration is configured in the application environment.
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    To activate contact submissions, set the <code className="font-mono bg-neutral-200/70 dark:bg-neutral-800 px-1 py-0.5 rounded">CONTACT_EMAIL</code> environment variable with a verified address.
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
