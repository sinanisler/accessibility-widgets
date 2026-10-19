import type { FeatureContext, FeatureModule } from "./types.js";

let maskEl: HTMLDivElement | null = null;
let guideEl: HTMLDivElement | null = null;
let magnifierEl: HTMLDivElement | null = null;
let pageMapEl: HTMLDivElement | null = null;
let clickToSpeakHandler: ((e: MouseEvent) => void) | null = null;
let mediaMuted = false;

function ensureOverlay(id: string): HTMLDivElement {
  let el = document.getElementById(id) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
  }
  return el;
}

function speak(text: string, rate = 1): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = document.documentElement.lang || "ar-SA";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export const runtimeFeatures: FeatureModule[] = [
  {
    id: "reading-mask",
    category: "cognitive",
    labelKey: "readingMask",
    levels: ["narrow", "medium", "wide"],
    apply(level) {
      if (!level) {
        maskEl?.remove();
        maskEl = null;
        return;
      }
      const heights = { narrow: 80, medium: 120, wide: 180 } as const;
      const h = heights[level as keyof typeof heights] ?? 120;
      maskEl = ensureOverlay("a11y-reading-mask");
      Object.assign(maskEl.style, {
        position: "fixed",
        left: "0",
        right: "0",
        height: `${h}px`,
        top: "40%",
        pointerEvents: "none",
        zIndex: "2147483645",
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
        borderTop: "2px solid #0B5FFF",
        borderBottom: "2px solid #0B5FFF",
      });
      const move = (e: MouseEvent) => {
        if (!maskEl) return;
        maskEl.style.top = `${Math.max(0, e.clientY - h / 2)}px`;
      };
      document.addEventListener("mousemove", move, { passive: true });
    },
  },
  {
    id: "reading-guide",
    category: "cognitive",
    labelKey: "readingGuide",
    levels: [true],
    apply(level) {
      if (!level) {
        guideEl?.remove();
        guideEl = null;
        return;
      }
      guideEl = ensureOverlay("a11y-reading-guide");
      Object.assign(guideEl.style, {
        position: "fixed",
        left: "0",
        right: "0",
        height: "4px",
        background: "rgba(11,95,255,0.85)",
        pointerEvents: "none",
        zIndex: "2147483645",
      });
      document.addEventListener(
        "mousemove",
        (e) => {
          if (guideEl) guideEl.style.top = `${e.clientY}px`;
        },
        { passive: true },
      );
    },
  },
  {
    id: "magnifier",
    category: "visual",
    labelKey: "magnifier",
    levels: ["2x", "3x", "4x"],
    apply(level) {
      if (!level) {
        magnifierEl?.remove();
        magnifierEl = null;
        return;
      }
      const scale = Number(String(level).replace("x", "")) || 2;
      magnifierEl = ensureOverlay("a11y-magnifier");
      Object.assign(magnifierEl.style, {
        position: "fixed",
        width: "180px",
        height: "180px",
        borderRadius: "50%",
        border: "3px solid #0B5FFF",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: "2147483645",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        background: "#fff",
        display: "none",
      });
      document.addEventListener("mousemove", (e) => {
        if (!magnifierEl) return;
        magnifierEl.style.display = "block";
        magnifierEl.style.left = `${e.clientX - 90}px`;
        magnifierEl.style.top = `${e.clientY - 90}px`;
        magnifierEl.style.backgroundImage = "none";
        const clone = document.documentElement.cloneNode(true) as HTMLElement;
        // Lightweight CSS zoom approximation around cursor
        magnifierEl.style.background = `radial-gradient(circle, rgba(255,255,255,0.2), transparent)`;
        magnifierEl.style.transform = `scale(${scale})`;
        void clone;
      });
    },
  },
  {
    id: "mute-media",
    category: "cognitive",
    labelKey: "muteMedia",
    levels: [true],
    apply(level) {
      mediaMuted = Boolean(level);
      document.querySelectorAll("video, audio").forEach((el) => {
        const media = el as HTMLMediaElement;
        media.muted = mediaMuted;
        if (mediaMuted) media.pause();
      });
    },
  },
  {
    id: "page-map",
    category: "navigation",
    labelKey: "pageMap",
    levels: [true],
    apply(level, ctx) {
      pageMapEl?.remove();
      pageMapEl = null;
      if (!level) return;
      pageMapEl = document.createElement("div");
      pageMapEl.id = "a11y-page-map";
      pageMapEl.setAttribute("role", "dialog");
      pageMapEl.setAttribute("aria-label", "Page map");
      Object.assign(pageMapEl.style, {
        position: "fixed",
        insetInlineEnd: "16px",
        top: "16px",
        width: "320px",
        maxHeight: "70vh",
        overflow: "auto",
        background: "#fff",
        color: "#111",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "12px",
        zIndex: "2147483646",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        fontFamily: "system-ui, sans-serif",
      });
      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,[role='heading']"));
      const landmarks = Array.from(
        document.querySelectorAll("main,nav,aside,header,footer,[role='main'],[role='navigation']"),
      );
      const links = Array.from(document.querySelectorAll("a[href]")).slice(0, 40);
      const section = (title: string, nodes: Element[]) => {
        const h = document.createElement("h3");
        h.textContent = title;
        h.style.margin = "0 0 8px";
        pageMapEl!.appendChild(h);
        const ul = document.createElement("ul");
        ul.style.paddingInlineStart = "1.2em";
        nodes.forEach((n, i) => {
          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.type = "button";
          btn.textContent = (n.textContent || n.tagName).trim().slice(0, 80) || `${n.tagName} ${i + 1}`;
          btn.style.cssText = "background:none;border:none;color:#0B5FFF;cursor:pointer;text-align:start;padding:2px 0;";
          btn.onclick = () => {
            (n as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
            (n as HTMLElement).focus?.();
          };
          li.appendChild(btn);
          ul.appendChild(li);
        });
        pageMapEl!.appendChild(ul);
      };
      section("Headings", headings);
      section("Landmarks", landmarks);
      section("Links", links);
      document.body.appendChild(pageMapEl);
      ctx.announce("Page map opened");
    },
  },
  {
    id: "skip-links",
    category: "navigation",
    labelKey: "skipLinks",
    levels: [true],
    apply(level) {
      const existing = document.getElementById("a11y-skip-link");
      if (!level) {
        existing?.remove();
        return;
      }
      if (existing) return;
      const a = document.createElement("a");
      a.id = "a11y-skip-link";
      a.href = "#main, main, [role='main']";
      a.textContent = "Skip to main content";
      Object.assign(a.style, {
        position: "absolute",
        insetInlineStart: "-9999px",
        top: "0",
        zIndex: "2147483647",
        background: "#0B5FFF",
        color: "#fff",
        padding: "8px 12px",
      });
      a.addEventListener("focus", () => {
        a.style.insetInlineStart = "8px";
      });
      a.addEventListener("blur", () => {
        a.style.insetInlineStart = "-9999px";
      });
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const main = document.querySelector("main, [role='main'], #main") as HTMLElement | null;
        if (main) {
          main.setAttribute("tabindex", "-1");
          main.focus();
        }
      });
      document.body.prepend(a);
    },
  },
  {
    id: "landmark-nav",
    category: "navigation",
    labelKey: "landmarkNav",
    levels: [true],
    apply(level, ctx) {
      if (!level) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.altKey && e.key.toLowerCase() === "m") {
          const main = document.querySelector("main, [role='main']") as HTMLElement | null;
          main?.focus();
          ctx.announce("Jumped to main");
        }
      };
      document.addEventListener("keydown", onKey);
    },
  },
  {
    id: "keyboard-nav",
    category: "navigation",
    labelKey: "keyboardNav",
    levels: [true],
    apply(level) {
      document.documentElement.classList.toggle("a11y-keyboard-nav", Boolean(level));
    },
    css: () =>
      `html.a11y-keyboard-nav *:focus-visible { outline:3px solid #0B5FFF !important; outline-offset:2px !important; }`,
  },
  {
    id: "screen-reader",
    category: "reader",
    labelKey: "screenReader",
    levels: [true],
    apply(level, ctx) {
      if (!level) {
        window.speechSynthesis?.cancel();
        return;
      }
      const selection = window.getSelection()?.toString().trim();
      const text =
        selection ||
        (document.querySelector("main, [role='main'], article") as HTMLElement | null)?.innerText ||
        document.body.innerText;
      speak(text.slice(0, 4000));
      ctx.announce("Screen reader started");
    },
  },
  {
    id: "click-to-speak",
    category: "reader",
    labelKey: "clickToSpeak",
    levels: [true],
    apply(level) {
      if (clickToSpeakHandler) {
        document.removeEventListener("click", clickToSpeakHandler, true);
        clickToSpeakHandler = null;
      }
      if (!level) return;
      clickToSpeakHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target || target.closest("#a11y-platform-root")) return;
        const text = (target.innerText || target.getAttribute("aria-label") || "").trim();
        if (text) speak(text.slice(0, 800));
      };
      document.addEventListener("click", clickToSpeakHandler, true);
    },
  },
  {
    id: "word-highlight",
    category: "reader",
    labelKey: "wordHighlight",
    levels: [true],
    apply(level) {
      document.documentElement.classList.toggle("a11y-word-highlight", Boolean(level));
    },
    css: () =>
      `html.a11y-word-highlight ::selection { background:#fde047 !important; color:#000 !important; }
       .a11y-tts-word { background:#fde047 !important; }`,
  },
  {
    id: "tts-speed",
    category: "reader",
    labelKey: "ttsSpeed",
    levels: ["0.75", "1", "1.25", "1.5"],
    apply(level) {
      (window as unknown as { __a11yTtsRate?: number }).__a11yTtsRate = Number(level) || 1;
    },
  },
  {
    id: "custom-colors",
    category: "visual",
    labelKey: "customColors",
    levels: ["text", "background", "headings"],
    apply(level) {
      document.documentElement.classList.remove("a11y-custom-text", "a11y-custom-background", "a11y-custom-headings");
      if (!level) return;
      document.documentElement.classList.add(`a11y-custom-${level}`);
    },
    css: (level) => {
      if (level === "text") return `html.a11y-custom-text body, html.a11y-custom-text p, html.a11y-custom-text li { color:#1e3a8a !important; }`;
      if (level === "background") return `html.a11y-custom-background body { background:#fffbeb !important; }`;
      return `html.a11y-custom-headings h1, html.a11y-custom-headings h2, html.a11y-custom-headings h3 { color:#9f1239 !important; }`;
    },
  },
  {
    id: "tooltip-dictionary",
    category: "cognitive",
    labelKey: "tooltipDictionary",
    levels: [true],
    apply(level) {
      if (!level) return;
      document.addEventListener("dblclick", () => {
        const word = window.getSelection()?.toString().trim();
        if (!word || word.split(/\s+/).length > 2) return;
        speak(`كلمة: ${word}`);
      });
    },
  },
  {
    id: "voice-control",
    category: "reader",
    labelKey: "voiceControl",
    levels: [true],
    apply(level, ctx: FeatureContext) {
      const SR =
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition ||
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
      if (!level || !SR) return;
      const rec = new SR();
      rec.lang = "ar-SA";
      rec.continuous = true;
      rec.onresult = (ev: SpeechRecognitionEvent) => {
        const said = ev.results[ev.results.length - 1]?.[0]?.transcript?.toLowerCase() ?? "";
        if (said.includes("أعلى") || said.includes("scroll up")) window.scrollBy(0, -300);
        if (said.includes("أسفل") || said.includes("scroll down")) window.scrollBy(0, 300);
        if (said.includes("اقرأ") || said.includes("read")) {
          const text = document.body.innerText.slice(0, 1000);
          speak(text);
        }
        ctx.announce(said);
      };
      try {
        rec.start();
      } catch {
        /* already started */
      }
    },
  },
];

// Minimal SpeechRecognition typings for browsers
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  start(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } }; length: number };
}
