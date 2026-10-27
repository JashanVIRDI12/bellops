/*
 * The remark plugin every blog post (content/blog/*.mdx) is compiled with
 * (next.config.ts):
 *
 * - Headings: levels and ids (lib/mdx/post-outline.mjs), for the contents
 *   list's links.
 * - Images: a local image (![alt](/blog/…png) or <Image src="/blog/…png" />)
 *   is imported as a file, so next/image knows its size and serves it from
 *   a hashed address: a replaced picture gets a new address, never a stale
 *   cache. The first one is marked `hero` (loaded straight away).
 * - <SortableRankingTable>: the Markdown table written inside it becomes
 *   its `header` and `rows`, so the table in the post stays the one source
 *   of the numbers.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { outlineHeadings } from "./post-outline.mjs";

const publicDir = path.resolve("public");

/* JavaScript syntax trees (estree) for what the plugin adds. */
const literal = (value) => ({
  type: "Literal",
  value,
  raw: JSON.stringify(value),
});
const array = (elements) => ({ type: "ArrayExpression", elements });
const program = (body) => ({ type: "Program", sourceType: "module", body });

/** An attribute set to an expression: name={expression}. */
const expressionAttribute = (name, expression, source) => ({
  type: "mdxJsxAttribute",
  name,
  value: {
    type: "mdxJsxAttributeValueExpression",
    value: source,
    data: {
      estree: program([{ type: "ExpressionStatement", expression }]),
    },
  },
});

/** `import name from "specifier"`, at the top of the post's module. */
const importDefault = (name, specifier) => ({
  type: "mdxjsEsm",
  value: `import ${name} from ${JSON.stringify(specifier)}`,
  data: {
    estree: program([
      {
        type: "ImportDeclaration",
        specifiers: [
          {
            type: "ImportDefaultSpecifier",
            local: { type: "Identifier", name },
          },
        ],
        source: literal(specifier),
        attributes: [],
      },
    ]),
  },
});

/** The file in public/ that a site path like /blog/x.png names, if any. */
function publicFile(src) {
  if (typeof src !== "string" || !src.startsWith("/") || src.startsWith("//"))
    return null;
  const file = path.join(publicDir, decodeURI(src.split(/[?#]/)[0]));
  return file.startsWith(publicDir + path.sep) && existsSync(file)
    ? file
    : null;
}

const stringAttribute = (node, name) => {
  const attribute = node.attributes.find(
    (item) => item.type === "mdxJsxAttribute" && item.name === name,
  );
  return typeof attribute?.value === "string" ? attribute.value : undefined;
};

function localImages(tree, file) {
  const imports = [];
  const importFor = (target) => {
    const name = `postImage${imports.length}`;
    let specifier = path.relative(path.dirname(file.path), target);
    if (!specifier.startsWith(".")) specifier = `./${specifier}`;
    imports.push(importDefault(name, specifier.split(path.sep).join("/")));
    return name;
  };

  visit(tree, (node, index, parent) => {
    if (node.type === "image") {
      const target = publicFile(node.url);
      if (!target || !parent || index === undefined) return;
      const name = importFor(target);
      parent.children[index] = {
        type: "mdxJsxTextElement",
        name: "Image",
        attributes: [
          expressionAttribute("src", { type: "Identifier", name }, name),
          { type: "mdxJsxAttribute", name: "alt", value: node.alt ?? "" },
          ...(imports.length === 1
            ? [{ type: "mdxJsxAttribute", name: "hero", value: null }]
            : []),
        ],
        children: [],
      };
      return;
    }
    if (
      (node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement") &&
      node.name === "Image"
    ) {
      const target = publicFile(stringAttribute(node, "src"));
      if (!target) return;
      const name = importFor(target);
      node.attributes = node.attributes.filter((item) => item.name !== "src");
      node.attributes.unshift(
        expressionAttribute("src", { type: "Identifier", name }, name),
      );
      if (imports.length === 1)
        node.attributes.push({
          type: "mdxJsxAttribute",
          name: "hero",
          value: null,
        });
    }
  });
  tree.children.unshift(...imports);
}

function rankingTables(tree, file) {
  visit(tree, "mdxJsxFlowElement", (node) => {
    if (node.name !== "SortableRankingTable") return;
    const table = node.children.find((child) => child.type === "table");
    if (!table) {
      file.fail(
        "<SortableRankingTable> needs a Markdown table inside it",
        node,
      );
    }
    const [header, ...rows] = table.children.map((row) =>
      row.children.map((cell) => toString(cell).trim()),
    );
    const strings = (cells) => array(cells.map(literal));
    node.attributes.push(
      expressionAttribute("header", strings(header), JSON.stringify(header)),
      expressionAttribute(
        "rows",
        array(rows.map(strings)),
        JSON.stringify(rows),
      ),
    );
    node.children = [];
  });
}

export default function remarkPost() {
  return (tree, file) => {
    outlineHeadings(tree);
    rankingTables(tree, file);
    localImages(tree, file);
  };
}
