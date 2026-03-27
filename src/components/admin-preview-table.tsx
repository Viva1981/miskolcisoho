"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminResource } from "@/lib/admin-resources";

type Props = {
  title: string;
  resource: AdminResource;
  source: "mock" | "apps-script";
  ok: boolean;
  error?: string;
  rows: Record<string, string>[];
  columns: string[];
  editableFields: string[];
};

const FIELD_LABELS: Record<string, string> = {
  id: "Azonosító",
  title: "Cím",
  text: "Leírás",
  description: "Leírás",
  caption: "Képaláírás",
  date: "Dátum",
  event_date: "Esemény dátuma",
  time: "Időpont",
  facebook_url: "Facebook link",
  cover_drive_file_id: "Borítókép fájl",
  cover_drive_url: "Borítókép link",
  drive_folder_id: "Drive mappa",
  drive_file_id: "Kép fájl",
  drive_file_url: "Kép link",
  published: "Publikált",
  sort_order: "Sorrend",
  album_id: "Album",
  slug: "Slug",
};

function fieldLabel(field: string) {
  return FIELD_LABELS[field] ?? field.replaceAll("_", " ");
}

function fieldType(field: string) {
  if (field === "published") return "checkbox";
  if (field === "date" || field === "event_date") return "date";
  if (field === "time") return "time";
  if (field.endsWith("_url") || field === "facebook_url") return "url";
  if (field === "description" || field === "text" || field === "caption") return "textarea";
  return "text";
}

function driveThumbnail(fileId: string) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w240`;
}

function Cell({ column, value }: { column: string; value: string }) {
  if (!value) return <>-</>;

  if (column === "published") {
    return <>{value === "true" ? "igen" : "nem"}</>;
  }

  if (column === "cover_drive_file_id" || column === "drive_file_id") {
    return (
      <div className="soho-admin-cell-stack">
        <img className="soho-admin-thumb" src={driveThumbnail(value)} alt="" loading="lazy" />
        <code>{value}</code>
      </div>
    );
  }

  if (column.endsWith("_url") || column === "facebook_url") {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="soho-admin-inline-link">
        Megnyitás
      </a>
    );
  }

  return <>{value}</>;
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
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");
  const [activeRowId, setActiveRowId] = useState("");
  const [editingRowId, setEditingRowId] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const editingRow = rows.find((row) => row.id === editingRowId) ?? null;

  async function runMutation(method: "PUT" | "DELETE", id: string, payload?: Record<string, string>) {
    setActionError("");
    setActiveRowId(id);

    const response = await fetch("/api/admin/content", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource, id, payload }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setActionError(result.error ?? "Nem sikerült elmenteni a módosítást.");
      setActiveRowId("");
      return false;
    }

    setActiveRowId("");
    startTransition(() => router.refresh());
    return true;
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a sort?")) return;
    await runMutation("DELETE", id);
  }

  async function handleQuickUpdate(id: string, payload: Record<string, string>) {
    await runMutation("PUT", id, payload);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingRowId) return;

    const success = await runMutation("PUT", editingRowId, formValues);
    if (success) {
      setEditingRowId("");
      setFormValues({});
    }
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
            Forrás: <strong>{source === "apps-script" ? "élő kapcsolat" : source}</strong>
          </p>
        </div>
        <span className={`soho-admin-status-chip ${ok ? "is-ok" : "is-error"}`}>
          {ok ? "Kapcsolódva" : "Hiba"}
        </span>
      </div>

      {!ok ? (
        <p className="soho-admin-error">{error ?? "Ismeretlen hiba."}</p>
      ) : rows.length === 0 ? (
        <p className="soho-admin-empty">Még nincs adat ebben a blokkban.</p>
      ) : (
        <div className="soho-admin-table-wrap">
          <table className="soho-admin-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{fieldLabel(column)}</th>
                ))}
                <th>Művelet</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((row) => {
                const rowId = row.id ?? `${title}-${JSON.stringify(row)}`;
                const published = row.published ?? "false";
                const sortOrder = Number.parseInt(row.sort_order ?? "0", 10) || 0;

                return (
                  <tr key={rowId}>
                    {columns.map((column) => (
                      <td key={column}>
                        <Cell column={column} value={row[column] || ""} />
                      </td>
                    ))}
                    <td>
                      <div className="soho-admin-row-actions">
                        {"published" in row ? (
                          <button
                            type="button"
                            className="soho-admin-row-action"
                            onClick={() =>
                              handleQuickUpdate(rowId, {
                                published: published === "true" ? "false" : "true",
                              })
                            }
                            disabled={isPending || activeRowId === rowId}
                          >
                            {published === "true" ? "Publikált" : "Rejtett"}
                          </button>
                        ) : null}

                        {"sort_order" in row ? (
                          <>
                            <button
                              type="button"
                              className="soho-admin-row-action"
                              onClick={() =>
                                handleQuickUpdate(rowId, {
                                  sort_order: String(Math.max(1, sortOrder - 10)),
                                })
                              }
                              disabled={isPending || activeRowId === rowId}
                            >
                              Sorrend -
                            </button>
                            <button
                              type="button"
                              className="soho-admin-row-action"
                              onClick={() =>
                                handleQuickUpdate(rowId, {
                                  sort_order: String(sortOrder + 10),
                                })
                              }
                              disabled={isPending || activeRowId === rowId}
                            >
                              Sorrend +
                            </button>
                          </>
                        ) : null}

                        <button
                          type="button"
                          className="soho-admin-row-action"
                          onClick={() => openEditor(row)}
                          disabled={isPending || activeRowId === rowId}
                        >
                          Szerkesztés
                        </button>
                        <button
                          type="button"
                          className="soho-admin-row-action"
                          onClick={() => handleDelete(rowId)}
                          disabled={isPending || activeRowId === rowId}
                        >
                          {activeRowId === rowId ? "Folyamat..." : "Törlés"}
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
                  Azonosító: <strong>{editingRow.id}</strong>
                </p>
              </div>
              <button type="button" className="soho-admin-row-action" onClick={closeEditor}>
                Bezárás
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
                          setFormValues((current) => ({
                            ...current,
                            [field]: event.target.checked ? "true" : "false",
                          }))
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
                        onChange={(event) =>
                          setFormValues((current) => ({ ...current, [field]: event.target.value }))
                        }
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
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, [field]: event.target.value }))
                      }
                    />
                  </label>
                );
              })}

              <div className="soho-admin-form-actions">
                <button type="submit" disabled={isPending || activeRowId === editingRow.id}>
                  {activeRowId === editingRow.id ? "Mentés..." : "Módosítás mentése"}
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
