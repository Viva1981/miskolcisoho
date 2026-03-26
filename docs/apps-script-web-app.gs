const RESOURCE_CONFIG = {
  events: {
    property: "GOOGLE_SHEETS_EVENTS_ID",
    sheetName: "events",
  },
  facebook_feed: {
    property: "GOOGLE_SHEETS_FACEBOOK_FEED_ID",
    sheetName: "facebook_feed",
  },
  gallery_albums: {
    property: "GOOGLE_SHEETS_GALLERY_ALBUMS_ID",
    sheetName: "gallery_albums",
  },
  gallery_images: {
    property: "GOOGLE_SHEETS_GALLERY_IMAGES_ID",
    sheetName: "gallery_images",
  },
};

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const secret = PropertiesService.getScriptProperties().getProperty("ADMIN_SHARED_SECRET");

    if (!secret || body.secret !== secret) {
      return jsonResponse({
        ok: false,
        error: "Unauthorized request.",
      });
    }

    switch (body.action) {
      case "GET_CONTENT":
        return handleGetContent(body);
      case "CREATE_ROW":
        return handleCreateRow(body);
      case "UPDATE_ROW":
        return handleUpdateRow(body);
      case "DELETE_ROW":
        return handleDeleteRow(body);
      case "UPLOAD_DRIVE_FILE":
        return handleUploadDriveFile(body);
      default:
        return jsonResponse({
          ok: false,
          error: "Unsupported action.",
        });
    }
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: String(error),
    });
  }
}

function handleGetContent(body) {
  const sheet = getSheet(body.resource);
  const rows = getSheetRows(sheet);

  return jsonResponse({
    ok: true,
    data: rows,
  });
}

function handleCreateRow(body) {
  const sheet = getSheet(body.resource);
  const payload = body.payload || {};
  const headers = getHeaders(sheet);
  const row = headers.map((header) => payload[header] || "");

  sheet.appendRow(row);

  return jsonResponse({
    ok: true,
    data: getSheetRows(sheet),
  });
}

function handleUpdateRow(body) {
  const sheet = getSheet(body.resource);
  const payload = body.payload || {};
  const headers = getHeaders(sheet);
  const rows = getSheetRows(sheet);
  const rowIndex = rows.findIndex((row) => row.id === body.id);

  if (rowIndex === -1) {
    return jsonResponse({
      ok: false,
      error: "Row not found.",
    });
  }

  const updatedRow = headers.map((header) => {
    const currentValue = rows[rowIndex][header] || "";
    return Object.prototype.hasOwnProperty.call(payload, header) ? payload[header] : currentValue;
  });

  sheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([updatedRow]);

  return jsonResponse({
    ok: true,
    data: getSheetRows(sheet),
  });
}

function handleDeleteRow(body) {
  const sheet = getSheet(body.resource);
  const rows = getSheetRows(sheet);
  const rowIndex = rows.findIndex((row) => row.id === body.id);

  if (rowIndex === -1) {
    return jsonResponse({
      ok: false,
      error: "Row not found.",
    });
  }

  sheet.deleteRow(rowIndex + 2);

  return jsonResponse({
    ok: true,
    data: getSheetRows(sheet),
  });
}

function handleUploadDriveFile(body) {
  const payload = body.payload || {};
  const folderId = payload.folderId;
  const fileName = payload.fileName;
  const mimeType = payload.mimeType;
  const base64 = payload.base64;

  if (!folderId || !fileName || !mimeType || !base64) {
    return jsonResponse({
      ok: false,
      error: "Missing upload payload fields.",
    });
  }

  const folder = DriveApp.getFolderById(folderId);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
  const file = folder.createFile(blob);

  return jsonResponse({
    ok: true,
    fileId: file.getId(),
    fileUrl: file.getUrl(),
  });
}

function getSheet(resource) {
  const resourceConfig = RESOURCE_CONFIG[resource];

  if (!resourceConfig) {
    throw new Error("Unknown resource: " + resource);
  }

  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(resourceConfig.property);

  if (!spreadsheetId) {
    throw new Error("Missing Script Property: " + resourceConfig.property);
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(resourceConfig.sheetName);

  if (!sheet) {
    throw new Error("Missing sheet: " + resourceConfig.sheetName);
  }

  return sheet;
}

function getHeaders(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    return [];
  }

  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
}

function getSheetRows(sheet) {
  const headers = getHeaders(sheet);
  const lastRow = sheet.getLastRow();
  const timezone = Session.getScriptTimeZone() || "Europe/Budapest";

  if (lastRow <= 1 || headers.length === 0) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  return values.map((row) => {
    const entry = {};

    headers.forEach((header, index) => {
      entry[header] = stringifyCellValue(row[index], header, timezone);
    });

    return entry;
  });
}

function stringifyCellValue(value, header, timezone) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Object.prototype.toString.call(value) === "[object Date]") {
    if (header === "date" || header === "event_date") {
      return Utilities.formatDate(value, timezone, "yyyy-MM-dd");
    }

    if (header === "time") {
      return Utilities.formatDate(value, timezone, "HH:mm");
    }
  }

  return String(value);
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
