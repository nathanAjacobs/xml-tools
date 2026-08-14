export const THEMES = ["system", "light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "xml-tools:theme";

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

/**
 * Reads the stored preference. Falls back to "system" for anything unexpected,
 * including a Safari private-mode localStorage that throws on access.
 */
export function readStoredTheme(storage: Pick<Storage, "getItem"> | null): Theme {
  try {
    const stored = storage?.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function storeTheme(
  storage: Pick<Storage, "setItem" | "removeItem"> | null,
  theme: Theme,
): void {
  try {
    if (theme === "system") {
      // Nothing stored means "follow the OS", which is also the default for a
      // first-time visitor — keep those two states represented the same way.
      storage?.removeItem(STORAGE_KEY);
    } else {
      storage?.setItem(STORAGE_KEY, theme);
    }
  } catch {
    // Storage unavailable; the choice still applies for this page view.
  }
}

/**
 * Applies a theme by setting (or clearing) data-theme on the root element.
 * "system" clears the attribute so the prefers-color-scheme media query in the
 * stylesheet takes over.
 */
export function applyTheme(root: HTMLElement, theme: Theme): void {
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}
