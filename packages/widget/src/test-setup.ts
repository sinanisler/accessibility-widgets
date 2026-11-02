// Node 25+ ships its own global localStorage, which hides jsdom's and is undefined without a file.
const dom = (globalThis as unknown as { jsdom?: { window: Window } }).jsdom;
if (dom && !globalThis.localStorage) {
  Object.defineProperty(globalThis, "localStorage", { value: dom.window.localStorage });
  Object.defineProperty(globalThis, "sessionStorage", { value: dom.window.sessionStorage });
}
