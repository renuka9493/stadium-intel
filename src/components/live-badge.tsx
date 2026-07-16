import { Radio } from "lucide-react";
import { useLiveStadium } from "@/lib/live-stadium";

export function LiveBadge({ label = "Live" }: { label?: string }) {
  const { updatedAt } = useLiveStadium();
  const seconds = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-destructive ring-1 ring-destructive/30">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
      </span>
      <Radio className="h-3 w-3" />
      {label} · {seconds}s
    </span>
  );
}