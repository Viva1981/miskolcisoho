"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { readFileAsBase64 } from "@/lib/read-file-as-base64";

type SubmitState =
  | { type: "idle" }
  | { type: "saving"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const INITIAL_SORT_ORDER = "10";

export function AdminGalleryAlbumForm() {
  const router = useRouter();
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

    if (!coverFile) {
      setState({
        type: "error",
        message: "Valassz ki egy dedikalt boritokept az albumhoz.",
      });
      return;
    }

    try {
      setState({ type: "saving", message: "Galeria mappa letrehozasa a Drive-ban..." });

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

      const folderResult = (await folderResponse.json()) as {
        ok: boolean;
        folderId?: string;
        error?: string;
      };

      if (!folderResponse.ok || !folderResult.ok || !folderResult.folderId) {
        setState({
          type: "error",
          message: folderResult.error ?? "Nem sikerult letrehozni a galeria mappat a Drive-ban.",
        });
        return;
      }

      setState({ type: "saving", message: "Album boritokep feltoltese Drive-ba..." });
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

      const uploadResult = (await uploadResponse.json()) as {
        ok: boolean;
        fileId?: string;
        fileUrl?: string;
        error?: string;
      };

      if (
        !uploadResponse.ok ||
        !uploadResult.ok ||
        !uploadResult.fileId ||
        !uploadResult.fileUrl
      ) {
        setState({
          type: "error",
          message: uploadResult.error ?? "Nem sikerult feltolteni az album boritokepet.",
        });
        return;
      }

      setState({ type: "saving", message: "Galeria album mentese a sheetbe..." });

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

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setState({
          type: "error",
          message: result.error ?? "Nem sikerult elmenteni a galeria albumot.",
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
        message: "A galeria album, a sajat mappa es a dedikalt boritokep sikeresen letrejott.",
      });
      router.refresh();
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Ismeretlen hiba tortent.",
      });
    }
  }

  return (
    <article className="soho-admin-card soho-admin-form-card">
      <div className="soho-admin-preview-head">
        <div>
          <h2>Uj galeria album</h2>
          <p>
            Az urlap letrehozza az album sajat Drive mappajat, feltolti a dedikalt boritokept, majd
            elmenti a `gallery_albums` sort. A boritokep nem jelenik meg automatikusan az album
            belso kepelistajaban.
          </p>
        </div>
      </div>

      <form className="soho-admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Cim</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Peldaul: Soho Opening Night"
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
              placeholder="Ha ures, automatikusan keszul"
            />
          </label>

          <label>
            <span>Esemeny datuma</span>
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              required
            />
          </label>
        </div>

        <label>
          <span>Leiras</span>
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Rovid leiras az albumkartyahoz"
            required
          />
        </label>

        <label>
          <span>Dedikalt boritokep</span>
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
            <span>Publikalt</span>
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
          </label>
        </div>

        <div className="soho-admin-form-actions">
          <button type="submit" disabled={state.type === "saving"}>
            {state.type === "saving" ? state.message : "Galeria album letrehozasa"}
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
