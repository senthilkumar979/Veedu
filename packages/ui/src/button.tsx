import * as React from "react";
import { cn } from "./cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-[background,transform,box-shadow] duration-normal disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" && "h-8 rounded-md px-3 text-sm",
          size === "md" && "h-10 rounded-md px-4 text-sm",
          size === "lg" && "h-11 rounded-lg px-5 text-base",
          variant === "primary" &&
            "bg-primary text-white hover:bg-primary-hover active:bg-primary-active",
          variant === "secondary" &&
            "border border-border bg-surface text-ink hover:bg-surface-hover",
          variant === "ghost" && "text-ink hover:bg-surface-hover",
          variant === "danger" &&
            "bg-danger text-white hover:opacity-90",
          variant === "soft" &&
            "bg-primary-soft text-primary hover:bg-primary-soft/80",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
