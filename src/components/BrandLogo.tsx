import React from "react";
import { getSiteSettings } from "../services/db";

interface BrandLogoProps {
  className?: string;
  variant?: "full" | "icon" | "stacked" | "light-text";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showTagline?: boolean;
  withHighlightGlow?: boolean;
  customLogoUrl?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  variant = "full",
  size = "md",
  showTagline = true,
  withHighlightGlow = false,
  customLogoUrl
}) => {
  const activeLogo = customLogoUrl;

  // Sizing definitions
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
    xl: "h-18",
    hero: "h-20 sm:h-24 md:h-28"
  };

  // If a custom uploaded image logo exists and is not an SVG markup
  if (activeLogo && activeLogo.trim() !== "") {
    return (
      <div
        className={`inline-flex items-center gap-3 relative ${
          withHighlightGlow ? "p-1 rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/15 to-blue-500/10 shadow-lg shadow-blue-500/10" : ""
        } ${className}`}
      >
        <img
          src={activeLogo}
          alt="LearnwithPems"
          className={`${sizeClasses[size]} w-auto object-contain max-w-full rounded-xl transition-transform hover:scale-105 duration-200`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Icon only
  if (variant === "icon") {
    return (
      <div
        className={`relative inline-flex items-center justify-center ${
          size === "sm" ? "w-8 h-8" : size === "md" ? "w-10 h-10" : size === "lg" ? "w-14 h-14" : "w-20 h-20"
        } rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-1.5 shadow-md shadow-blue-950/40 border border-blue-800/40 ${className}`}
      >
        <svg viewBox="0 0 110 115" className="w-full h-full">
          <defs>
            <linearGradient id="iconNavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="100%" stop-color="#0284c7" />
            </linearGradient>
            <linearGradient id="iconCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
          </defs>
          <path d="M 50 82 C 34 82 18 88 10 94 C 18 84 34 78 50 78 Z" fill="#1e3a8a" />
          <path d="M 50 90 C 32 90 14 97 5 104 C 16 93 33 86 50 86 Z" fill="#0284c7" />
          <path d="M 54 82 C 70 82 86 88 94 94 C 86 84 70 78 54 78 Z" fill="#0ea5e9" />
          <path d="M 54 90 C 72 90 90 97 99 104 C 88 93 71 86 54 86 Z" fill="#38bdf8" />
          <path d="M 28 20 C 28 14 34 14 34 20 L 34 72 C 34 76 38 78 44 78 L 56 78 C 60 78 60 84 56 84 L 32 84 C 26 84 24 80 24 74 L 24 24 Z" fill="#ffffff" />
          <path d="M 44 14 L 44 74 C 44 79 48 81 52 81 C 56 81 56 75 52 75 L 50 75 L 50 48 C 54 48 68 48 76 42 C 84 36 86 24 78 17 C 70 11 54 11 44 14 Z M 52 20 C 58 19 70 19 73 24 C 76 29 73 38 68 40 C 62 42 54 41 52 41 Z" fill="url(#iconCyan)" />
          <path d="M 82 14 Q 82 22 90 22 Q 82 22 82 30 Q 82 22 74 22 Q 82 22 82 14 Z" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // Full Vector Logo with customizable theme
  const isLightText = variant === "light-text";

  return (
    <div
      className={`inline-flex items-center gap-3 relative select-none ${
        withHighlightGlow
          ? "p-2 sm:p-3 rounded-2xl bg-gradient-to-r from-blue-900/20 via-cyan-500/10 to-indigo-900/20 border border-blue-500/20 shadow-xl shadow-cyan-900/10 backdrop-blur-sm"
          : ""
      } ${className}`}
    >
      <div
        className={`${
          size === "sm"
            ? "w-8 h-8"
            : size === "md"
            ? "w-10 h-10"
            : size === "lg"
            ? "w-14 h-14"
            : size === "xl"
            ? "w-18 h-18"
            : "w-20 sm:w-24 h-20 sm:h-24"
        } shrink-0`}
      >
        <svg viewBox="0 0 110 115" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`lwpNavy_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isLightText ? "#38bdf8" : "#0f2b5c"} />
              <stop offset="100%" stopColor={isLightText ? "#0284c7" : "#091836"} />
            </linearGradient>
            <linearGradient id={`lwpCyan_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Book Base Pages */}
          <path d="M 50 82 C 34 82 18 88 10 94 C 18 84 34 78 50 78 Z" fill={isLightText ? "#1e293b" : "#0f2b5c"} />
          <path d="M 50 90 C 32 90 14 97 5 104 C 16 93 33 86 50 86 Z" fill={isLightText ? "#0284c7" : "#1e3a8a"} />
          <path d="M 50 98 C 30 98 12 105 2 112 C 14 102 32 94 50 94 Z" fill="#0284c7" />

          <path d="M 54 82 C 70 82 86 88 94 94 C 86 84 70 78 54 78 Z" fill="#0284c7" />
          <path d="M 54 90 C 72 90 90 97 99 104 C 88 93 71 86 54 86 Z" fill="#0ea5e9" />
          <path d="M 54 98 C 74 98 92 105 102 112 C 90 102 72 94 54 94 Z" fill="#38bdf8" />

          {/* Monogram LP */}
          <path
            d="M 28 20 C 28 14 34 14 34 20 L 34 72 C 34 76 38 78 44 78 L 56 78 C 60 78 60 84 56 84 L 32 84 C 26 84 24 80 24 74 L 24 24 Z"
            fill={isLightText ? "#ffffff" : `url(#lwpNavy_${size})`}
          />
          <path
            d="M 44 14 L 44 74 C 44 79 48 81 52 81 C 56 81 56 75 52 75 L 50 75 L 50 48 C 54 48 68 48 76 42 C 84 36 86 24 78 17 C 70 11 54 11 44 14 Z M 52 20 C 58 19 70 19 73 24 C 76 29 73 38 68 40 C 62 42 54 41 52 41 Z"
            fill={`url(#lwpCyan_${size})`}
          />

          {/* Sparkles */}
          <path d="M 82 14 Q 82 22 90 22 Q 82 22 82 30 Q 82 22 74 22 Q 82 22 82 14 Z" fill="#ffffff" />
          <path d="M 94 32 Q 94 36 98 36 Q 94 36 94 40 Q 94 36 90 36 Q 94 36 94 32 Z" fill="#38bdf8" />
        </svg>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-baseline tracking-tight font-black leading-none">
          <span
            className={`${
              size === "sm"
                ? "text-base"
                : size === "md"
                ? "text-xl sm:text-2xl"
                : size === "lg"
                ? "text-2xl sm:text-3xl"
                : size === "xl"
                ? "text-3xl sm:text-4xl"
                : "text-4xl sm:text-5xl"
            } ${isLightText ? "text-white" : "text-[#0f2b5c]"}`}
          >
            Learn
          </span>
          <span
            className={`${
              size === "sm"
                ? "text-base"
                : size === "md"
                ? "text-xl sm:text-2xl"
                : size === "lg"
                ? "text-2xl sm:text-3xl"
                : size === "xl"
                ? "text-3xl sm:text-4xl"
                : "text-4xl sm:text-5xl"
            } text-[#00a3e0] ml-0.5`}
          >
            with
          </span>
          <span
            className={`${
              size === "sm"
                ? "text-base"
                : size === "md"
                ? "text-xl sm:text-2xl"
                : size === "lg"
                ? "text-2xl sm:text-3xl"
                : size === "xl"
                ? "text-3xl sm:text-4xl"
                : "text-4xl sm:text-5xl"
            } ${isLightText ? "text-white" : "text-[#0f2b5c]"} ml-0.5`}
          >
            Pems
          </span>
        </div>

        {showTagline && (
          <div
            className={`flex items-center gap-1.5 mt-1 font-bold tracking-widest uppercase ${
              size === "sm"
                ? "text-[8px]"
                : size === "md"
                ? "text-[9px]"
                : size === "lg"
                ? "text-[11px]"
                : "text-xs"
            } ${isLightText ? "text-cyan-300/90" : "text-[#0f2b5c]/80"}`}
          >
            <span className="w-2.5 h-[1.5px] bg-[#00a3e0] rounded-full inline-block" />
            <span>Learn Beyond Limits</span>
            <span className="w-2.5 h-[1.5px] bg-[#00a3e0] rounded-full inline-block" />
          </div>
        )}
      </div>
    </div>
  );
};
