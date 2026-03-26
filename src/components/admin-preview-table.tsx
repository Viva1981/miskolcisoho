"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { AdminResource } from "@/lib/admin-resources";

type AdminPreviewTableProps = {
  title: string;
  resource: AdminResource;
  source: "mock" | "apps-script";
  ok: boolean;
  error?: string;
  rows: Record<string, string>[];
  columns: string[];
};

export function AdminPreviewTable({
  title,
  resource,
  source,
  ok,
  error,
  rows,
  columns,
}: AdminPreviewTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");
  const [activeRowId, setActiveRowId] = useState("");

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Biztosan törölni szeretnéd ezt a sort?");

    if (!confirmed) {
      return;
    }

    setActionError("");
    setActiveRowId(id);

    const response = await fetch("/api/admin/content", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resource,
        id,
      }),
    });

    const result = (await response.json()) as {
      ok: boolean;
      error?: string;
    };

    if (!response.ok || !result.ok) {
      setActionError(result.error ?? "Nem sikerült törölni a kiválasztott sort.");
      setActiveRowId("");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
    setActiveRowId("");
  }

  return (
    <article className="soho-admin-card soho-admin-preview-card">
      <div className="soho-admin-preview-head">
        <div>
          <h2>{title}</h2>
          <p>
            Forrás: <strong>{source}</strong>
          </p>
        </div>
        <span className={`soho-admin-status-chip ${ok ? "is-ok" : "is-error"}`}>
          {ok ? "kapcsolódva" : "hiba"}
        </span>
      </div>

      {!ok ? (
        <p className="soho-admin-error">{error ?? "Ismeretlen hiba."}</p>
      ) : rows.length === 0 ? (
        <p className="soho-admin-empty">
          Még nincs adat ebben a forrásban. Ez jó tesztállapot: az élő kapcsolat működik, csak a
          sheet még üres.
        </p>
      ) : (
        <div className="soho-admin-table-wrap">
          <table className="soho-admin-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th>művelet</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((row) => {
                const rowId = row.id ?? `${title}-${JSON.stringify(row)}`;

                return (
                  <tr key={rowId}>
                    {columns.map((column) => (
                      <td key={column}>{row[column] || "-"}</td>
                    ))}
                    <td>
                      <button
                        type="button"
                        className="soho-admin-row-action"
                        onClick={() => handleDelete(rowId)}
                        disabled={isPending || activeRowId === rowId}
                      >
                        {activeRowId === rowId ? "törlés..." : "törlés"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {actionError ? <p className="soho-admin-form-message is-error">{actionError}</p> : null}
    </article>
  );
}
