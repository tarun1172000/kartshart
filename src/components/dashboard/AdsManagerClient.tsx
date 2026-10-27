"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Copy,
  Check,
  Upload,
  Link as LinkIcon,
  Eye,
  MousePointerClick,
  Sparkles,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  LayoutTemplate,
  Sidebar as SidebarIcon,
} from "lucide-react";
import {
  createAdAction,
  updateAdAction,
  deleteAdAction,
  toggleAdStatusAction,
} from "@/actions/ads";
import { AdPlacement, AdStatus } from "@/models/Ad";

export interface SerializedAd {
  _id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  clicks: number;
  impressions: number;
  altText?: string;
  createdAt: string;
}

interface AdsManagerClientProps {
  initialAds: SerializedAd[];
}

export function AdsManagerClient({ initialAds }: AdsManagerClientProps) {
  const [ads, setAds] = useState<SerializedAd[]>(initialAds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<SerializedAd | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [placement, setPlacement] = useState<AdPlacement>("top");
  const [status, setStatus] = useState<AdStatus>("active");
  const [altText, setAltText] = useState("");

  // Image source mode: "upload" or "link"
  const [imageSourceMode, setImageSourceMode] = useState<"upload" | "link">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [filterPlacement, setFilterPlacement] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAd, setPreviewAd] = useState<SerializedAd | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset form
  const resetForm = () => {
    setTitle("");
    setImageUrl("");
    setTargetUrl("");
    setPlacement("top");
    setStatus("active");
    setAltText("");
    setImageSourceMode("upload");
    setUploadError("");
    setEditingAd(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (ad: SerializedAd) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setImageUrl(ad.imageUrl);
    setTargetUrl(ad.targetUrl);
    setPlacement(ad.placement);
    setStatus(ad.status);
    setAltText(ad.altText || "");
    setImageSourceMode(ad.imageUrl.startsWith("/uploads/") ? "upload" : "link");
    setUploadError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handle local file upload to /api/ads/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ads/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        setUploadError(data.error || "Upload failed.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Submit Ad form (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide an Ad Title.");
      return;
    }
    if (!imageUrl.trim()) {
      alert("Please upload an image or provide an image URL.");
      return;
    }
    if (!targetUrl.trim()) {
      alert("Please provide a destination target URL (e.g., https://example.com).");
      return;
    }

    startTransition(async () => {
      if (editingAd) {
        const res = await updateAdAction(editingAd._id, {
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          targetUrl: targetUrl.trim(),
          placement,
          status,
          altText: altText.trim() || title.trim(),
        });

        if (res.success && res.ad) {
          setAds((prev) =>
            prev.map((item) => (item._id === editingAd._id ? res.ad : item))
          );
          closeModal();
        } else {
          alert(res.error || "Failed to update ad.");
        }
      } else {
        const res = await createAdAction({
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          targetUrl: targetUrl.trim(),
          placement,
          status,
          altText: altText.trim() || title.trim(),
        });

        if (res.success && res.ad) {
          setAds([res.ad, ...ads]);
          closeModal();
        } else {
          alert(res.error || "Failed to create ad.");
        }
      }
    });
  };

  // Toggle active/inactive
  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      const res = await toggleAdStatusAction(id);
      if (res.success && res.status) {
        setAds((prev) =>
          prev.map((ad) =>
            ad._id === id ? { ...ad, status: res.status as AdStatus } : ad
          )
        );
      } else {
        alert(res.error || "Failed to toggle status.");
      }
    });
  };

  // Delete ad
  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteAdAction(id);
      if (res.success) {
        setAds((prev) => prev.filter((ad) => ad._id !== id));
      } else {
        alert(res.error || "Failed to delete ad.");
      }
    });
  };

  // Copy target URL
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered ads
  const filteredAds = ads.filter((ad) => {
    if (filterPlacement !== "all" && ad.placement !== filterPlacement) return false;
    if (filterStatus !== "all" && ad.status !== filterStatus) return false;
    return true;
  });

  // Calculate statistics
  const totalAds = ads.length;
  const activeAds = ads.filter((a) => a.status === "active").length;
  const topAds = ads.filter((a) => a.placement === "top").length;
  const sidebarAds = ads.filter((a) => a.placement === "sidebar").length;
  const totalClicks = ads.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Ads</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalAds}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Live</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{activeAds}</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-xs">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Top Banners</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{topAds}</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-xs">
          <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Sidebar Ads</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{sidebarAds}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Total Clicks</p>
          <div className="flex items-center gap-2 mt-1">
            <MousePointerClick className="w-5 h-5 text-amber-500" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{totalClicks}</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Placement Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Type:</span>
            <select
              value={filterPlacement}
              onChange={(e) => setFilterPlacement(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Types</option>
              <option value="top">Top Banners</option>
              <option value="sidebar">Sidebar Ads</option>
              <option value="popup">Popup Banners</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Create New Ad</span>
        </button>
      </div>

      {/* Ads List */}
      {filteredAds.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
          <Megaphone className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Advertisements Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Get started by creating your first Top Banner or Sidebar Ad campaign.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:bg-amber-400 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Ad</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => {
            const isTop = ad.placement === "top";
            const isSidebar = ad.placement === "sidebar";
            const isActive = ad.status === "active";

            return (
              <div
                key={ad._id}
                className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Image Preview Banner */}
                <div>
                  <div
                    onClick={() => setPreviewAd(ad)}
                    className="relative w-full h-44 bg-slate-100 dark:bg-slate-950 cursor-pointer overflow-hidden"
                  >
                    <Image
                      src={ad.imageUrl}
                      alt={ad.altText || ad.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Placement badge overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
                          isTop
                            ? "bg-blue-600/90 text-white"
                            : isSidebar
                            ? "bg-purple-600/90 text-white"
                            : "bg-amber-500/90 text-slate-950"
                        }`}
                      >
                        {isTop ? (
                          <LayoutTemplate className="w-3 h-3" />
                        ) : isSidebar ? (
                          <SidebarIcon className="w-3 h-3" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>{ad.placement} Ad</span>
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md ${
                          isActive
                            ? "bg-emerald-500/90 text-white"
                            : "bg-slate-700/90 text-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-white animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        <span>{isActive ? "LIVE" : "PAUSED"}</span>
                      </span>
                    </div>

                    {/* Zoom preview hint */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 text-white text-xs font-semibold backdrop-blur-xs">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Preview</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                        {ad.title}
                      </h4>
                    </div>

                    {/* Destination URL */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <a
                        href={ad.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5"
                        title={ad.targetUrl}
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{ad.targetUrl}</span>
                      </a>
                      <button
                        onClick={() => handleCopy(ad.targetUrl, ad._id)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                        title="Copy destination link"
                      >
                        {copiedId === ad._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Performance metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-2">
                        <MousePointerClick className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Clicks</p>
                          <p className="font-bold text-slate-900 dark:text-white">{ad.clicks || 0}</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Views</p>
                          <p className="font-bold text-slate-900 dark:text-white">{ad.impressions || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => handleToggleStatus(ad._id)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                        : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {isActive ? (
                      <ToggleRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                    <span>{isActive ? "Active" : "Inactive"}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(ad)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Ad details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id, ad.title)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete Ad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {editingAd ? "Edit Advertisement" : "Create Advertisement"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set up image, target link and select ad placement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              {/* Ad Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Ad Title / Campaign Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Mega Sale - 50% Off"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Placement & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Placement Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Ad Placement (Type) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as AdPlacement)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="top">Top Banner (Header / Page Top)</option>
                    <option value="sidebar">Sidebar Ad (Sticky Side Card)</option>
                    <option value="popup">Popup Modal Banner</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {placement === "top"
                      ? "Recommended: Wide landscape image (~1200x200 or 728x90)"
                      : placement === "sidebar"
                      ? "Recommended: Square or portrait image (~300x250 or 300x600)"
                      : "Popup shown to readers"}
                  </p>
                </div>

                {/* Status Switch */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AdStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="active">Active (Visible to users)</option>
                    <option value="inactive">Inactive (Paused / Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Image Source Selection (Upload file VS Direct URL) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Ad Banner Image <span className="text-rose-500">*</span>
                  </label>

                  {/* Switch buttons */}
                  <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode("upload")}
                      className={`px-3 py-1 rounded-md transition ${
                        imageSourceMode === "upload"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode("link")}
                      className={`px-3 py-1 rounded-md transition ${
                        imageSourceMode === "link"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        <span>Paste Link</span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Upload Mode */}
                {imageSourceMode === "upload" ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                        imageUrl
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isUploading
                          ? "Uploading to server..."
                          : "Click to choose image file"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG, WEBP, GIF, SVG (Max 5MB)
                      </p>
                    </div>

                    {uploadError && (
                      <p className="text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* Direct Link Mode */
                  <div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Paste direct URL from Cloudinary, Unsplash, Imgur or any image CDN
                    </p>
                  </div>
                )}

                {/* Image Live Preview */}
                {imageUrl && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
                    <Image
                      src={imageUrl}
                      alt="Banner Preview"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="p-1 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Destination Click URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Click Destination Link (Target URL) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://affiliate.example.com/product-link or https://..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  {targetUrl && (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-3 text-slate-400 hover:text-amber-500 transition"
                      title="Test URL in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Users clicking this ad will be redirected here (opens safely in new tab)
                </p>
              </div>

              {/* Alt Text (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Alt Text / Accessibility (Optional)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Short description for accessibility & SEO"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md transition cursor-pointer"
                >
                  {isPending ? (
                    <span>Saving Ad...</span>
                  ) : editingAd ? (
                    <span>Update Ad</span>
                  ) : (
                    <span>Publish Ad</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      {previewAd && (
        <div
          onClick={() => setPreviewAd(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-700 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  {previewAd.placement} Ad Preview
                </span>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                  {previewAd.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewAd(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-[280px] sm:h-[360px] bg-slate-950 rounded-2xl overflow-hidden">
              <Image
                src={previewAd.imageUrl}
                alt={previewAd.altText || previewAd.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <p className="text-slate-400">
                Target: <span className="text-amber-500 font-mono">{previewAd.targetUrl}</span>
              </p>
              <a
                href={previewAd.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
              >
                <span>Visit Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
