"use client";

import React, { useState } from "react";
import { FaqItem, generateFaqSchema } from "@/lib/seo";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqBlockProps {
  faqs: FaqItem[];
  title?: string;
}

export default function FaqBlock({
  faqs,
  title = "Frequently Asked Questions",
}: FaqBlockProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]); // Open first FAQ by default

  function toggleFaq(index: number) {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  }

  const jsonLd = generateFaqSchema(faqs);

  return (
    <section className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-5 sm:p-7 shadow-sm">
      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
        <HelpCircle className="w-4 h-4" />
        <span>Common Questions</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-6">
        {title}
      </h2>

      <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
        {faqs.map((faq, index) => {
          const isOpen = openIndexes.includes(index);

          return (
            <div key={faq.question} className="py-4">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full text-left flex items-start justify-between gap-4 group focus:outline-none"
              >
                <span className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {faq.question}
                </span>
                <span
                  className={`p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pr-8">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
