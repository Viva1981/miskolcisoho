const MAX_ADMIN_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

function formatMegabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

export function validateAdminImageFile(file: File, label = "kép") {
  if (!file.type.startsWith("image/")) {
    throw new Error(`Csak képfájl tölthető fel a(z) ${label} mezőben.`);
  }

  if (file.size > MAX_ADMIN_IMAGE_SIZE_BYTES) {
    throw new Error(
      `A kiválasztott ${label} túl nagy. A maximális méret ${formatMegabytes(MAX_ADMIN_IMAGE_SIZE_BYTES)}.`,
    );
  }
}

export async function parseAdminJsonResponse<T extends { ok: boolean; error?: string }>(
  response: Response,
  fallbackMessage: string,
) {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    if (response.status === 413 || text.includes("Request Entity Too Large")) {
      return {
        ok: false,
        error: `A feltöltött kép túl nagy. A maximális méret ${formatMegabytes(MAX_ADMIN_IMAGE_SIZE_BYTES)}.`,
      } as T;
    }

    return {
      ok: false,
      error: fallbackMessage,
    } as T;
  }
}

export { MAX_ADMIN_IMAGE_SIZE_BYTES };
