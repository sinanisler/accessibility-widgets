import type { ButtonIconId } from "@a11y/core";

/** 24×24 stroke icons; color comes from `currentColor`. */
const paths: Record<string, string> = {
  "bigger-text": '<path d="M3 18 7 7l4 11M4.4 14.5h5.2M13.5 18l3.3-8.5L20 18M14.6 15.5h4.4"/>',
  "line-height": '<path d="M6 4v16M3.5 6.5 6 4l2.5 2.5M3.5 17.5 6 20l2.5-2.5M11.5 7H21M11.5 12H21M11.5 17H21"/>',
  "text-spacing": '<path d="M5 6h14M8 6v6M16 6v6M3 18h18M6 15.5 3.5 18 6 20.5M18 15.5l2.5 2.5-2.5 2.5"/>',
  "reading-guide": '<rect x="2.5" y="10" width="19" height="4.5" rx="1.2"/><path d="M5 5.5h14M5 19h9"/>',
  "high-contrast": '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
  "highlight-links": '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  "highlight-headings": '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8.5 8.5v7M15.5 8.5v7M8.5 12h7"/>',
  "bigger-cursor": '<path d="M5 3l14 7.2-6 1.8-2.2 6.5z"/><path d="M13 12l5 5"/>',
  "strong-focus": '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/><circle cx="12" cy="12" r="2.6"/>',
  "pause-animations": '<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>',
  "font-family": '<path d="M4 19 9 5l5 14M5.8 14.5h6.4M15 19v-6.5a2.8 2.8 0 0 1 5.5 0V19M15 15.5h5.5"/>',
  "text-align": '<path d="M4 6h16M4 10h11M4 14h16M4 18h9"/>',
  "reading-mask": '<path d="M3 4.5h18M3 19.5h18" opacity=".45"/><rect x="2.5" y="9" width="19" height="6" rx="1.5"/>',
  saturation: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/><path d="M12 20V8.5"/>',
  "color-filter": '<circle cx="9" cy="9.5" r="5"/><circle cx="15" cy="9.5" r="5"/><circle cx="12" cy="14.5" r="5"/>',
  "easier-reading": '<path d="M3.5 5.5H9a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5h-6zM20.5 5.5H15a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5h6z"/>',
  "clearer-view": '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  "easier-navigation": '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h1M10.5 10h1M14.5 10h1M8 14h8"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5 10 17 19 7.5" stroke-width="2.6"/>',
  feature: '<circle cx="12" cy="12" r="8.5"/>',
};

const buttonPaths: Record<ButtonIconId, string> = {
  person: '<circle cx="12" cy="4.8" r="1.9" fill="currentColor" stroke="none"/><path d="M4.5 8.8c2.5.8 5 1.2 7.5 1.2s5-.4 7.5-1.2M12 10v4.6M8.6 20.5 12 14.6l3.4 5.9"/>',
  a11y: '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="7.4" r="1.4" fill="currentColor" stroke="none"/><path d="M7.2 10c1.6.5 3.2.7 4.8.7s3.2-.2 4.8-.7M12 10.7v3.4M9.8 18l2.2-3.9 2.2 3.9"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  text: paths["bigger-text"]!,
};

function wrap(body: string, className = ""): string {
  const cls = className ? ` class="${className}"` : "";
  return `<svg${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

export function icon(name: string, className = ""): string {
  return wrap(paths[name] ?? paths.feature!, className);
}

export function buttonIcon(id: ButtonIconId | undefined): string {
  return wrap(buttonPaths[id ?? "person"] ?? buttonPaths.person);
}
