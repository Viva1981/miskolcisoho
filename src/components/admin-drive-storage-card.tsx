"use client";

import { useEffect, useMemo, useState } from "react";

type StorageState = {
  loading: boolean;
  ok: boolean;
  usedBytes: number;
  limitBytes: number;
  freeBytes: number;
  usagePercent: number;
  error?: string;
};

const INITIAL_STATE: StorageState = {
  loading: true,
  ok: false,
  usedBytes: 0,
  limitBytes: 0,
  freeBytes: 0,
  usagePercent: 0,
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 MB";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export function AdminDriveStorageCard() {
  const [state, setState] = useState<StorageState>(INITIAL_STATE);

  useEffect(() => {
    let active = true;

    async function loadStorage() {
      try {
        const response = await fetch("/api/admin/storage", {
          cache: "no-store",
        });

        const result = (await response.json()) as Omit<StorageState, "loading">;

        if (!active) {
          return;
        }

        setState({
          loading: false,
          ok: result.ok,
          usedBytes: result.usedBytes ?? 0,
          limitBytes: result.limitBytes ?? 0,
          freeBytes: result.freeBytes ?? 0,
          usagePercent: result.usagePercent ?? 0,
          error: result.error,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          loading: false,
          ok: false,
          usedBytes: 0,
          limitBytes: 0,
          freeBytes: 0,
          usagePercent: 0,
          error: error instanceof Error ? error.message : "Ismeretlen hiba történt.",
        });
      }
    }

    void loadStorage();

    return () => {
      active = false;
    };
  }, []);

  const usageWidth = useMemo(() => {
    const bounded = Math.max(0, Math.min(100, Number(state.usagePercent) || 0));
    return `${bounded}%`;
  }, [state.usagePercent]);

  return (
    <article className="soho-admin-summary-card soho-admin-storage-card">
      <h2>Tárhely</h2>

      {state.loading ? (
        <div className="soho-admin-storage-skeleton">
          <span className="soho-admin-skeleton-line is-wide" />
          <span className="soho-admin-skeleton-line" />
          <span className="soho-admin-skeleton-line" />
        </div>
      ) : state.ok ? (
        <>
          <p className="soho-admin-storage-main">
            {formatBytes(state.usedBytes)} / {formatBytes(state.limitBytes)}
          </p>

          <div className="soho-admin-storage-bar" aria-hidden="true">
            <span style={{ width: usageWidth }} />
          </div>

          <dl className="soho-admin-storage-meta">
            <div>
              <dt>Szabad</dt>
              <dd>{formatBytes(state.freeBytes)}</dd>
            </div>
            <div>
              <dt>Kihasználtság</dt>
              <dd>{Math.round(state.usagePercent)}%</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="soho-admin-error">{state.error ?? "Nem sikerült lekérni a tárhelyadatokat."}</p>
      )}
    </article>
  );
}
