import "server-only";

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

export function parseAdminResource(value: string | null) {
  if (!value || !isAdminResource(value)) {
    return null;
  }

  return value;
}
