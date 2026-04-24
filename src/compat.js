if (typeof globalThis.chrome === "undefined" && typeof globalThis.browser !== "undefined") {
  globalThis.chrome = globalThis.browser;
}