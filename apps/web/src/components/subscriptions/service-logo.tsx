"use client";

import type { ReactNode } from "react";

/** Brand mark for known services — matched on name/provider text. */
export function ServiceLogo({
  name,
  provider,
  className,
}: {
  name: string;
  provider?: string | null;
  className?: string;
}) {
  const key = `${name} ${provider ?? ""}`.toLowerCase();
  const brand = matchBrand(key);
  const size = className ?? "h-11 w-11";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${size} ${brand.bg}`}
      aria-hidden
    >
      {brand.mark}
    </span>
  );
}

function matchBrand(key: string): { bg: string; mark: ReactNode } {
  if (key.includes("netflix")) {
    return {
      bg: "bg-[#E50914]",
      mark: (
        <span className="text-lg font-black tracking-tighter text-white">N</span>
      ),
    };
  }
  if (key.includes("prime") || key.includes("amazon")) {
    return {
      bg: "bg-[#00A8E1]",
      mark: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M12 3c-2.2 0-4 1.4-4 3.5S9.8 10 12 10s4-1.4 4-3.5S14.2 3 12 3zm-7 9.5c0-.8.7-1.5 1.5-1.5h11c.8 0 1.5.7 1.5 1.5 0 3.3-3.1 6-7 6s-7-2.7-7-6z" />
        </svg>
      ),
    };
  }
  if (key.includes("luminus")) {
    return {
      bg: "bg-[#FF6600]",
      mark: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M12 2 4 7v10l8 5 8-5V7l-8-5zm0 3.2 5.2 3.2v6.4L12 18.8l-5.2-3.2V8.4L12 5.2z" />
        </svg>
      ),
    };
  }
  if (key.includes("chatgpt") || key.includes("openai")) {
    return {
      bg: "bg-[#10A37F]",
      mark: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M12 2a4 4 0 0 1 3.5 2.05A4 4 0 0 1 20 8a4 4 0 0 1-.5 1.95A4 4 0 0 1 20 14a4 4 0 0 1-4.5 3.95A4 4 0 0 1 12 22a4 4 0 0 1-3.5-2.05A4 4 0 0 1 4 16a4 4 0 0 1 .5-1.95A4 4 0 0 1 4 10a4 4 0 0 1 4.5-3.95A4 4 0 0 1 12 2z" />
        </svg>
      ),
    };
  }
  if (key.includes("google one") || key.includes("googleone") || (key.includes("google") && key.includes("one"))) {
    return {
      bg: "bg-white border border-border",
      mark: (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <path fill="#4285F4" d="M12 11v2.4h4.9c-.2 1.2-1.5 3.5-4.9 3.5-3 0-5.4-2.4-5.4-5.4S9 6.1 12 6.1c1.7 0 2.8.7 3.5 1.3l2.4-2.3C16.6 3.8 14.5 2.8 12 2.8 7.4 2.8 3.7 6.5 3.7 11.1S7.4 19.4 12 19.4c4.9 0 8.1-3.4 8.1-8.3 0-.6-.1-1-.1-1.5H12z" />
        </svg>
      ),
    };
  }
  if (key.includes("cursor")) {
    return {
      bg: "bg-[#1A1A1A]",
      mark: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
          <path d="M4 3.5 18.5 12 10 14.2 7.5 20.5 4 3.5z" />
        </svg>
      ),
    };
  }
  const letter = (key.trim()[0] || "?").toUpperCase();
  return {
    bg: "bg-primary-soft text-primary",
    mark: <span className="text-base font-bold">{letter}</span>,
  };
}
