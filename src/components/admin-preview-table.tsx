"use client";

import { DragEvent, FormEvent, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminResource } from "@/lib/admin-resources";
import { readFileAsBase64 } from "@/lib/read-file-as-base64";

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
  loading?: boolean;
};

const FIELD_LABELS: Record<string, string> = {
  id: "Azonosító",
  title: "Cím",
  text: "Leírás",
  description: "Leírás",
  caption: "Képaláírás",
  date: "Kezdő dátum",
  date_end: "Záró dátum",
  event_date: "Esemény dátuma",
  time: "Kezdő időpont",
  time_end: "Záró időpont",
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
  if (field === "date" || field === "date_end" || field === "event_date") return "date";
  if (field === "time" || field === "time_end") return "time";
  if (field.endsWith("_url") || field === "facebook_url") return "url";
  if (field === "description" || field === "text" || field === "caption") return "textarea";
  return "text";
}

function driveThumbnail(fileId: string) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
}

function getImageFieldConfig(resource: AdminResource) {
  if (resource === "events" || resource === "facebook_feed" || resource === "gallery_albums") {
    return {
      idField: "cover_drive_file_id",
      urlField: "cover_drive_url",
    } as const;
  }

  if (resource === "gallery_images") {
    return {
      idField: "drive_file_id",
      urlField: "drive_file_url",
    } as const;
  }

  return null;
}

function getImageId(row: Record<string, string>) {
  return row.cover_drive_file_id || row.drive_file_id || "";
}

function getCardTitle(row: Record<string, string>, resource: AdminResource) {
  if (resource === "gallery_images") {
    return "Galéria kép";
  }

  return row.title || row.id || "Névtelen elem";
}

function buildEventSubtitle(row: Record<string, string>) {
  const dateStart = row.date || "";
  const dateEnd = row.date_end || "";
  const timeStart = row.time || "";
  const timeEnd = row.time_end || "";

  const dateLabel =
    dateStart && dateEnd && dateStart !== dateEnd ? `${dateStart} - ${dateEnd}` : dateStart;
  const timeLabel =
    timeStart && timeEnd && timeStart !== timeEnd
      ? `${timeStart} - ${timeEnd}`
      : timeStart || timeEnd;

  return [dateLabel, timeLabel].filter(Boolean).join(" • ");
}

function getCardSubtitle(row: Record<string, string>, resource: AdminResource) {
  if (resource === "events") {
    return buildEventSubtitle(row);
  }

  if (resource === "gallery_albums") {
    return row.event_date || "";
  }

  if (resource === "gallery_images") {
    return "";
  }

  return row.facebook_url ? "Facebook elem" : "";
}

function formatPublished(value: string | undefined) {
  return value === "true" ? "Publikált" : "Rejtett";
}

function moveId(order: string[], draggedId: string, targetId: string) {
  if (draggedId === targetId) {
    return order;
  }

  const next = [...order];
  const fromIndex = next.indexOf(draggedId);
  const toIndex = next.indexOf(targetId);

  if (fromIndex === -1 || toIndex === -1) {
    return order;
  }

  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, draggedId);
  return next;
}

