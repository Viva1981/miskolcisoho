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
      case "GET_DRIVE_STORAGE":
        return handleGetDriveStorage();
      case "CREATE_ROW":
        return handleCreateRow(body);
      case "UPDATE_ROW":
        return handleUpdateRow(body);
      case "DELETE_ROW":
        return handleDeleteRow(body);
      case "DELETE_DRIVE_FOLDER":
        return handleDeleteDriveFolder(body);
      case "DELETE_DRIVE_FILE":
        return handleDeleteDriveFile(body);
      case "REPLACE_DRIVE_FILE":
        return handleReplaceDriveFile(body);
      case "UPLOAD_DRIVE_FILE":
        return handleUploadDriveFile(body);
      case "CREATE_DRIVE_FOLDER":
        return handleCreateDriveFolder(body);
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

function handleGetDriveStorage() {
  const storageLimitBytes = Number(DriveApp.getStorageLimit() || 0);
  const storageUsedBytes = Number(DriveApp.getStorageUsed() || 0);
  const storageFreeBytes = Math.max(storageLimitBytes - storageUsedBytes, 0);
  const storageUsagePercent =
    storageLimitBytes > 0 ? (storageUsedBytes / storageLimitBytes) * 100 : 0;

  return jsonResponse({
    ok: true,
    storageLimitBytes: storageLimitBytes,
    storageUsedBytes: storageUsedBytes,
    storageFreeBytes: storageFreeBytes,
    storageUsagePercent: storageUsagePercent,
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

function handleDeleteDriveFile(body) {
  const payload = body.payload || {};
  const fileId = payload.fileId;
  const deleteParentFolder = String(payload.deleteParentFolder || "").toLowerCase() === "true";

  if (!fileId) {
    return jsonResponse({
      ok: false,
      error: "Missing fileId.",
    });
  }

  const file = DriveApp.getFileById(fileId);

  if (deleteParentFolder) {
    const parents = file.getParents();

    if (parents.hasNext()) {
      parents.next().setTrashed(true);
    } else {
      file.setTrashed(true);
    }
  } else {
    file.setTrashed(true);
  }

  return jsonResponse({
    ok: true,
  });
}

function handleDeleteDriveFolder(body) {
  const payload = body.payload || {};
  const folderId = payload.folderId;

  if (!folderId) {
    return jsonResponse({
      ok: false,
      error: "Missing folderId.",
    });
  }

  const folder = DriveApp.getFolderById(folderId);
  folder.setTrashed(true);

  return jsonResponse({
    ok: true,
  });
}

function handleReplaceDriveFile(body) {
  const payload = body.payload || {};
  const oldFileId = payload.oldFileId;
  const fileName = payload.fileName;
  const mimeType = payload.mimeType;
  const base64 = payload.base64;

  if (!oldFileId || !fileName || !mimeType || !base64) {
    return jsonResponse({
      ok: false,
      error: "Missing replace payload fields.",
    });
  }

  const oldFile = DriveApp.getFileById(oldFileId);
  const parents = oldFile.getParents();

  if (!parents.hasNext()) {
    return jsonResponse({
      ok: false,
      error: "The original file has no parent folder.",
    });
  }

  const folder = parents.next();
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
  const newFile = folder.createFile(blob);
  newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  oldFile.setTrashed(true);

  return jsonResponse({
    ok: true,
    fileId: newFile.getId(),
    fileUrl: newFile.getUrl(),
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
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return jsonResponse({
    ok: true,
    fileId: file.getId(),
    fileUrl: file.getUrl(),
  });
}

function handleCreateDriveFolder(body) {
  const payload = body.payload || {};
  const rootFolderId = payload.rootFolderId;
  const collectionName = payload.collectionName;
  const folderName = payload.folderName;

  if (!rootFolderId || !collectionName || !folderName) {
    return jsonResponse({
      ok: false,
      error: "Missing folder creation payload fields.",
    });
  }

  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const collectionFolder = getOrCreateChildFolder(rootFolder, collectionName);
  const albumFolder = getOrCreateChildFolder(collectionFolder, folderName);
  collectionFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  albumFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return jsonResponse({
    ok: true,
    folderId: albumFolder.getId(),
    folderUrl: albumFolder.getUrl(),
    folderName: albumFolder.getName(),
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
    if (header === "date" || header === "date_end" || header === "event_date") {
      return Utilities.formatDate(value, timezone, "yyyy-MM-dd");
    }

    if (header === "time" || header === "time_end") {
      return Utilities.formatDate(value, timezone, "HH:mm");
    }
  }

  return String(value);
}

function getOrCreateChildFolder(parentFolder, childName) {
  const normalizedChildName = String(childName).trim();
  const folders = parentFolder.getFoldersByName(normalizedChildName);

  if (folders.hasNext()) {
    return folders.next();
  }

  return parentFolder.createFolder(normalizedChildName);
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
