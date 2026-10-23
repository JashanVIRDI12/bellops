"use client";

import { useOptimistic, useState, useTransition } from "react";
import { leadStatuses, statusLabels, type LeadStatus } from "@/lib/leads/types";
import { removeLead, updateLeadStatus } from "./actions";

/** Status and delete for one enquiry. The status changes as soon as it's picked. */
export function LeadControls({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: LeadStatus;
}) {
  const [shownStatus, setShownStatus] = useOptimistic(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-start gap-3 md:flex-col md:items-end">
      <label className="admin-status" data-status={shownStatus}>
        <span className="sr-only">Status of the enquiry from {name}</span>
        <select
          value={shownStatus}
          onChange={(event) => {
            const next = event.target.value as LeadStatus;
            startTransition(async () => {
              setShownStatus(next);
              const result = await updateLeadStatus(id, next);
              setError(result.ok ? null : result.error);
            });
          }}
        >
          {leadStatuses.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={pending}
        className="admin-delete"
        onClick={() => {
          if (
            !window.confirm(
              `Delete the enquiry from ${name}? This can't be undone.`,
            )
          )
            return;
          startTransition(async () => {
            const result = await removeLead(id);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        Delete
      </button>
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#ffc4ba]">
          {error}
        </p>
      )}
    </div>
  );
}
