import "./style.css";
import { escapeXmlText, formatCodePoint } from "./escape";
import { applyTheme, isTheme, readStoredTheme, storeTheme } from "./theme";

const input = document.querySelector<HTMLTextAreaElement>("#input")!;
const output = document.querySelector<HTMLTextAreaElement>("#output")!;
const preview = document.querySelector<HTMLElement>("#preview code")!;
const notice = document.querySelector<HTMLParagraphElement>("#notice")!;
const copyButton = document.querySelector<HTMLButtonElement>("#copy")!;
const clearButton = document.querySelector<HTMLButtonElement>("#clear")!;
const themeSwitch = document.querySelector<HTMLFieldSetElement>("#theme-switch")!;

function describeRemoved(removed: ReturnType<typeof escapeXmlText>["removed"]) {
  const shown = removed.slice(0, 5).map((r) => formatCodePoint(r.codePoint));
  const rest = removed.length - shown.length;
  const list = rest > 0 ? `${shown.join(", ")} and ${rest} more` : shown.join(", ");
  const noun = removed.length === 1 ? "character" : "characters";
  return `Dropped ${removed.length} ${noun} that XML 1.0 cannot represent: ${list}.`;
}

function render() {
  const { text, removed } = escapeXmlText(input.value);

  output.value = text;
  preview.textContent = `<element>${text}</element>`;

  notice.hidden = removed.length === 0;
  if (removed.length > 0) {
    notice.textContent = describeRemoved(removed);
  }
}

async function copyOutput() {
  if (output.value === "") return;

  try {
    await navigator.clipboard.writeText(output.value);
  } catch {
    // Clipboard API needs a secure context and permission; fall back to
    // selecting the text so the user can copy it themselves.
    output.select();
    copyButton.textContent = "Press ⌘C";
    window.setTimeout(() => (copyButton.textContent = "Copy"), 1500);
    return;
  }

  copyButton.textContent = "Copied";
  window.setTimeout(() => (copyButton.textContent = "Copy"), 1500);
}

function setUpTheme() {
  const storage = typeof localStorage === "undefined" ? null : localStorage;
  const initial = readStoredTheme(storage);

  applyTheme(document.documentElement, initial);
  const checked = themeSwitch.querySelector<HTMLInputElement>(
    `input[value="${initial}"]`,
  );
  if (checked) checked.checked = true;

  themeSwitch.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !isTheme(target.value)) return;

    applyTheme(document.documentElement, target.value);
    storeTheme(storage, target.value);
  });
}

setUpTheme();

input.addEventListener("input", render);
copyButton.addEventListener("click", copyOutput);
clearButton.addEventListener("click", () => {
  input.value = "";
  input.focus();
  render();
});

render();
