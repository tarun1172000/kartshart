import { Sparkles, CheckCircle2 } from "lucide-react";

interface KeyTakeawaysProps {
  takeaways: string[];
}

export function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) return null;

  const validItems = takeaways.filter((item) => item && item.trim().length > 0);
  if (validItems.length === 0) return null;

  return (
    <div className="my-8 p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs">
      <div className="flex items-center gap-2 mb-4 text-amber-800 dark:text-amber-400 font-serif font-bold text-lg">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <span>Executive Summary & Key Takeaways</span>
      </div>

      <ul className="space-y-3">
        {validItems.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-200 text-base leading-relaxed">
            <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
