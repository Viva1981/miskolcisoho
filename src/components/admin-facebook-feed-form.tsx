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

export function AdminFacebookFeedForm() {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ type: "idle" });
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
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
        message: "Válassz ki egy borítóképet a Facebook elemhez.",
      });
      return;
    }

    try {
      setState({ type: "saving", message: "Facebook mappa létrehozása a Drive-ban..." });

      const folderResponse = await fetch("/api/admin/create-drive-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionName: "facebook_feed",
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
          message: folderResult.error ?? "Nem sikerült létrehozni a Facebook elem mappáját.",
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
          message: uploadResult.error ?? "Nem sikerült feltölteni a Facebook elem borítóképét.",
        });
        return;
      }

      setState({ type: "saving", message: "Facebook elem mentése..." });

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource: "facebook_feed",
          payload: {
            title,
            text,
            facebook_url: facebookUrl,
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
          message: result.error ?? "Nem sikerült elmenteni a Facebook elemet.",
        });
        return;
      }

      setTitle("");
      setText("");
      setFacebookUrl("");
      setSortOrder(INITIAL_SORT_ORDER);
      setPublished(true);
      setFile(null);
      setFileInputKey((current) => current + 1);
      setState({
        type: "success",
        message: "A Facebook elem és a borítóképe sikeresen bekerült a rendszerbe.",
      });
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
          <h2>Új Facebook elem</h2>
          <p>
            Itt tudsz új kártyát létrehozni a főoldali Facebook blokkhoz képpel, szöveggel és
            linkkel.
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
            placeholder="Például: Hétvégi nyitó est"
            required
          />
        </label>

        <label>
          <span>Leírás</span>
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Rövid leírás a kártyához"
            required
          />
        </label>

        <label>
          <span>Facebook link</span>
          <input
            type="url"
            value={facebookUrl}
            onChange={(event) => setFacebookUrl(event.target.value)}
            placeholder="https://facebook.com/..."
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
            {state.type === "saving" ? state.message : "Facebook elem létrehozása"}
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
