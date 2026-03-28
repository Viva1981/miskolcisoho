"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { readFileAsBase64 } from "@/lib/read-file-as-base64";

type SubmitState =
  | { type: "idle" }
  | { type: "saving"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type AdminEventFormProps = {
  onSuccess?: () => Promise<void> | void;
};

const INITIAL_SORT_ORDER = "10";

export function AdminEventForm({ onSuccess }: AdminEventFormProps) {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ type: "idle" });
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [time, setTime] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(INITIAL_SORT_ORDER);
  const [published, setPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setState({
        type: "error",
        message: "Válassz ki egy borítóképet az eseményhez.",
      });
      return;
    }

    if (timeEnd && !time) {
      setState({
        type: "error",
        message: "Záró időpont csak kezdő időponttal együtt adható meg.",
      });
      return;
    }

    try {
      setState({ type: "saving", message: "Eseménymappa létrehozása a Drive-ban..." });

      const folderResponse = await fetch("/api/admin/create-drive-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionName: "events",
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
          message: folderResult.error ?? "Nem sikerült létrehozni az esemény mappáját.",
        });
        return;
      }

      setState({ type: "saving", message: "Borítókép feltöltése a Drive-ba..." });
      const base64 = await readFileAsBase64(file);

      const uploadResponse = await fetch("/api/admin/upload-drive-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: folderResult.folderId,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
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
          message: uploadResult.error ?? "Nem sikerült feltölteni az esemény borítóképét.",
        });
        return;
      }

      setState({ type: "saving", message: "Esemény mentése..." });

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
            date_end: dateEnd,
            time,
            time_end: timeEnd,
            facebook_url: facebookUrl,
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
          message: result.error ?? "Nem sikerült elmenteni az eseményt.",
        });
        return;
      }

      setTitle("");
      setDate("");
      setDateEnd("");
      setTime("");
      setTimeEnd("");
      setFacebookUrl("");
      setSortOrder(INITIAL_SORT_ORDER);
      setPublished(true);
      setFile(null);
      setFileInputKey((current) => current + 1);
      setState({
        type: "success",
        message: "Az esemény és a borítóképe sikeresen bekerült a rendszerbe.",
      });

      if (onSuccess) {
        await onSuccess();
      }

      router.refresh();
    } catch (error) {
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
          <h2>Új esemény</h2>
          <p>
            Add meg az esemény fő adatait, válassz borítóképet, és a rendszer automatikusan
            létrehozza a szükséges Drive mappát is.
          </p>
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
            <span>Kezdő dátum</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Záró dátum</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(event) => setDateEnd(event.target.value)}
            />
          </label>
        </div>

        <div className="soho-admin-form-grid">
          <label>
            <span>Kezdő időpont</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </label>

          <label>
            <span>Záró időpont</span>
            <input
              type="time"
              value={timeEnd}
              onChange={(event) => setTimeEnd(event.target.value)}
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

        <label>
          <span>Borítókép</span>
          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
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
            {state.type === "saving" ? state.message : "Esemény létrehozása"}
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
