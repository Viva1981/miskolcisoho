"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SubmitState =
  | { type: "idle" }
  | { type: "saving" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const INITIAL_SORT_ORDER = "10";

export function AdminGalleryImageForm() {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ type: "idle" });
  const [albumId, setAlbumId] = useState("");
  const [driveFileId, setDriveFileId] = useState("");
  const [driveFileUrl, setDriveFileUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState(INITIAL_SORT_ORDER);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ type: "saving" });

    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resource: "gallery_images",
        payload: {
          album_id: albumId,
          drive_file_id: driveFileId,
          drive_file_url: driveFileUrl,
          caption,
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
        message: result.error ?? "Nem sikerült elmenteni a galéria képet.",
      });
      return;
    }

    setAlbumId("");
    setDriveFileId("");
    setDriveFileUrl("");
    setCaption("");
    setSortOrder(INITIAL_SORT_ORDER);
    setState({
      type: "success",
      message: "A galéria kép sikeresen bekerült a sheetbe.",
    });
    router.refresh();
  }

  return (
    <article className="soho-admin-card soho-admin-form-card">
      <div className="soho-admin-preview-head">
        <div>
          <h2>Új galéria kép</h2>
          <p>Ez az űrlap a `gallery_images` Sheetbe ment új képsort.</p>
        </div>
      </div>

      <form className="soho-admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Album ID</span>
          <input
            type="text"
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value)}
            placeholder="Például: album_1743000000000"
            required
          />
        </label>

        <div className="soho-admin-form-grid">
          <label>
            <span>Drive fájl ID</span>
            <input
              type="text"
              value={driveFileId}
              onChange={(event) => setDriveFileId(event.target.value)}
              placeholder="Például: 1AbCdEf..."
              required
            />
          </label>

          <label>
            <span>Drive fájl URL</span>
            <input
              type="url"
              value={driveFileUrl}
              onChange={(event) => setDriveFileUrl(event.target.value)}
              placeholder="https://drive.google.com/..."
              required
            />
          </label>
        </div>

        <label>
          <span>Képaláírás</span>
          <input
            type="text"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Rövid képleírás vagy caption"
            required
          />
        </label>

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

        <div className="soho-admin-form-actions">
          <button type="submit" disabled={state.type === "saving"}>
            {state.type === "saving" ? "Mentés..." : "Galéria kép mentése"}
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
