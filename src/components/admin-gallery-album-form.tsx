"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SubmitState =
  | { type: "idle" }
  | { type: "saving" }
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
  const [driveFolderId, setDriveFolderId] = useState("");
  const [sortOrder, setSortOrder] = useState(INITIAL_SORT_ORDER);
  const [published, setPublished] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ type: "saving" });

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
          drive_folder_id: driveFolderId,
          cover_drive_file_id: "",
          cover_drive_url: "",
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
        message: result.error ?? "Nem sikerült elmenteni a galéria albumot.",
      });
      return;
    }

    setTitle("");
    setSlug("");
    setEventDate("");
    setDescription("");
    setDriveFolderId("");
    setSortOrder(INITIAL_SORT_ORDER);
    setPublished(true);
    setState({
      type: "success",
      message: "A galéria album sikeresen bekerült a sheetbe.",
    });
    router.refresh();
  }

  return (
    <article className="soho-admin-card soho-admin-form-card">
      <div className="soho-admin-preview-head">
        <div>
          <h2>Új galéria album</h2>
          <p>Ez az űrlap a `gallery_albums` Sheetbe ment új albumot.</p>
        </div>
      </div>

      <form className="soho-admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Cím</span>
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
          <span>Drive mappa ID</span>
          <input
            type="text"
            value={driveFolderId}
            onChange={(event) => setDriveFolderId(event.target.value)}
            placeholder="Például: 1AbCdEf..."
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
            {state.type === "saving" ? "Mentés..." : "Galéria album mentése"}
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
