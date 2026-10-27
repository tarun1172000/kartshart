"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ExternalLink, Megaphone } from "lucide-react";
import { AdItem } from "./TopBannerAd";

interface SidebarAdProps {
  initialAd?: AdItem | null;
  className?: string;
}

export function SidebarAd({ initialAd, className = "" }: SidebarAdProps) {
  const [ad, setAd] = useState<AdItem | null>(initialAd || null);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    if (initialAd) return;

    let isMounted = true;
    async function fetchSidebarAd() {
      try {
        const res = await fetch("/api/ads?placement=sidebar&limit=1");
        const data = await res.json();
        if (isMounted && data.success && data.ads && data.ads.length > 0) {
          setAd(data.ads[0]);
        }
      } catch {
        // Silently ignore
      }
    }

    fetchSidebarAd();
    return () => {
      isMounted = false;
    };
  }, [initialAd]);

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

  if (!ad) return null;

  return (
    <div
      className={`rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all ${className}`}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-slate-100 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          <Megaphone className="w-3 h-3 text-amber-500" />
          <span>Sponsored Offer</span>
        </span>
        <span className="text-[10px] font-semibold text-slate-400">Ad</span>
      </div>

      {/* Clickable Card */}
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleAdClick}
        className="group block p-3 space-y-3 cursor-pointer"
      >
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950">
          <Image
            src={ad.imageUrl}
            alt={ad.altText || ad.title}
            fill
            sizes="320px"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {ad.title}
          </h4>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            Tap to visit sponsor
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 group-hover:bg-amber-400 transition-colors shadow-xs">
            <span>Explore</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </a>
    </div>
  );
}
