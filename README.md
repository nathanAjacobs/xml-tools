# xml-tools

A static, client-side tool for escaping plain text so it can be pasted between
two XML element tags. Nothing leaves the browser.

## Escaping rules

| Input           | Output   | Why                                                        |
| --------------- | -------- | ---------------------------------------------------------- |
| `&`             | `&amp;`  | Starts an entity reference.                                 |
| `<`             | `&lt;`   | Starts a tag.                                               |
| `>`             | `&gt;`   | Only required in `]]>`, but always escaping it is standard. |
| carriage return | `&#13;`  | Parsers normalize raw CR/CRLF to LF, altering the value.    |

The carriage-return rule only matters when calling `escapeXmlText` directly —
a `<textarea>` normalizes CRLF to LF before JavaScript can read its value, so
the web UI never sees one.

Quotes are left as-is: they are only significant inside attribute values, not
in character data. Code points XML 1.0 cannot represent at all (most C0
controls, lone surrogates, `U+FFFE`/`U+FFFF`) are dropped, and the UI reports
which ones.

## Theming

Auto / Light / Dark, chosen from the header. "Auto" follows the OS via
`prefers-color-scheme` and is the default; an explicit choice sets `data-theme`
on `<html>` and is remembered in `localStorage` under `xml-tools:theme`
(choosing Auto clears the key). A small inline script in `index.html` applies
the stored value before first paint so the wrong theme never flashes — it
duplicates a few lines of `src/theme.ts` on purpose, since the module script is
deferred until after the document renders.

## Development

```
npm install
npm run dev      # local dev server
npm test         # unit tests for the escaping rules
npm run build    # type-check and emit dist/
```

## Deploying

Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and
publishes `dist/`. One-time setup: in the repository, go to
**Settings → Pages** and set **Source** to **GitHub Actions**.

`vite.config.ts` uses a relative `base`, so the build works both at a user site
root and under a project sub-path like `user.github.io/xml-tools/`.

## License

[MIT](LICENSE).
