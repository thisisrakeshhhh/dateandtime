"use client";

import React, { useState } from "react";
import { FaqItem, generateFaqSchema } from "@/lib/seo";
import { ChevronDown } from "lucide-react";

interface FaqBlockProps {
  faqs: FaqItem[];
  title?: string;
}

export default function FaqBlock({
  faqs,
  title = "Frequently asked questions",
}: FaqBlockProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  function toggleFaq(index: number) {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  }

  const jsonLd = generateFaqSchema(faqs);

  return (
    <section className="w-full bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 shadow-sm">
      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight mb-5">
        {title}
      </h2>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {faqs.map((faq, index) => {
          const isOpen = openIndexes.includes(index);

          return (
            <div key={faq.question} className="py-3.5">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full text-left flex items-start justify-between gap-4 group focus:outline-none"
              >
                <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200 group-hover:text-[#E85D4E] transition-colors">
                  {faq.question}
                </span>
                <span
                  className={`p-1 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pr-6">
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
