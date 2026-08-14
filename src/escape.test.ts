import { describe, expect, it } from "vitest";
import { escapeXmlText, formatCodePoint } from "./escape";

describe("escapeXmlText", () => {
  it("leaves ordinary text untouched", () => {
    expect(escapeXmlText("hello world").text).toBe("hello world");
  });

  it("escapes the markup-significant characters", () => {
    expect(escapeXmlText("a & b < c > d").text).toBe("a &amp; b &lt; c &gt; d");
  });

  it("escapes ampersands before the entities it introduces", () => {
    expect(escapeXmlText("&lt;").text).toBe("&amp;lt;");
  });

  it("neutralizes a CDATA terminator", () => {
    expect(escapeXmlText("]]>").text).toBe("]]&gt;");
  });

  it("leaves quotes alone — they are only special inside attributes", () => {
    expect(escapeXmlText(`he said "hi" and 'bye'`).text).toBe(
      `he said "hi" and 'bye'`,
    );
  });

  it("preserves carriage returns as a numeric reference", () => {
    expect(escapeXmlText("a\r\nb").text).toBe("a&#13;\nb");
  });

  it("keeps tabs and newlines literal", () => {
    expect(escapeXmlText("a\tb\nc").text).toBe("a\tb\nc");
  });

  it("keeps astral-plane characters intact", () => {
    expect(escapeXmlText("emoji 😀").text).toBe("emoji 😀");
  });

  it("drops control characters XML cannot represent", () => {
    const result = escapeXmlText("a\u0000b\u001Fc");
    expect(result.text).toBe("abc");
    expect(result.removed).toEqual([
      { codePoint: 0x00, index: 1 },
      { codePoint: 0x1f, index: 3 },
    ]);
  });

  it("drops lone surrogates", () => {
    const result = escapeXmlText("a\ud800b");
    expect(result.text).toBe("ab");
    expect(result.removed).toEqual([{ codePoint: 0xd800, index: 1 }]);
  });

  it("handles empty input", () => {
    expect(escapeXmlText("")).toEqual({ text: "", removed: [] });
  });
});

describe("formatCodePoint", () => {
  it("formats with at least four hex digits", () => {
    expect(formatCodePoint(0x0)).toBe("U+0000");
    expect(formatCodePoint(0x1f600)).toBe("U+1F600");
  });
});
