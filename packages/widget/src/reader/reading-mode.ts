/**
 * Lightweight readability-style content extractor + reading panel.
 */
export function openReadingMode(): void {
  closeReadingMode();

  const article =
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.querySelector("[role='main']") ||
    document.body;

  const clone = article.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("script, style, nav, aside, iframe, noscript, #a11y-platform-root").forEach((n) => n.remove());

  const panel = document.createElement("div");
  panel.id = "a11y-reading-mode";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Reading mode");
  Object.assign(panel.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483646",
    background: "#f8fafc",
    color: "#0f172a",
    overflow: "auto",
    padding: "2rem 1rem",
    fontFamily: "Georgia, 'Times New Roman', serif",
    lineHeight: "1.8",
  });

  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    maxWidth: "42rem",
    margin: "0 auto",
    fontSize: "1.25rem",
  });

  const toolbar = document.createElement("div");
  toolbar.style.cssText = "display:flex;gap:8px;margin-bottom:1rem;position:sticky;top:0;background:#f8fafc;padding:8px 0;";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "إغلاق وضع القراءة";
  closeBtn.onclick = () => closeReadingMode();

  const speakBtn = document.createElement("button");
  speakBtn.type = "button";
  speakBtn.textContent = "استماع";
  speakBtn.onclick = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(wrap.innerText.slice(0, 5000));
    u.lang = document.documentElement.lang || "ar-SA";
    const rate = (window as unknown as { __a11yTtsRate?: number }).__a11yTtsRate ?? 1;
    u.rate = rate;
    let i = 0;
    const words = wrap.innerText.split(/(\s+)/);
    u.onboundary = (ev) => {
      if (ev.name !== "word") return;
      // best-effort highlight via selection
      void i++;
    };
    window.speechSynthesis.speak(u);
    void words;
  };

  toolbar.append(closeBtn, speakBtn);
  wrap.appendChild(toolbar);

  const content = document.createElement("div");
  content.innerHTML = clone.innerHTML;
  wrap.appendChild(content);
  panel.appendChild(wrap);
  document.body.appendChild(panel);
  document.documentElement.classList.add("a11y-reading-mode");
  closeBtn.focus();
}

export function closeReadingMode(): void {
  document.getElementById("a11y-reading-mode")?.remove();
  document.documentElement.classList.remove("a11y-reading-mode");
  window.speechSynthesis?.cancel();
}

export const readingModeFeature = {
  id: "reading-mode",
  category: "reader" as const,
  labelKey: "readingMode",
  levels: [true] as const,
  apply(level: string | number | boolean | null) {
    if (level) openReadingMode();
    else closeReadingMode();
  },
};
