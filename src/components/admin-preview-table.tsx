"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminResource } from "@/lib/admin-resources";

type AdminPreviewTableProps = {
  title: string;
  resource: AdminResource;
  source: "mock" | "apps-script";
  ok: boolean;
  error?: string;
  rows: Record<string, string>[];
  columns: string[];
  editableFields: string[];
};

function fieldLabel(field: string) {
  return field.replaceAll("_", " ");
}

function fieldType(field: string) {
  if (field === "published") {
    return "checkbox";
  }

  if (field === "date" || field === "event_date") {
    return "date";
  }

  if (field === "time") {
    return "time";
  }

  if (field.endsWith("_url") || field === "facebook_url") {
    return "url";
  }

  if (field === "description" || field === "text" || field === "caption") {
    return "textarea";
  }

  return "text";
}

export function AdminPreviewTable({
  title,
  resource,
  source,
  ok,
  error,
  rows,
  columns,
  editableFields,
}: AdminPreviewTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");
  const [activeRowId, setActiveRowId] = useState("");
  const [editingRowId, setEditingRowId] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const editingRow = rows.find((row) => row.id === editingRowId) ?? null;

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

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingRowId) {
      return;
    }

    setActionError("");
    setActiveRowId(editingRowId);

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resource,
        id: editingRowId,
        payload: formValues,
      }),
    });

    const result = (await response.json()) as {
      ok: boolean;
      error?: string;
    };

    if (!response.ok || !result.ok) {
      setActionError(result.error ?? "Nem sikerült elmenteni a módosításokat.");
      setActiveRowId("");
      return;
    }

    closeEditor();
    setActiveRowId("");
    startTransition(() => {
      router.refresh();
    });
  }

  function updateValue(field: string, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openEditor(row: Record<string, string>) {
    const nextValues: Record<string, string> = {};

    editableFields.forEach((field) => {
      nextValues[field] = row[field] ?? "";
    });

    setActionError("");
    setFormValues(nextValues);
    setEditingRowId(row.id ?? "");
  }

  function closeEditor() {
    setEditingRowId("");
    setFormValues({});
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
                      <div className="soho-admin-row-actions">
                        <button
                          type="button"
                          className="soho-admin-row-action"
                          onClick={() => openEditor(row)}
                          disabled={isPending || activeRowId === rowId}
                        >
                          szerkesztés
                        </button>
                        <button
                          type="button"
                          className="soho-admin-row-action"
                          onClick={() => handleDelete(rowId)}
                          disabled={isPending || activeRowId === rowId}
                        >
                          {activeRowId === rowId ? "törlés..." : "törlés"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingRow ? (
        <div className="soho-admin-modal-backdrop" role="presentation" onClick={closeEditor}>
          <div
            className="soho-admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} szerkesztés`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="soho-admin-preview-head">
              <div>
                <h2>Sor szerkesztése</h2>
                <p>
                  ID: <strong>{editingRow.id}</strong>
                </p>
              </div>
              <button type="button" className="soho-admin-row-action" onClick={closeEditor}>
                bezárás
              </button>
            </div>

            <form className="soho-admin-form" onSubmit={handleUpdate}>
              {editableFields.map((field) => {
                const type = fieldType(field);
                const value = formValues[field] ?? "";

                if (type === "checkbox") {
                  return (
                    <label key={field} className="soho-admin-checkbox">
                      <span>{fieldLabel(field)}</span>
                      <input
                        type="checkbox"
                        checked={value === "true"}
                        onChange={(event) =>
                          updateValue(field, event.target.checked ? "true" : "false")
                        }
                      />
                    </label>
                  );
                }

                if (type === "textarea") {
                  return (
                    <label key={field}>
                      <span>{fieldLabel(field)}</span>
                      <textarea
                        value={value}
                        onChange={(event) => updateValue(field, event.target.value)}
                        rows={4}
                      />
                    </label>
                  );
                }

                return (
                  <label key={field}>
                    <span>{fieldLabel(field)}</span>
                    <input
                      type={type}
                      value={value}
                      onChange={(event) => updateValue(field, event.target.value)}
                    />
                  </label>
                );
              })}

              <div className="soho-admin-form-actions">
                <button type="submit" disabled={isPending || activeRowId === editingRow.id}>
                  {activeRowId === editingRow.id ? "mentés..." : "módosítás mentése"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {actionError ? <p className="soho-admin-form-message is-error">{actionError}</p> : null}
    </article>
  );
}
