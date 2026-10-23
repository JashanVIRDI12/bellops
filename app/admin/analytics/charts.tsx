import { formatCount, formatPercent } from "@/lib/admin/format";

/*
 * Charts for the Analytics page, rendered on the server. One data colour
 * (--an-data); hover and keyboard focus show each value; every chart has a
 * table view, so nothing depends on hovering.
 */

const dayLabel = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const formatDay = (day: string) =>
  dayLabel.format(new Date(`${day}T00:00:00Z`));

/** A round top for the axis: 1, 2 or 5 times a power of ten. */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((m) => m * power >= value)! * power;
  return step;
}

type Day = {
  day: string;
  visitors: number;
  sessions: number;
  contacts: number;
};

export function DailyChart({ days }: { days: Day[] }) {
  const top = niceMax(Math.max(0, ...days.map((day) => day.visitors)));
  const ticks = [top, top / 2, 0];
  const labelEvery = Math.max(1, Math.ceil(days.length / 8));

  return (
    <figure className="an-chart">
      <div className="an-plot">
        <div className="an-ticks" aria-hidden="true">
          {ticks.map((tick) => (
            <div key={tick} className="an-tick">
              <span>{formatCount(tick)}</span>
            </div>
          ))}
        </div>
        <ol
          className="an-bars"
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          {days.map((day, index) => (
            <li key={day.day} className="an-bar-slot">
              <button
                type="button"
                className="an-bar-hit"
                aria-label={`${formatDay(day.day)}: ${day.visitors} visitors, ${day.sessions} visits, ${day.contacts} contacted`}
              >
                <span
                  className="an-bar"
                  style={{ height: `${(day.visitors / top) * 100}%` }}
                />
              </button>
              <span
                className="an-tip"
                role="tooltip"
                // With many days, keep the first and last readouts on screen.
                data-edge={
                  days.length <= 6
                    ? undefined
                    : index < 2
                      ? "start"
                      : index > days.length - 3
                        ? "end"
                        : undefined
                }
              >
                <strong>{formatCount(day.visitors)} visitors</strong>
                <span>{formatDay(day.day)}</span>
                <span>
                  {formatCount(day.sessions)} visits,{" "}
                  {formatCount(day.contacts)} contacted
                </span>
              </span>
              {index % labelEvery === 0 && (
                <span className="an-xlabel" aria-hidden="true">
                  {formatDay(day.day)}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <details className="an-details">
        <summary>Show as a table</summary>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col" className="an-num">
                  Visitors
                </th>
                <th scope="col" className="an-num">
                  Visits
                </th>
                <th scope="col" className="an-num">
                  Contacted
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.day}>
                  <td>{formatDay(day.day)}</td>
                  <td className="an-num">{formatCount(day.visitors)}</td>
                  <td className="an-num">{formatCount(day.sessions)}</td>
                  <td className="an-num">{formatCount(day.contacts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

type Row = { label: string; sessions: number; contacts: number };

/**
 * A ranked list as a table, with a bar per row for comparison. `total` shows
 * each row as a share of it (the funnel); `withContacts` adds how many of
 * those visits got in touch.
 */
export function RankedTable({
  rows,
  label,
  valueLabel = "Visits",
  withContacts = false,
  total,
  keepOrder = false,
  empty,
}: {
  rows: Row[];
  label: string;
  valueLabel?: string;
  withContacts?: boolean;
  total?: number;
  keepOrder?: boolean;
  empty: string;
}) {
  if (rows.length === 0) return <p className="an-help">{empty}</p>;
  const ordered = keepOrder
    ? rows
    : [...rows].sort((a, b) => b.sessions - a.sessions);
  const max = total ?? Math.max(1, ...ordered.map((row) => row.sessions));

  return (
    <table className="an-table an-ranked">
      <thead>
        <tr>
          <th scope="col">{label}</th>
          <th scope="col" className="an-num">
            {valueLabel}
          </th>
          {withContacts && (
            <th scope="col" className="an-num">
              Contacted
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {ordered.map((row) => (
          <tr key={row.label}>
            <td>
              <span className="an-row-label">{row.label}</span>
              <span className="an-meter" aria-hidden="true">
                <span style={{ width: `${(row.sessions / max) * 100}%` }} />
              </span>
            </td>
            <td className="an-num">
              {formatCount(row.sessions)}
              {total !== undefined && (
                <span className="block text-white/50">
                  {formatPercent(row.sessions, total)}
                </span>
              )}
            </td>
            {withContacts && (
              <td className="an-num">
                {formatCount(row.contacts)}
                {row.contacts > 0 && (
                  <span className="block text-white/50">
                    {formatPercent(row.contacts, row.sessions)}
                  </span>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
