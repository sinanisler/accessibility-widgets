"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/toast";

export function CopyField({ value, label, multiline }: { value: string; label: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast("تم النسخ");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("تعذّر النسخ تلقائياً. حدّد النص وانسخه يدوياً.", "error");
    }
  }

  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-ink-600">{label}</span>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-[#323845] bg-[#141821]">
        <code
          dir="ltr"
          className={
            multiline
              ? "min-w-0 flex-1 whitespace-pre-wrap break-all p-3 text-xs leading-relaxed text-[#EDEFF3]"
              : "min-w-0 flex-1 truncate p-3 text-xs text-[#EDEFF3]"
          }
        >
          {value}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          aria-label={`نسخ ${label}`}
          className="flex shrink-0 items-center gap-1.5 border-s border-[#323845] bg-[#1F242E] px-3 text-xs font-semibold text-white hover:bg-[#323845] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-brand"
        >
          {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
          {copied ? "نُسخ" : "نسخ"}
        </button>
      </div>
    </div>
  );
}
