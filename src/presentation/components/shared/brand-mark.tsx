import { cn } from "@/shared/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" className="fill-sidebar" />
      <path
        d="M32 12 C32 20 24 24 24 34 C24 41.2 27.6 46 32 46 C36.4 46 40 41.2 40 34 C40 24 32 20 32 12 Z"
        stroke="currentColor"
        strokeWidth="2.25"
        fill="none"
        strokeLinejoin="round"
      />
      <line x1="32" y1="46" x2="32" y2="52" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <line x1="26" y1="52" x2="38" y2="52" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}
