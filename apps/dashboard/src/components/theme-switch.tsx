"use client";

import { clsx } from "clsx";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export const THEME_KEY = "dashboard-theme";

/** Runs in <head> before paint so a dark-mode visitor never sees a white flash. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}`;

function apply(theme: Theme) {
  const dark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

const OPTIONS = [
  { id: "light", label: "فاتح", Icon: Sun },
  { id: "dark", label: "داكن", Icon: Moon },
  { id: "system", label: "حسب الجهاز", Icon: Monitor },
] as const;

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      /* storage blocked: follow the system */
    }
  }, []);

  useEffect(() => {
    apply(theme);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  function choose(next: Theme) {
    setTheme(next);
    try {
      if (next === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {
      /* the choice still applies for this visit */
    }
  }

  return (
    <div role="group" aria-label="مظهر اللوحة" className="flex rounded-xl bg-ink-100 p-1">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={theme === id}
          onClick={() => choose(id)}
          className={clsx(
            "grid h-8 flex-1 place-items-center rounded-lg text-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand",
            "aria-pressed:bg-surface aria-pressed:text-ink-900 aria-pressed:shadow-card",
          )}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
