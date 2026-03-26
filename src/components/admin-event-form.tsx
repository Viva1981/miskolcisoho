"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SubmitState =
  | { type: "idle" }
  | { type: "saving" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const INITIAL_SORT_ORDER = "10";

export function AdminEventForm() {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ type: "idle" });
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
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
        resource: "events",
        payload: {
          title,
          date,
          time,
          facebook_url: facebookUrl,
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
        message: result.error ?? "Nem sikerült elmenteni az eseményt.",
      });
      return;
    }

    setTitle("");
    setDate("");
    setTime("");
    setFacebookUrl("");
    setSortOrder(INITIAL_SORT_ORDER);
    setPublished(true);
    setState({
      type: "success",
      message: "Az esemény sikeresen bekerült az events sheetbe.",
    });
    router.refresh();
  }

  return (
    <article className="soho-admin-card soho-admin-form-card">
      <div className="soho-admin-preview-head">
        <div>
          <h2>Új esemény</h2>
          <p>Ez az első működő admin űrlap, ami közvetlenül az `events` Sheetbe ment.</p>
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
            <span>Dátum</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Idő</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </label>
        </div>

        <label>
          <span>Facebook link</span>
          <input
            type="url"
            value={facebookUrl}
            onChange={(event) => setFacebookUrl(event.target.value)}
            placeholder="https://fb.me/..."
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
            {state.type === "saving" ? "Mentés..." : "Esemény mentése"}
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
