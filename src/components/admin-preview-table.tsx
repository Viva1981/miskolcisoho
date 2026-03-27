"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
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
  onChange?: () => Promise<void> | void;
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
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
}

function getImageId(row: Record<string, string>) {
  return row.cover_drive_file_id || row.drive_file_id || "";
}

function getCardTitle(row: Record<string, string>, resource: AdminResource) {
  if (resource === "gallery_images") {
    return row.caption || row.id || "Galéria kép";
  }

  return row.title || row.id || "Névtelen elem";
}

function getCardSubtitle(row: Record<string, string>, resource: AdminResource) {
  if (resource === "events") {
    const date = row.date || "";
    const time = row.time || "";
    return [date, time].filter(Boolean).join(" • ");
  }

  if (resource === "gallery_albums") {
    return row.event_date || "";
  }

  if (resource === "gallery_images") {
    return row.album_id || "";
  }

  return row.facebook_url ? "Facebook elem" : "";
}

function formatPublished(value: string | undefined) {
  return value === "true" ? "Publikált" : "Rejtett";
}

export function AdminPreviewTable({
  title,
  resource,
  source,
  ok,
  error,
  rows,
  editableFields,
  onChange,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");
  const [activeRowId, setActiveRowId] = useState("");
  const [editingRowId, setEditingRowId] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const editingRow = rows.find((row) => row.id === editingRowId) ?? null;
  const previewRows = useMemo(() => rows.slice(0, 12), [rows]);

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

    if (onChange) {
      await onChange();
    }

    startTransition(() => router.refresh());
    return true;
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Biztosan törölni szeretnéd ezt az elemet?")) return;
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
          {ok ? `${rows.length} elem` : "Hiba"}
        </span>
      </div>

      {!ok ? (
        <p className="soho-admin-error">{error ?? "Ismeretlen hiba."}</p>
      ) : rows.length === 0 ? (
        <p className="soho-admin-empty">Még nincs adat ebben a blokkban.</p>
      ) : (
        <div className="soho-admin-card-grid">
          {previewRows.map((row) => {
            const rowId = row.id ?? `${title}-${JSON.stringify(row)}`;
            const imageId = getImageId(row);
            const sortOrder = Number.parseInt(row.sort_order ?? "0", 10) || 0;

            return (
              <article key={rowId} className="soho-admin-item-card">
                <button
                  type="button"
                  className="soho-admin-item-hitbox"
                  onClick={() => openEditor(row)}
                >
                  <div className="soho-admin-item-media">
                    {imageId ? (
                      <img
                        className="soho-admin-item-thumb"
                        src={driveThumbnail(imageId)}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <div className="soho-admin-item-placeholder">Nincs kép</div>
                    )}
                  </div>

                  <div className="soho-admin-item-copy">
                    <strong>{getCardTitle(row, resource)}</strong>
                    {getCardSubtitle(row, resource) ? <span>{getCardSubtitle(row, resource)}</span> : null}
                  </div>
                </button>

                <div className="soho-admin-item-actions">
                  {"published" in row ? (
                    <button
                      type="button"
                      className="soho-admin-row-action"
                      onClick={() =>
                        handleQuickUpdate(rowId, {
                          published: row.published === "true" ? "false" : "true",
                        })
                      }
                      disabled={isPending || activeRowId === rowId}
                    >
                      {formatPublished(row.published)}
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
              </article>
            );
          })}
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
                <h2>Szerkesztés</h2>
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
