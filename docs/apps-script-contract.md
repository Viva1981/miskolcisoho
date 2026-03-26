# Apps Script Contract

Ez a projekt úgy készül, hogy a Next.js admin egy Apps Script Web App endpointot hívjon.

## Környezeti változók

- `APPS_SCRIPT_WEB_APP_URL`
- `ADMIN_SHARED_SECRET`

## Kért műveletek

- `GET_CONTENT`
- `CREATE_ROW`
- `UPDATE_ROW`
- `DELETE_ROW`
- `UPLOAD_DRIVE_FILE`

## Kért Sheet nevek

- `events`
- `facebook_feed`
- `gallery_albums`
- `gallery_images`

## Kért payload formátum

```json
{
  "action": "GET_CONTENT",
  "resource": "events",
  "secret": "ADMIN_SHARED_SECRET"
}
```

```json
{
  "action": "CREATE_ROW",
  "resource": "events",
  "secret": "ADMIN_SHARED_SECRET",
  "payload": {
    "id": "evt_001",
    "title": "Nyitó est",
    "date": "2026-04-24",
    "time": "21:00",
    "facebook_url": "https://facebook.com/...",
    "cover_drive_file_id": "",
    "cover_drive_url": "",
    "published": "true",
    "sort_order": "10"
  }
}
```

```json
{
  "action": "UPDATE_ROW",
  "resource": "gallery_albums",
  "secret": "ADMIN_SHARED_SECRET",
  "id": "album_001",
  "payload": {
    "title": "Opening Night",
    "description": "Frissített leírás"
  }
}
```

```json
{
  "action": "DELETE_ROW",
  "resource": "facebook_feed",
  "secret": "ADMIN_SHARED_SECRET",
  "id": "feed_001"
}
```

## Upload művelet

Első körben már erre készülünk, még ha később kötjük is be:

```json
{
  "action": "UPLOAD_DRIVE_FILE",
  "resource": "gallery_images",
  "secret": "ADMIN_SHARED_SECRET",
  "payload": {
    "folderId": "drive_folder_id",
    "fileName": "opening-night-01.jpg",
    "mimeType": "image/jpeg",
    "base64": "<BASE64_CONTENT>"
  }
}
```

Elvárt válasz:

```json
{
  "ok": true,
  "fileId": "google_drive_file_id",
  "fileUrl": "https://drive.google.com/file/d/..."
}
```

## Elvárt válaszformátum

```json
{
  "ok": true,
  "data": []
}
```

vagy

```json
{
  "ok": false,
  "error": "hibaüzenet"
}
```
