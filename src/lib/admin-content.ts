import "server-only";

import { getContentConfig } from "@/lib/content-config";
import {
  AdminResource,
  AdminRow,
  getMockAdminRows,
  isAdminResource,
} from "@/lib/admin-resources";
import { callAppsScript, isAppsScriptConfigured } from "@/lib/apps-script";

export type AdminContentResult = {
  ok: boolean;
  source: "mock" | "apps-script";
  data: AdminRow[];
  error?: string;
};

export async function getAdminContent(resource: AdminResource): Promise<AdminContentResult> {
  if (!isAppsScriptConfigured()) {
    return {
      ok: true,
      source: "mock",
      data: await getMockAdminRows(resource),
    };
  }

  const response = await callAppsScript({
    action: "GET_CONTENT",
    resource,
  });

  if (!response.ok) {
    return {
      ok: false,
      source: "apps-script",
      data: [],
      error: response.error,
    };
  }

  return {
    ok: true,
    source: "apps-script",
    data: response.data ?? [],
  };
}

export async function createAdminRow(
  resource: AdminResource,
  payload: Record<string, string>,
): Promise<AdminContentResult> {
  if (!isAppsScriptConfigured()) {
    return {
      ok: false,
      source: "mock",
      data: [],
      error: "A létrehozás csak élő Apps Script kapcsolattal érhető el.",
    };
  }

  const response = await callAppsScript({
    action: "CREATE_ROW",
    resource,
    payload,
  });

  if (!response.ok) {
    return {
      ok: false,
      source: "apps-script",
      data: [],
      error: response.error,
    };
  }

  return {
    ok: true,
    source: "apps-script",
    data: response.data ?? [],
  };
}

export async function updateAdminRow(
  resource: AdminResource,
  id: string,
  payload: Record<string, string>,
): Promise<AdminContentResult> {
  if (!isAppsScriptConfigured()) {
    return {
      ok: false,
      source: "mock",
      data: [],
      error: "A szerkesztés csak élő Apps Script kapcsolattal érhető el.",
    };
  }

  const response = await callAppsScript({
    action: "UPDATE_ROW",
    resource,
    id,
    payload,
  });

  if (!response.ok) {
    return {
      ok: false,
      source: "apps-script",
      data: [],
      error: response.error,
    };
  }

  return {
    ok: true,
    source: "apps-script",
    data: response.data ?? [],
  };
}

export async function deleteAdminRow(
  resource: AdminResource,
  id: string,
): Promise<AdminContentResult> {
  if (!isAppsScriptConfigured()) {
    return {
      ok: false,
      source: "mock",
      data: [],
      error: "A törlés csak élő Apps Script kapcsolattal érhető el.",
    };
  }

  const response = await callAppsScript({
    action: "DELETE_ROW",
    resource,
    id,
  });

  if (!response.ok) {
    return {
      ok: false,
      source: "apps-script",
      data: [],
      error: response.error,
    };
  }

  return {
    ok: true,
    source: "apps-script",
    data: response.data ?? [],
  };
}

export async function createAdminDriveFolder(payload: { collectionName: string; folderName: string }) {
  if (!isAppsScriptConfigured()) {
    return {
      ok: false as const,
      error: "A mappalétrehozás csak élő Apps Script kapcsolattal érhető el.",
    };
  }

  const config = getContentConfig();
  const response = await callAppsScript({
    action: "CREATE_DRIVE_FOLDER",
    resource: "gallery_albums",
    payload: {
      rootFolderId: config.driveRootFolderId,
      collectionName: payload.collectionName,
      folderName: payload.folderName,
    },
  });

  if (!response.ok || !response.folderId || !response.folderUrl) {
    return {
      ok: false as const,
      error: response.ok
        ? "A Drive mappa létrehozása nem adott vissza mappa adatot."
        : response.error,
    };
  }

  return {
    ok: true as const,
    folderId: response.folderId,
    folderUrl: response.folderUrl,
    folderName: response.folderName ?? payload.folderName,
  };
}

export async function uploadAdminDriveFile(payload: {
  folderId: string;
  fileName: string;
  mimeType: string;
  base64: string;
}) {
  if (!isAppsScriptConfigured()) {
    return {
      ok: false as const,
      error: "A képfeltöltés csak élő Apps Script kapcsolattal érhető el.",
    };
  }

  const response = await callAppsScript({
    action: "UPLOAD_DRIVE_FILE",
    resource: "gallery_images",
    payload,
  });

  if (!response.ok || !response.fileId || !response.fileUrl) {
    return {
      ok: false as const,
      error: response.ok ? "A Drive feltöltés nem adott vissza fájl adatot." : response.error,
    };
  }

  return {
    ok: true as const,
    fileId: response.fileId,
    fileUrl: response.fileUrl,
  };
}

export function parseAdminResource(value: string | null) {
  if (!value || !isAdminResource(value)) {
    return null;
  }

  return value;
}
