const DEFAULTS = {
  driveRootFolderId: "1xP-S-AMCuT4qBR38-DZyEYa0QewG2TuO",
  sheets: {
    events: "1iakm8kyLYBM8v0V5PgFfLkF3gSAHLMIkdq-w7yIGcts",
    facebookFeed: "1ONaRhHY1NB-SHonXu-zT7s7E2nMs40TpUC92lbbqm9k",
    galleryAlbums: "1e6sL_r0AKtf50Ne0zk0yGi3cusEoHVYIknf37cxZiWo",
    galleryImages: "1nlYcvDZI2n7klBMb8yDpaI43POSOLdI11lp2l-Rzd-s",
  },
} as const;

export function getContentConfig() {
  return {
    driveRootFolderId:
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? DEFAULTS.driveRootFolderId,
    sheets: {
      events: process.env.GOOGLE_SHEETS_EVENTS_ID ?? DEFAULTS.sheets.events,
      facebookFeed:
        process.env.GOOGLE_SHEETS_FACEBOOK_FEED_ID ?? DEFAULTS.sheets.facebookFeed,
      galleryAlbums:
        process.env.GOOGLE_SHEETS_GALLERY_ALBUMS_ID ?? DEFAULTS.sheets.galleryAlbums,
      galleryImages:
        process.env.GOOGLE_SHEETS_GALLERY_IMAGES_ID ?? DEFAULTS.sheets.galleryImages,
    },
  };
}

export function getGoogleSheetUrl(sheetId: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
}

export function getGoogleDriveFolderUrl(folderId: string) {
  return `https://drive.google.com/drive/folders/${folderId}`;
}
