"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAdminOperations } from "@/components/admin-operation-provider";
import { parseAdminJsonResponse, validateAdminImageFile } from "@/lib/admin-client";
import { readFileAsBase64 } from "@/lib/read-file-as-base64";

type SubmitState =
  | { type: "idle" }
  | { type: "saving"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type AdminGalleryAlbumFormProps = {
  onSuccess?: () => Promise<void> | void;
};

const INITIAL_SORT_ORDER = "10";

export function AdminGalleryAlbumForm({ onSuccess }: AdminGalleryAlbumFormProps) {
  const router = useRouter();
  const { failOperation, finishOperation, startOperation, updateOperation } = useAdminOperations();
  const [state, setState] = useState<SubmitState>({ type: "idle" });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(INITIAL_SORT_ORDER);
  const [published, setPublished] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let operationId = "";

    if (!coverFile) {
      setState({
        type: "error",
        message: "Válassz ki egy dedikált borítóképet az albumhoz.",
      });
      return;
    }

    try {
      operationId = startOperation("Új galéria album", "Galéria mappa létrehozása...");
      validateAdminImageFile(coverFile, "album borítókép");
      setState({ type: "saving", message: "Galéria mappa létrehozása a Drive-ban..." });

      const folderResponse = await fetch("/api/admin/create-drive-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionName: "gallery",
          folderName: title.trim(),
        }),
      });

      const folderResult = await parseAdminJsonResponse<{
        ok: boolean;
        folderId?: string;
        error?: string;
      }>(folderResponse, "Nem sikerült létrehozni a galéria mappáját a Drive-ban.");

      if (!folderResponse.ok || !folderResult.ok || !folderResult.folderId) {
        setState({
          type: "error",
          message: folderResult.error ?? "Nem sikerült létrehozni a galéria mappáját a Drive-ban.",
        });
        return;
      }

      setState({ type: "saving", message: "Album borítókép feltöltése a Drive-ba..." });
      updateOperation(operationId, "Album borítókép feltöltése a Drive-ba...");
      const base64 = await readFileAsBase64(coverFile);

      const uploadResponse = await fetch("/api/admin/upload-drive-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: folderResult.folderId,
          fileName: coverFile.name,
          mimeType: coverFile.type || "application/octet-stream",
          base64,
        }),
      });

      const uploadResult = await parseAdminJsonResponse<{
        ok: boolean;
        fileId?: string;
        fileUrl?: string;
        error?: string;
      }>(uploadResponse, "Nem sikerült feltölteni az album borítóképét.");

      if (
        !uploadResponse.ok ||
        !uploadResult.ok ||
        !uploadResult.fileId ||
        !uploadResult.fileUrl
      ) {
        setState({
          type: "error",
          message: uploadResult.error ?? "Nem sikerült feltölteni az album borítóképét.",
        });
        return;
      }

      setState({ type: "saving", message: "Galéria album mentése..." });
      updateOperation(operationId, "Galéria album mentése...");

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource: "gallery_albums",
          payload: {
            title,
            slug,
            event_date: eventDate,
            description,
            drive_folder_id: folderResult.folderId,
            cover_drive_file_id: uploadResult.fileId,
            cover_drive_url: uploadResult.fileUrl,
            published: published ? "true" : "false",
            sort_order: sortOrder || INITIAL_SORT_ORDER,
          },
        }),
      });

      const result = await parseAdminJsonResponse<{
        ok: boolean;
        error?: string;
      }>(response, "Nem sikerült elmenteni a galéria albumot.");

      if (!response.ok || !result.ok) {
        setState({
          type: "error",
          message: result.error ?? "Nem sikerült elmenteni a galéria albumot.",
        });
        return;
      }

      setTitle("");
      setSlug("");
      setEventDate("");
      setDescription("");
      setSortOrder(INITIAL_SORT_ORDER);
      setPublished(true);
      setCoverFile(null);
      setFileInputKey((current) => current + 1);
      setState({
        type: "success",
        message: "A galéria album, a saját mappa és a dedikált borítókép sikeresen létrejött.",
      });
      finishOperation(operationId, "A galéria album sikeresen létrejött.");

      if (onSuccess) {
        await onSuccess();
      }

      router.refresh();
    } catch (error) {
      if (operationId) {
        failOperation(operationId, error instanceof Error ? error.message : "Ismeretlen hiba történt.");
      }
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Ismeretlen hiba történt.",
      });
    }
  }

  return (
    <article className="soho-admin-card soho-admin-form-card">
      <div className="soho-admin-preview-head">
        <div>
          <h2>Új galéria album</h2>
          <p>
            Hozd létre az albumot névvel, dátummal és borítóképpel. A rendszer automatikusan
            elkészíti az album saját Drive mappáját.
          </p>
        </div>
      </div>

      <form className="soho-admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Album neve</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Például: Soho Opening Night"
            required
          />
        </label>

        <div className="soho-admin-form-grid">
          <label>
            <span>Slug</span>
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="Ha üres, automatikusan készül"
            />
          </label>

          <label>
            <span>Esemény dátuma</span>
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              required
            />
          </label>
        </div>

        <label>
          <span>Leírás</span>
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Rövid leírás az albumkártyához"
            required
          />
        </label>

        <label>
          <span>Dedikált borítókép</span>
          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
            required
          />
        </label>

        <div className="soho-admin-form-grid">
          <label>
            <span>Sorrend</span>
            <input
              type="number"
              min="1"
              step="1"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              required
            />
          </label>

          <label className="soho-admin-checkbox">
            <span>Publikált</span>
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
          </label>
        </div>

        <div className="soho-admin-form-actions">
          <button type="submit" disabled={state.type === "saving"}>
            {state.type === "saving" ? state.message : "Galéria album létrehozása"}
          </button>
        </div>

        {state.type === "success" ? (
          <p className="soho-admin-form-message is-success">{state.message}</p>
        ) : null}
        {state.type === "error" ? (
          <p className="soho-admin-form-message is-error">{state.message}</p>
        ) : null}
      </form>
    </article>
  );
}
