import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { MessageSquare, Send } from "lucide-react";

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description: `Get in touch with the ${siteConfig.name} team. Inquire about time zone corrections, data partnerships, or general technical support.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">Contact</span>
      </nav>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
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
              Email Support
            </span>
            <p className="font-mono font-medium text-neutral-900 dark:text-white mt-0.5">
              {siteConfig.contactEmail}
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

        {/* Contact Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm md:col-span-2">
          <form className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Question regarding Daylight Saving Time or Time Difference..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Describe your inquiry or question in detail..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
