# Apps Script Setup

## Cél

Ez a leírás azt a minimális beállítást adja meg, amivel a Next.js admin már képes lesz a Google
Sheetekkel és a Drive feltöltéssel is beszélni.

## 1. Apps Script projekt létrehozása

1. Nyisd meg a `script.new` oldalt.
2. Hozz létre egy új Apps Script projektet.
3. Nevezd el például `miskolcisoho-admin-api` névre.

## 2. Script fájl tartalma

1. Másold be a [apps-script-web-app.gs](C:/Users/zsolt/Documents/GitHub/miskolcisoho/docs/apps-script-web-app.gs) teljes tartalmát a projekt `Code.gs` fájljába.
2. Mentsd el.

## 3. Script Properties

Állítsd be ezeket a Script Property értékeket:

- `ADMIN_SHARED_SECRET`
- `GOOGLE_SHEETS_EVENTS_ID`
- `GOOGLE_SHEETS_FACEBOOK_FEED_ID`
- `GOOGLE_SHEETS_GALLERY_ALBUMS_ID`
- `GOOGLE_SHEETS_GALLERY_IMAGES_ID`

Ezek legyenek ugyanazok az értékek, amiket a Next.js projekt is használ.

## 4. Valós spreadsheet ID-k

A jelenlegi projekt ezeket a Google Sheeteket használja:

- `events`
- `facebook_feed`
- `gallery_albums`
- `gallery_images`

Mind a négy külön spreadsheet-ben van, ezért a script ID alapján nyitja meg őket.

## 5. Web App deploy

1. `Deploy`
2. `New deployment`
3. Típus: `Web app`
4. `Execute as`: `Me`
5. `Who has access`: olyan beállítás, amit a projekt használni tud
6. Deploy

Ezután kapsz egy Web App URL-t.

## 6. Next.js környezeti változók

A projekt `.env.local` fájljába majd ezek mennek:

```env
APPS_SCRIPT_WEB_APP_URL=...
ADMIN_SHARED_SECRET=...
GOOGLE_DRIVE_ROOT_FOLDER_ID=1xP-S-AMCuT4qBR38-DZyEYa0QewG2TuO
GOOGLE_SHEETS_EVENTS_ID=1iakm8kyLYBM8v0V5PgFfLkF3gSAHLMIkdq-w7yIGcts
GOOGLE_SHEETS_FACEBOOK_FEED_ID=1ONaRhHY1NB-SHonXu-zT7s7E2nMs40TpUC92lbbqm9k
GOOGLE_SHEETS_GALLERY_ALBUMS_ID=1e6sL_r0AKtf50Ne0zk0yGi3cusEoHVYIknf37cxZiWo
GOOGLE_SHEETS_GALLERY_IMAGES_ID=1nlYcvDZI2n7klBMb8yDpaI43POSOLdI11lp2l-Rzd-s
```

## 7. Jelenlegi állapot

Most a projekt már tud:

- mock adatokkal működni,
- élő Apps Scripten át sheet adatot olvasni és írni,
- Drive-ba képet feltölteni,
- galéria albumhoz automatikusan almappát létrehozni a `Soho_Content/gallery` alatt.

## 8. Fontos működés a galériánál

- új galéria album mentésekor a rendszer létrehoz egy almappát a `gallery` alatt,
- a mappa neve az album címe lesz,
- ha már létezik ugyanilyen nevű mappa, azt használja újra,
- az album `drive_folder_id` mezője ezt a mappát kapja meg,
- a galéria képek feltöltése már ebbe az album mappába tud menni.

## Következő lépés

Ha a Web App URL és a shared secret bekerül a projektbe, a következő körben tovább tudjuk vinni a
borítóképek automatikus feltöltését az eseményekhez és a Facebook feed elemekhez is.
