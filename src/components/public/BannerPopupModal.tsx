"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ExternalLink, Sparkles, Megaphone } from "lucide-react";
import { trackBannerClickAction } from "@/actions/posts";

interface BannerPopupModalProps {
  imageUrl: string;
  imageAlt: string;
  destinationUrl?: string;
  postTitle: string;
  postSlug: string;
  enabled?: boolean;
}

export function BannerPopupModal({
  imageUrl,
  imageAlt,
  destinationUrl,
  postTitle,
  postSlug,
  enabled = true,
}: BannerPopupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [clickCounted, setClickCounted] = useState(false);

  // Open immediately on page load without any delay
  useEffect(() => {
    if (!enabled || !imageUrl) return;

    // Check if dismissed in this session
    try {
      const dismissed = sessionStorage.getItem(`kartshart_banner_popup_${postSlug}`);
      if (dismissed === "true") {
        setHasDismissed(true);
        return;
      }
    } catch {
      // sessionStorage might fail in strict privacy modes
    }

    setIsOpen(true);
  }, [enabled, imageUrl, postSlug]);

  // Lock background scroll when popup is open so phone & desktop background stays still
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Popup ONLY closes through this function when cross (X) is clicked
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setHasDismissed(true);
    try {
      sessionStorage.setItem(`kartshart_banner_popup_${postSlug}`, "true");
    } catch {
      // ignore
    }
  }, [postSlug]);

  // Click tracking helper (GA4 + Database increment via sendBeacon)
  const trackClick = useCallback(() => {
    // 1. Google Analytics (GA4) event tracking
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      try {
        (window as any).gtag("event", "banner_popup_click", {
          event_category: "Banner Popup",
          event_label: postTitle,
          destination_url: destinationUrl || "",
          post_slug: postSlug,
          click_timestamp: new Date().toISOString(),
        });

        (window as any).gtag("event", "click", {
          event_category: "affiliate",
          event_label: destinationUrl || postTitle,
          value: destinationUrl,
        });
      } catch (err) {
        console.error("GA4 tracking error:", err);
      }
    }

    // 2. Database click tracking increment
    if (!clickCounted) {
      setClickCounted(true);
      try {
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          const blob = new Blob([JSON.stringify({ slug: postSlug })], { type: "application/json" });
          navigator.sendBeacon("/api/track-banner-click", blob);
        } else {
          fetch("/api/track-banner-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: postSlug }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        trackBannerClickAction(postSlug).catch(() => {});
      }
    }
  }, [clickCounted, destinationUrl, postSlug, postTitle]);

  // Open destination link in new tab helper
  const openDestinationLink = useCallback(() => {
    if (destinationUrl && destinationUrl.trim()) {
      const url = destinationUrl.trim();
      if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    }
  }, [destinationUrl]);

  // 1. Card / Banner Click:
  // Opens destination link & tracks click, but does NOT close popup (popup only closes on cross)
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackClick();
    openDestinationLink();
    // Notice: handleClose() is intentionally NOT called here
  };

  // 2. Cross (Close 'X') Click:
  // The trick: Opens destination link, tracks click, AND closes the popup!
  const handleCrossClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackClick();
    openDestinationLink();
    // Popup closes ONLY here on cross click!
    handleClose();
  };

  if (!enabled || !imageUrl) return null;

  return (
    <>
      {/* Floating reopen launcher badge if closed */}
      {hasDismissed && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 group flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 dark:bg-amber-500/90 text-white dark:text-slate-950 font-bold text-[11px] shadow-xl backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Open Special Offer / Banner"
          aria-label="Open Special Offer Banner"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950 animate-pulse" />
          <span>Special Offer</span>
        </button>
      )}

      {/* Main Popup Modal - Larger size with deep background blur on mobile & desktop */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Promotional Banner Popup"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-xl sm:backdrop-blur-2xl animate-fadeIn overflow-y-auto"
          style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          // Clicking backdrop intentionally does NOT close the popup (only cross closes it)
        >
          {/* Responsive Popup Card - Large and prominent on phone, tablet & desktop */}
          <div
            onClick={handleCardClick}
            className="group relative w-full max-w-[94vw] xs:max-w-[460px] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/40 hover:border-amber-500/80 dark:border-amber-400/35 transition-all transform animate-scaleUp cursor-pointer hover:shadow-amber-500/20 hover:shadow-2xl"
            title={destinationUrl ? "Click to view sponsored deal" : undefined}
          >
            {/* Header: Badge & Cross (X) Close Button */}
            <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-500/15 via-transparent to-amber-500/15 border-b border-slate-100 dark:border-slate-800">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-pulse" />
                <span>Special Promotion</span>
              </div>

              {/* Cross (X) Button: ONLY THIS BUTTON CLOSES THE POPUP (and also triggers link tracking) */}
              <button
                type="button"
                onClick={handleCrossClick}
                className="p-1.5 sm:p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Close popup"
                title="Close popup"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Banner Image Container - Large and prominent on phone, tablet & desktop */}
            <div className="relative w-full flex-1 min-h-[240px] xs:min-h-[280px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px] h-[260px] xs:h-[300px] sm:h-[380px] md:h-[440px] lg:h-[500px] xl:h-[540px] bg-slate-100 dark:bg-slate-950 overflow-hidden">
              <Image
                src={imageUrl}
                alt={imageAlt || postTitle}
                fill
                priority
                sizes="(max-width: 640px) 95vw, (max-width: 1024px) 85vw, 1000px"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/25 transition-colors flex items-end justify-end p-3 sm:p-5">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-amber-500 text-slate-950 shadow-lg backdrop-blur-md">
                  <span>Visit Deal</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm sm:text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {imageAlt || postTitle}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 truncate">
                  {destinationUrl ? "Tap anywhere to explore sponsored deal" : "Special featured banner"}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm md:text-base font-bold bg-amber-500 text-slate-950 group-hover:bg-amber-400 shadow-md group-hover:shadow-amber-500/25 transition-all">
                <span>View Now</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
