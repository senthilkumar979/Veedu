import type { SVGProps } from "react";
import Image from "next/image";
import { cn } from "@veedu/ui";

type MarkProps = SVGProps<SVGSVGElement>;

interface ArtProps {
  className?: string;
}

export function PeacockFeather({ className }: ArtProps) {
  return (
    <Image
      src="/brand/feather.webp"
      alt=""
      width={48}
      height={66}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}

export function Vel({ className, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 64"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M16 2 24 18h-5L16 14l-3 4H8L16 2Z" fill="currentColor" />
      <path d="M16 16v46" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 28h12M12 36h8" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function DevotionalWelcome({ className }: { className?: string }) {
  return (
    <section
      aria-label="Household welcome"
      className={cn(
        "flex min-h-0 items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface/95 px-3 py-2",
        className,
      )}
    >
      <Image
        src="/brand/peacock.webp"
        alt=""
        width={96}
        height={100}
        className="h-24 w-auto shrink-0 object-contain"
      />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Palani
        </p>
        <h2 className="truncate text-lg font-semibold text-ink">Lord Murugan</h2>
      </div>
      <Vel className="h-12 w-6 shrink-0 text-primary" />
      <Image
        src="/brand/rooster.webp"
        alt=""
        width={72}
        height={80}
        className="ml-auto h-20 w-auto shrink-0 object-contain"
      />
    </section>
  );
}
