import React, { useState, useEffect } from "react";
import {
  Bell,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Award,
  X,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { AnnouncementPopupConfig } from "../types";

interface AnnouncementPopupProps {
  config?: AnnouncementPopupConfig;
  onNavigate?: (path: string) => void;
  onActionClick?: (path: string) => void;
  forcePreview?: boolean;
}

export const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({
  config,
  onNavigate,
  onActionClick,
  forcePreview = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forcePreview) {
      setIsOpen(true);
      return;
    }

    if (!config || !config.enabled || !config.title) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed previously
    const dismissKey = `announcement_dismissed_${config.title.replace(/\s+/g, "_")}`;
    const isDismissed = localStorage.getItem(dismissKey);

    if (!isDismissed) {
      // Small timeout for smooth entry
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [config, forcePreview]);

  if (!isOpen || !config || (!config.enabled && !forcePreview)) {
    return null;
  }

  const handleDismiss = () => {
    if (!forcePreview && config?.title) {
      const dismissKey = `announcement_dismissed_${config.title.replace(/\s+/g, "_")}`;
      localStorage.setItem(dismissKey, "true");
    }
    setIsOpen(false);
  };

  const handleActionClick = () => {
    if (config.linkUrl) {
      if (onActionClick) {
        onActionClick(config.linkUrl);
      } else if (config.linkUrl.startsWith("http")) {
        window.open(config.linkUrl, "_blank", "noopener,noreferrer");
      } else if (onNavigate) {
        onNavigate(config.linkUrl);
      }
    }
    handleDismiss();
  };

  const getIcon = () => {
    switch (config.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case "achievement":
        return <Award className="w-5 h-5 text-purple-400" />;
      case "info":
      default:
        return <Sparkles className="w-5 h-5 text-blue-400" />;
    }
  };

  const getGradient = () => {
    switch (config.type) {
      case "success":
        return "from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-500/40";
      case "warning":
        return "from-amber-950/90 via-slate-900 to-slate-950 border-amber-500/40";
      case "achievement":
        return "from-purple-950/90 via-slate-900 to-slate-950 border-purple-500/40";
      case "info":
      default:
        return "from-blue-950/90 via-slate-900 to-slate-950 border-blue-500/40";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl bg-gradient-to-b ${getGradient()} border p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden font-sans`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss Announcement"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
              {getIcon()}
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {config.badgeText || "Academic Notice"}
            </span>
          </div>

          {/* Title & Message */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {config.title}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {config.message}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            {config.linkText && config.linkUrl && (
              <button
                onClick={handleActionClick}
                className="w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>{config.linkText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Don't show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
