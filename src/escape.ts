export interface EscapeResult {
  /** The escaped text, safe to place between an XML element's tags. */
  text: string;
  /** Code points dropped because XML 1.0 cannot represent them at all. */
  removed: RemovedChar[];
}

export interface RemovedChar {
  codePoint: number;
  /** Index of the code point within the original input. */
  index: number;
}

/**
 * XML 1.0 allows only these code points anywhere in a document:
 * #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
 *
 * Anything else (most C0 controls, lone surrogates, #xFFFE/#xFFFF) is illegal
 * even as a numeric character reference, so it can only be dropped.
 */
function isValidXmlChar(cp: number): boolean {
  return (
    cp === 0x9 ||
    cp === 0xa ||
    cp === 0xd ||
    (cp >= 0x20 && cp <= 0xd7ff) ||
    (cp >= 0xe000 && cp <= 0xfffd) ||
    (cp >= 0x10000 && cp <= 0x10ffff)
  );
}

/**
 * Escapes a plain string for use as the character data between two XML tags.
 *
 * `&` and `<` must be escaped. `>` only has to be escaped when it ends a `]]>`
 * sequence, but escaping it unconditionally is conventional and always valid.
 * A literal carriage return is escaped as a numeric reference because parsers
 * normalize raw CR and CRLF to LF, which would silently alter the value.
 */
export function escapeXmlText(input: string): EscapeResult {
  let text = "";
  const removed: RemovedChar[] = [];
  let index = 0;

  for (const char of input) {
    const cp = char.codePointAt(0)!;

    if (!isValidXmlChar(cp)) {
      removed.push({ codePoint: cp, index });
    } else {
      switch (char) {
        case "&":
          text += "&amp;";
          break;
        case "<":
          text += "&lt;";
          break;
        case ">":
          text += "&gt;";
          break;
        case "\r":
          text += "&#13;";
          break;
        default:
          text += char;
      }
    }

    index++;
  }

  return { text, removed };
}

export function formatCodePoint(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}
