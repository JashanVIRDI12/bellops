/*
 * The shape of a blog post's text, shared by the MDX compiler
 * (lib/mdx/remark-post.mjs) and the post index (scripts/blog-index.mjs), so
 * the contents list, the headings' ids and the FAQ always match the page.
 * Each function takes the post's Markdown tree (mdast).
 */

import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import { SKIP, visit } from "unist-util-visit";

/**
 * Sets the headings' levels and ids, and returns the H2s and H3s for the
 * contents list. The post's title is the page's only H1, so the text's top
 * level becomes H2 whether it was written as ## or ###. Ids are GitHub-style
 * slugs of the heading text ("Headline numbers" → #headline-numbers).
 */
export function outlineHeadings(tree) {
  let top = 6;
  visit(tree, "heading", (node) => {
    top = Math.min(top, node.depth);
  });
  const shift = 2 - top;
  const slugger = new GithubSlugger();
  const toc = [];
  visit(tree, "heading", (node) => {
    node.depth = Math.min(6, Math.max(2, node.depth + shift));
    const text = toString(node).trim();
    const id = slugger.slug(text);
    node.data = {
      ...node.data,
      hProperties: { ...node.data?.hProperties, id },
    };
    if (node.depth <= 3) toc.push({ id, text, depth: node.depth });
  });
  return toc;
}

/**
 * The questions and answers under a heading that starts with "FAQ". Each one
 * is a paragraph that opens with the question in bold (ending in "?"), then
 * the answer:
 *
 *   **How long does a 3D website take?**
 *   A 3D landing page takes about 2 weeks…
 *
 * The section ends at the next heading of its level or above, or at a rule
 * (---). The text is what the page shows, word for word (FAQPage schema).
 */
export function faqItems(tree) {
  const nodes = tree.children;
  const start = nodes.findIndex(
    (node) => node.type === "heading" && /^faq\b/i.test(toString(node).trim()),
  );
  if (start === -1) return [];
  const level = nodes[start].depth;
  const items = [];
  for (const node of nodes.slice(start + 1)) {
    if (node.type === "thematicBreak") break;
    if (node.type === "heading" && node.depth <= level) break;
    if (node.type !== "paragraph") continue;
    const [first, ...rest] = node.children;
    if (first?.type !== "strong") continue;
    const question = toString(first).trim();
    if (!question.endsWith("?")) continue;
    const answer = rest
      .map((child) => (child.type === "break" ? " " : toString(child)))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (answer) items.push({ question, answer });
  }
  return items;
}

/**
 * Words a reader reads: the text without the frontmatter, code or tables
 * (a table of numbers is scanned, not read word by word).
 */
export function wordCount(tree) {
  let words = 0;
  visit(tree, (node) => {
    if (node.type === "table" || node.type === "code") return SKIP;
    if (node.type === "text" || node.type === "inlineCode")
      words += node.value
        .split(/\s+/)
        .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  });
  return words;
}

/** Minutes to read, at about 200 words a minute (at least 1). */
export const readingMinutes = (words) => Math.max(1, Math.round(words / 200));
