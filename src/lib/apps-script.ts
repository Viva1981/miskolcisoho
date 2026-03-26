import "server-only";

import { AdminResource, AdminRow } from "@/lib/admin-resources";

type AppsScriptAction =
  | "GET_CONTENT"
  | "CREATE_ROW"
  | "UPDATE_ROW"
  | "DELETE_ROW"
  | "UPLOAD_DRIVE_FILE"
  | "CREATE_DRIVE_FOLDER";

type AppsScriptRequest = {
  action: AppsScriptAction;
  resource: AdminResource;
  secret: string;
  id?: string;
  payload?: Record<string, string>;
};

type AppsScriptSuccess = {
  ok: true;
  data?: AdminRow[];
  fileId?: string;
  fileUrl?: string;
  folderId?: string;
  folderUrl?: string;
  folderName?: string;
};

type AppsScriptFailure = {
  ok: false;
  error: string;
};

export type AppsScriptResponse = AppsScriptSuccess | AppsScriptFailure;

export function getAppsScriptConfig() {
  return {
    webAppUrl: process.env.APPS_SCRIPT_WEB_APP_URL?.trim() ?? "",
    sharedSecret: process.env.ADMIN_SHARED_SECRET?.trim() ?? "",
  };
}

export function isAppsScriptConfigured() {
  const config = getAppsScriptConfig();
  return Boolean(config.webAppUrl && config.sharedSecret);
}

export async function callAppsScript(
  body: Omit<AppsScriptRequest, "secret">,
): Promise<AppsScriptResponse> {
  const config = getAppsScriptConfig();

  if (!config.webAppUrl || !config.sharedSecret) {
    return {
      ok: false,
      error: "Apps Script is not configured.",
    };
  }

  const response = await fetch(config.webAppUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...body,
      secret: config.sharedSecret,
    } satisfies AppsScriptRequest),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      error: `Apps Script request failed with status ${response.status}.`,
    };
  }

  const json = (await response.json()) as AppsScriptResponse;
  return json;
}
