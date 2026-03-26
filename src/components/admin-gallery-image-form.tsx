"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { readFileAsBase64 } from "@/lib/read-file-as-base64";

type SubmitState =
  | { type: "idle" }
  | { type: "saving"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type AlbumOption = {
  id: string;
  title: string;
  driveFolderId: string;
};

type AdminGalleryImageFormProps = {
  albumOptions: AlbumOption[];
};

const INITIAL_SORT_ORDER = "10";

export function AdminGalleryImageForm({ albumOptions }: AdminGalleryImageFormProps) {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ type: "idle" });
  const [albumId, setAlbumId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState(INITIAL_SORT_ORDER);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const selectedAlbum = useMemo(
    () => albumOptions.find((album) => album.id === albumId) ?? null,
    [albumId, albumOptions],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setState({
        type: "error",
        message: "Válassz ki egy képfájlt a feltöltéshez.",
      });
      return;
    }

    if (!folderId) {
      setState({
        type: "error",
        message: "Válassz albumot vagy adj meg érvényes Drive mappa ID-t.",
      });
      return;
    }

    try {
      setState({ type: "saving", message: "Kép feltöltése Drive-ba..." });
      const base64 = await readFileAsBase64(file);

      const uploadResponse = await fetch("/api/admin/upload-drive-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId,
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
          message: uploadResult.error ?? "Nem sikerült feltölteni a képet a Drive-ba.",
        });
        return;
      }

      setState({ type: "saving", message: "Galéria kép mentése a sheetbe..." });

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource: "gallery_images",
          payload: {
            album_id: albumId,
            drive_file_id: uploadResult.fileId,
            drive_file_url: uploadResult.fileUrl,
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
      setFolderId("");
      setCaption("");
      setSortOrder(INITIAL_SORT_ORDER);
      setFile(null);
      setFileInputKey((current) => current + 1);
      setState({
        type: "success",
        message: "A kép feltöltődött a Drive-ba, és bekerült a gallery_images sheetbe.",
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
          <h2>Új galéria kép</h2>
          <p>
            Az űrlap album alapján automatikusan kitölti a Drive mappát, feltölti a képet, majd
            létrehozza a `gallery_images` sort.
          </p>
        </div>
      </div>

      <form className="soho-admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Album</span>
          <select
            value={albumId}
            onChange={(event) => {
              const nextAlbumId = event.target.value;
              setAlbumId(nextAlbumId);
              const nextAlbum = albumOptions.find((album) => album.id === nextAlbumId);
              setFolderId(nextAlbum?.driveFolderId ?? "");
            }}
            required
          >
            <option value="">Válassz albumot</option>
            {albumOptions.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title} ({album.id})
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Drive mappa ID</span>
          <input
            type="text"
            value={folderId}
            onChange={(event) => setFolderId(event.target.value)}
            placeholder="Például: 1AbCdEf..."
            required
          />
        </label>

        {selectedAlbum ? (
          <p className="soho-admin-form-message is-success">
            Kiválasztott album: <strong>{selectedAlbum.title}</strong>
          </p>
        ) : null}

        <label>
          <span>Képfájl</span>
          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
        </label>

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
            {state.type === "saving" ? state.message : "Galéria kép feltöltése és mentése"}
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