function sortRows(rows: Record<string, string>[]) {
  return [...rows].sort((left, right) => {
    const leftOrder = Number.parseInt(left.sort_order ?? "", 10);
    const rightOrder = Number.parseInt(right.sort_order ?? "", 10);

    if (Number.isFinite(leftOrder) && Number.isFinite(rightOrder) && leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return (left.title ?? left.id ?? "").localeCompare(right.title ?? right.id ?? "", "hu");
  });
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
  loading = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");
  const [activeRowId, setActiveRowId] = useState("");
  const [editingRowId, setEditingRowId] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [dragOrder, setDragOrder] = useState<string[] | null>(null);
  const [draggingRowId, setDraggingRowId] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [imageActionState, setImageActionState] = useState<"idle" | "deleting" | "replacing">("idle");
  const dropHandledRef = useRef(false);

  const baseRows = useMemo(() => sortRows(rows), [rows]);
  const editingRow = baseRows.find((row) => row.id === editingRowId) ?? null;
  const imageFieldConfig = getImageFieldConfig(resource);
  const currentImageId =
    editingRow && imageFieldConfig
      ? formValues[imageFieldConfig.idField] ?? editingRow[imageFieldConfig.idField] ?? ""
      : "";
  const visibleEditableFields = useMemo(
    () =>
      editableFields.filter(
        (field) =>
          field !== "cover_drive_file_id" &&
          field !== "cover_drive_url" &&
          field !== "drive_file_id" &&
          field !== "drive_file_url",
      ),
    [editableFields],
  );

  const displayRows = useMemo(() => {
    if (!dragOrder) {
      return baseRows;
    }

    const rowMap = new Map(baseRows.map((row) => [row.id ?? "", row]));
    const orderedRows = dragOrder.map((id) => rowMap.get(id)).filter(Boolean) as Record<
      string,
      string
    >[];

    if (orderedRows.length !== baseRows.length) {
      return baseRows;
    }

    return orderedRows;
  }, [baseRows, dragOrder]);

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

  async function persistReorder(nextRows: Record<string, string>[]) {
    if (!nextRows.every((row) => "sort_order" in row)) {
      return;
    }

    setActionError("");
    setIsReordering(true);

    try {
      const updates = nextRows.map((row, index) =>
        fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resource,
            id: row.id,
            payload: {
              sort_order: String((index + 1) * 10),
            },
          }),
        }).then(async (response) => {
          const result = (await response.json()) as { ok: boolean; error?: string };
          if (!response.ok || !result.ok) {
            throw new Error(result.error ?? "Nem sikerült elmenteni az új sorrendet.");
          }
        }),
      );

      await Promise.all(updates);

      if (onChange) {
        await onChange();
      }

      startTransition(() => router.refresh());
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Nem sikerült elmenteni az új sorrendet.",
      );
    } finally {
      setIsReordering(false);
      setDragOrder(null);
      setDraggingRowId("");
      dropHandledRef.current = false;
    }
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
    setReplacementFile(null);
    setImageActionState("idle");
  }

  async function handleDeleteImage() {
    if (!editingRowId || !imageFieldConfig || !currentImageId) {
      return;
    }

    if (!window.confirm("Biztosan törölni szeretnéd ezt a képet?")) {
      return;
    }

    try {
      setActionError("");
      setImageActionState("deleting");

      const deleteResponse = await fetch("/api/admin/delete-drive-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: currentImageId,
        }),
      });

      const deleteResult = (await deleteResponse.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!deleteResponse.ok || !deleteResult.ok) {
        setActionError(deleteResult.error ?? "Nem sikerült törölni a képet a Drive-ból.");
        setImageActionState("idle");
        return;
      }

      const success = await runMutation("PUT", editingRowId, {
        [imageFieldConfig.idField]: "",
        [imageFieldConfig.urlField]: "",
      });

      if (success) {
        setFormValues((current) => ({
          ...current,
          [imageFieldConfig.idField]: "",
          [imageFieldConfig.urlField]: "",
        }));
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Ismeretlen hiba történt.");
    } finally {
      setImageActionState("idle");
    }
  }

  async function handleReplaceImage() {
    if (!editingRowId || !imageFieldConfig || !currentImageId || !replacementFile) {
      return;
    }

    try {
      setActionError("");
      setImageActionState("replacing");
      const base64 = await readFileAsBase64(replacementFile);

      const replaceResponse = await fetch("/api/admin/replace-drive-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldFileId: currentImageId,
          fileName: replacementFile.name,
          mimeType: replacementFile.type || "application/octet-stream",
          base64,
        }),
      });

      const replaceResult = (await replaceResponse.json()) as {
        ok: boolean;
        fileId?: string;
        fileUrl?: string;
        error?: string;
      };

      if (!replaceResponse.ok || !replaceResult.ok || !replaceResult.fileId || !replaceResult.fileUrl) {
        setActionError(replaceResult.error ?? "Nem sikerült kicserélni a képet.");
        setImageActionState("idle");
        return;
      }

      const success = await runMutation("PUT", editingRowId, {
        [imageFieldConfig.idField]: replaceResult.fileId,
        [imageFieldConfig.urlField]: replaceResult.fileUrl,
      });

      if (success) {
        setFormValues((current) => ({
          ...current,
          [imageFieldConfig.idField]: replaceResult.fileId ?? "",
          [imageFieldConfig.urlField]: replaceResult.fileUrl ?? "",
        }));
        setReplacementFile(null);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Ismeretlen hiba történt.");
    } finally {
      setImageActionState("idle");
    }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, rowId: string) {
    if (isReordering || activeRowId) {
      event.preventDefault();
      return;
    }

    dropHandledRef.current = false;
    setDraggingRowId(rowId);
    setDragOrder(displayRows.map((row) => row.id ?? ""));
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", rowId);
  }

  function handleDragOver(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();

    const draggedId = draggingRowId || event.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === targetId) {
      return;
    }

    setDragOrder((current) =>
      moveId(current ?? displayRows.map((row) => row.id ?? ""), draggedId, targetId),
    );
  }

  async function handleDrop(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();

    const draggedId = draggingRowId || event.dataTransfer.getData("text/plain");
    if (!draggedId) {
      return;
    }

    const nextOrder = moveId(
      dragOrder ?? displayRows.map((row) => row.id ?? ""),
      draggedId,
      targetId,
    );
    const rowMap = new Map(displayRows.map((row) => [row.id ?? "", row]));
    const reorderedRows = nextOrder.map((id) => rowMap.get(id)).filter(Boolean) as Record<
      string,
      string
    >[];

    dropHandledRef.current = true;
    await persistReorder(reorderedRows);
  }

  function handleDragEnd() {
    if (!dropHandledRef.current) {
      setDragOrder(null);
      setDraggingRowId("");
    }
    dropHandledRef.current = false;
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
          {loading ? "Betöltés..." : isReordering ? "Mentés..." : ok ? `${rows.length} elem` : "Hiba"}
        </span>
      </div>

      {!ok && !loading ? (
        <p className="soho-admin-error">{error ?? "Ismeretlen hiba."}</p>
      ) : loading && rows.length === 0 ? (
        <div className="soho-admin-card-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={`${title}-loading-${index}`} className="soho-admin-item-card is-loading">
              <div className="soho-admin-item-media">
                <div className="soho-admin-item-placeholder soho-admin-skeleton-block" />
              </div>
              <div className="soho-admin-item-copy">
                <span className="soho-admin-skeleton-line is-wide" />
                <span className="soho-admin-skeleton-line" />
              </div>
              <div className="soho-admin-item-actions">
                <span className="soho-admin-skeleton-pill" />
                <span className="soho-admin-skeleton-pill" />
              </div>
            </article>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="soho-admin-empty">Még nincs adat ebben a blokkban.</p>
      ) : (
        <div className="soho-admin-card-grid">
          {displayRows.map((row) => {
            const rowId = row.id ?? `${title}-${JSON.stringify(row)}`;
            const imageId = getImageId(row);

            return (
              <article
                key={rowId}
                className={`soho-admin-item-card ${draggingRowId === rowId ? "is-dragging" : ""}`}
                onDragOver={(event) => handleDragOver(event, rowId)}
                onDrop={(event) => void handleDrop(event, rowId)}
              >
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
                  <button
                    type="button"
                    className="soho-admin-row-action soho-admin-drag-handle"
                    draggable={!isPending && !isReordering}
                    onDragStart={(event) => handleDragStart(event, rowId)}
                    onDragEnd={handleDragEnd}
                    disabled={isPending || isReordering}
                  >
                    Mozgatás
                  </button>

                  {"published" in row ? (
                    <button
                      type="button"
                      className="soho-admin-row-action"
                      onClick={() =>
                        handleQuickUpdate(rowId, {
                          published: row.published === "true" ? "false" : "true",
                        })
                      }
                      disabled={isPending || activeRowId === rowId || isReordering}
                    >
                      {formatPublished(row.published)}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="soho-admin-row-action"
                    onClick={() => openEditor(row)}
                    disabled={isPending || activeRowId === rowId || isReordering}
                  >
                    Szerkesztés
                  </button>
                  <button
                    type="button"
                    className="soho-admin-row-action"
                    onClick={() => handleDelete(rowId)}
                    disabled={isPending || activeRowId === rowId || isReordering}
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
              {imageFieldConfig ? (
                <div className="soho-admin-image-tools">
                  <span className="soho-admin-image-tools-label">Képkezelés</span>

                  {currentImageId ? (
                    <div className="soho-admin-image-tools-preview">
                      <img
                        src={driveThumbnail(currentImageId)}
                        alt=""
                        className="soho-admin-thumb"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <p className="soho-admin-muted">Ehhez az elemhez jelenleg nincs feltöltött kép.</p>
                  )}

                  {currentImageId ? (
                    <>
                      <label>
                        <span>Új kép kiválasztása</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setReplacementFile(event.target.files?.[0] ?? null)}
                        />
                      </label>

                      <div className="soho-admin-row-actions">
                        <button
                          type="button"
                          className="soho-admin-row-action"
                          onClick={() => void handleReplaceImage()}
                          disabled={!replacementFile || imageActionState !== "idle"}
                        >
                          {imageActionState === "replacing" ? "Csere..." : "Kép cseréje"}
                        </button>
                        <button
                          type="button"
                          className="soho-admin-row-action"
                          onClick={() => void handleDeleteImage()}
                          disabled={imageActionState !== "idle"}
                        >
                          {imageActionState === "deleting" ? "Törlés..." : "Kép törlése"}
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {visibleEditableFields.map((field) => {
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
