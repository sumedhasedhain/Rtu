import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia — usePrefersReducedMotion (and anything that
// renders a GlassPanel/AuroraBackground) needs it to exist.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
