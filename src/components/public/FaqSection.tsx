"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqList: FaqItem[];
}

export function FaqSection({ faqList }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqList || faqList.length === 0) return null;

  const validFaqs = faqList.filter((f) => f.question && f.answer);
  if (validFaqs.length === 0) return null;

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="my-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-5 h-5 text-amber-500" />
        <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h3>
      </div>

      <div className="space-y-3">
        {validFaqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10121a] overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-amber-500" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-100 dark:border-slate-850">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
