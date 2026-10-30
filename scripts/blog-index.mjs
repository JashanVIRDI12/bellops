// Writes lib/blog-index.json: every blog post in content/blog/*.mdx, newest
// first, with its frontmatter, contents list, FAQ and reading time. The blog
// pages, the sitemap, RSS and proxy.ts all read this one list, so none of
// them reads files at request time.
//
// next.config.ts runs it whenever Next starts (dev, build, start) and, in
// dev, again whenever a post changes. It stops the build when a post's
// frontmatter is wrong. By hand:
//
//   node scripts/blog-index.mjs

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";
import {
  faqItems,
  outlineHeadings,
  readingMinutes,
  wordCount,
} from "../lib/mdx/post-outline.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = path.join(root, "content/blog");
const publicDir = path.join(root, "public");
const out = path.join(root, "lib/blog-index.json");

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A file in public/ by its site path, with the first 8 hex of its hash. */
function publicFile(src, problems, field) {
  const file = path.join(publicDir, src.split(/[?#]/)[0]);
  if (!src.startsWith("/") || !existsSync(file)) {
    problems.push(`${field}: no file at public${src}`);
    return null;
  }
  return createHash("sha256")
    .update(readFileSync(file))
    .digest("hex")
    .slice(0, 8);
}

function readPost(fileName) {
  const source = readFileSync(path.join(postsDir, fileName), "utf8");
  const tree = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .parse(source);
  const yaml = tree.children.find((node) => node.type === "yaml");
  const front = yaml ? (parseYaml(yaml.value) ?? {}) : {};
  const problems = [];
  const text = (field, required = true) => {
    const value = front[field];
    if (value === undefined && !required) return undefined;
    if (typeof value !== "string" || !value.trim())
      problems.push(`${field}: expected text`);
    return typeof value === "string" ? value.trim() : undefined;
  };

  const slug = text("slug");
  if (slug && `${slug}.mdx` !== fileName)
    problems.push(`slug: "${slug}" must match the file name (${fileName})`);
  const date = text("date");
  if (date && !DATE.test(date)) problems.push("date: expected YYYY-MM-DD");
  const updated = text("updated", false);
  if (updated && !DATE.test(updated))
    problems.push("updated: expected YYYY-MM-DD");
  const tags = front.tags ?? [];
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))
    problems.push("tags: expected a list of words");
  for (const flag of ["draft", "template"])
    if (front[flag] !== undefined && typeof front[flag] !== "boolean")
      problems.push(`${flag}: expected true or false`);
  const ogImage = text("ogImage", false);
  const ogImageVersion = ogImage
    ? publicFile(ogImage, problems, "ogImage")
    : undefined;

  let dataset;
  if (front.dataset !== undefined) {
    const d = front.dataset;
    const fields = ["name", "description", "file", "measurementTechnique"];
    for (const field of fields)
      if (typeof d?.[field] !== "string")
        problems.push(`dataset.${field}: expected text`);
    if (typeof d?.file === "string")
      publicFile(d.file, problems, "dataset.file");
    dataset = {
      name: d?.name,
      description: d?.description,
      file: d?.file,
      measurementTechnique: d?.measurementTechnique,
      variableMeasured: d?.variableMeasured ?? [],
      ...(d?.temporalCoverage ? { temporalCoverage: d.temporalCoverage } : {}),
    };
  }

  if (problems.length)
    throw new Error(
      `content/blog/${fileName}:\n${problems.map((p) => `  - ${p}`).join("\n")}`,
    );

  const toc = outlineHeadings(tree);
  return {
    slug,
    title: text("title"),
    description: text("description"),
    date,
    ...(updated ? { updated } : {}),
    author: text("author"),
    tags,
    draft: front.draft === true,
    ...(front.template === true ? { template: true } : {}),
    ...(front.hub ? { hub: text("hub") } : {}),
    ...(ogImage ? { ogImage, ogImageVersion } : {}),
    readingMinutes: readingMinutes(wordCount(tree)),
    toc,
    faq: faqItems(tree),
    ...(dataset ? { dataset } : {}),
  };
}

export function writeBlogIndex() {
  const posts = readdirSync(postsDir)
    .filter((name) => name.endsWith(".mdx"))
    .map(readPost)
    .sort(
      (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
    );
  const json = `${JSON.stringify({ posts }, null, 2)}\n`;
  // Written only when it changes, so dev doesn't reload for nothing.
  if (!existsSync(out) || readFileSync(out, "utf8") !== json)
    writeFileSync(out, json);
  return posts;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const posts = writeBlogIndex();
    const drafts = posts.filter((post) => post.draft).length;
    console.log(
      `blog-index: ${posts.length} posts (${drafts} drafts) in lib/blog-index.json`,
    );
  } catch (error) {
    console.error(`blog-index: ${error.message}`);
    process.exit(1);
  }
}
