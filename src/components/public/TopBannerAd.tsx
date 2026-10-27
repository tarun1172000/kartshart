"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ExternalLink, X, Megaphone } from "lucide-react";

export interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  altText?: string;
}

interface TopBannerAdProps {
  initialAd?: AdItem | null;
  className?: string;
}

export function TopBannerAd({ initialAd, className = "" }: TopBannerAdProps) {
  const [ad, setAd] = useState<AdItem | null>(initialAd || null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  // If initialAd was not passed from server, fetch active top ad from API
  useEffect(() => {
    if (initialAd) return;

    let isMounted = true;
    async function fetchTopAd() {
      try {
        const res = await fetch("/api/ads?placement=top&limit=1");
        const data = await res.json();
        if (isMounted && data.success && data.ads && data.ads.length > 0) {
          setAd(data.ads[0]);
        }
      } catch {
        // Silently fail if network error
      }
    }

    fetchTopAd();
    return () => {
      isMounted = false;
    };
  }, [initialAd]);

  // Click tracking
  const handleAdClick = useCallback(() => {
    if (!ad) return;

    if (!hasClicked) {
      setHasClicked(true);
      try {
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          const blob = new Blob([JSON.stringify({ id: ad.id })], {
            type: "application/json",
          });
          navigator.sendBeacon("/api/ads/click", blob);
        } else {
          fetch("/api/ads/click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: ad.id }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  }, [ad, hasClicked]);

  if (!ad || isDismissed) return null;

  return (
    <div
      className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 ${className}`}
    >
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/5 to-amber-500/10 dark:from-amber-500/15 dark:via-slate-900/40 dark:to-amber-500/15 border border-amber-500/20 hover:border-amber-500/40 transition-all shadow-xs hover:shadow-lg">
        {/* Ad & Close controls header bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/5 dark:bg-slate-950/40 text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-800">
          <div className="inline-flex items-center gap-1.5 uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Megaphone className="w-3 h-3" />
            <span>Sponsored Promotion</span>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            title="Dismiss Ad"
            aria-label="Dismiss Advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clickable Banner Link */}
        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAdClick}
          className="relative block w-full h-24 sm:h-32 md:h-36 overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-950"
        >
          <Image
            src={ad.imageUrl}
            alt={ad.altText || ad.title}
            fill
            priority={false}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
          />

          {/* Hover Action Badge */}
          <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors flex items-end justify-end p-3">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
              <span>Visit Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
