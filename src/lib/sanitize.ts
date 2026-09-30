import sanitizeHtml from "sanitize-html";

export function sanitizeContent(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "p",
      "a",
      "ul",
      "ol",
      "nl",
      "li",
      "b",
      "i",
      "strong",
      "em",
      "strike",
      "code",
      "pre",
      "hr",
      "br",
      "table",
      "thead",
      "caption",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "span",
      "img",
      "figure",
      "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        // Enforce rel="noopener noreferrer" for external links
        if (attribs.href && !attribs.href.startsWith("/")) {
          attribs.rel = "noopener noreferrer";
        }
        return {
          tagName: "a",
          attribs,
        };
      },
      img: (tagName, attribs) => {
        // Ensure lazy loading by default
        attribs.loading = "lazy";
        return {
          tagName: "img",
          attribs,
        };
      },
    },
  });
}

export function stripHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
}
