import { describe, expect, it } from "vitest";
import { applyTheme, isTheme, readStoredTheme, storeTheme } from "./theme";

const KEY = "xml-tools:theme";

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    has: (k: string) => map.has(k),
  };
}

const throwingStorage = {
  getItem() {
    throw new DOMException("denied");
  },
  setItem() {
    throw new DOMException("denied");
  },
  removeItem() {
    throw new DOMException("denied");
  },
};

/** Minimal stand-in for documentElement — avoids pulling in a DOM environment. */
function fakeRoot() {
  const attrs = new Map<string, string>();
  return {
    setAttribute: (k: string, v: string) => void attrs.set(k, v),
    removeAttribute: (k: string) => void attrs.delete(k),
    getAttribute: (k: string) => attrs.get(k) ?? null,
  } as unknown as HTMLElement & { getAttribute(k: string): string | null };
}

describe("isTheme", () => {
  it("accepts the three known themes", () => {
    expect(["system", "light", "dark"].every(isTheme)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isTheme("sepia")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

describe("readStoredTheme", () => {
  it("returns the stored theme", () => {
    expect(readStoredTheme(fakeStorage({ [KEY]: "dark" }))).toBe("dark");
  });

  it("defaults to system when nothing is stored", () => {
    expect(readStoredTheme(fakeStorage())).toBe("system");
  });

  it("defaults to system on a corrupted value", () => {
    expect(readStoredTheme(fakeStorage({ [KEY]: "neon" }))).toBe("system");
  });

  it("defaults to system when storage throws", () => {
    expect(readStoredTheme(throwingStorage)).toBe("system");
  });

  it("defaults to system when there is no storage", () => {
    expect(readStoredTheme(null)).toBe("system");
  });
});

describe("storeTheme", () => {
  it("persists an explicit choice", () => {
    const storage = fakeStorage();
    storeTheme(storage, "light");
    expect(storage.getItem(KEY)).toBe("light");
  });

  it("clears the key for system rather than storing it", () => {
    const storage = fakeStorage({ [KEY]: "dark" });
    storeTheme(storage, "system");
    expect(storage.has(KEY)).toBe(false);
  });

  it("does not throw when storage is unavailable", () => {
    expect(() => storeTheme(throwingStorage, "dark")).not.toThrow();
    expect(() => storeTheme(null, "dark")).not.toThrow();
  });
});

describe("applyTheme", () => {
  it("sets data-theme for an explicit choice", () => {
    const root = fakeRoot();
    applyTheme(root, "dark");
    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  it("removes data-theme for system so the media query applies", () => {
    const root = fakeRoot();
    applyTheme(root, "dark");
    applyTheme(root, "system");
    expect(root.getAttribute("data-theme")).toBeNull();
  });
});

describe("round trip", () => {
  it("restores an explicit choice on the next visit", () => {
    const storage = fakeStorage();
    storeTheme(storage, "light");
    expect(readStoredTheme(storage)).toBe("light");
  });
});
