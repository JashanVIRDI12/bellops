"use client";

import { useState } from "react";

/**
 * A post's ranking table, sortable by any column. It's written in the post
 * as a plain Markdown table inside <SortableRankingTable>…</SortableRankingTable>
 * and arrives here as `header` and `rows` (lib/mdx/remark-post.mjs), so the
 * numbers come from the post itself and the first paint already shows the
 * full table, in the post's order, with no shift when it becomes sortable.
 *
 * Sorting starts on the LCP column, fastest first, if there is one.
 */
type Sort = { column: number; ascending: boolean };

/** A cell as a number ("3,392" → 3392, "Lenskart¹" → NaN), else NaN. */
const numeric = (cell: string) => Number(cell.replace(/[,\s]/g, ""));

function compare(a: string, b: string) {
  const [x, y] = [numeric(a), numeric(b)];
  if (!Number.isNaN(x) && !Number.isNaN(y)) return x - y;
  if (!Number.isNaN(x)) return -1;
  if (!Number.isNaN(y)) return 1;
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

export function SortableRankingTable({
  header,
  rows,
}: {
  header: string[];
  rows: string[][];
}) {
  const lcp = header.findIndex((label) => /^lcp\b/i.test(label));
  // Each row is named by its Brand (or Name) cell, for screen readers.
  const named = Math.max(
    header.findIndex((label) => /^(brand|name)$/i.test(label)),
    0,
  );
  const [sort, setSort] = useState<Sort>({
    column: Math.max(lcp, 0),
    ascending: true,
  });
  const sorted = rows
    .map((row, order) => ({ row, order }))
    .sort((a, b) => {
      const result = compare(
        a.row[sort.column] ?? "",
        b.row[sort.column] ?? "",
      );
      return (sort.ascending ? result : -result) || a.order - b.order;
    });

  return (
    <div className="post-table post-ranking">
      <table>
        <caption className="post-ranking-caption">
          Select a column heading to sort the table.
        </caption>
        <thead>
          <tr>
            {header.map((label, column) => {
              const active = sort.column === column;
              return (
                <th
                  key={label}
                  scope="col"
                  aria-sort={
                    active
                      ? sort.ascending
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSort({
                        column,
                        ascending: active ? !sort.ascending : true,
                      })
                    }
                  >
                    {label}
                    <span aria-hidden="true" className="post-ranking-arrow">
                      {active ? (sort.ascending ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ row, order }) => (
            <tr key={order}>
              {row.map((cell, column) =>
                column === named ? (
                  <th key={column} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={column}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
