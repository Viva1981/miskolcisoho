# Progress Log

## 2026-03-26

### Projektindítás

- Létrejött a külön `miskolcisoho` Next.js projekt.
- GitHub repo és Vercel deploy beállítva.
- A Soho landing page átkerült az új projekt főoldalára.

### Dizájn és szerkezet

- Elkészült a fekete alapú Soho főoldal.
- Beállítottuk a logóhasználatot, a hero szekciót, a mobil menüt és a footer irányát.
- A főoldal fő vizuális részei már a referenciaoldal logikáját követik.

### Tartalomstratégia

- Eldőlt, hogy a rendszer nem Supabase-re épül.
- A választott irány: Google Sheets + Google Drive + Apps Script.
- Azért ezt választottuk, mert olcsóbb, fenntarthatóbb és átadhatóbb.

### Tartalmi modulok

- Külön kezeltük a főoldali eseményeket.
- Külön kezeltük a Facebook feed blokkot.
- Külön kezeltük a galéria album és galériakép réteget.

### Drive és Sheet előkészítés

- Rögzítettük a `Soho_Content` Drive gyökérmappát.
- Bekötöttük a 4 Google Sheet azonosítóját:
  - `events`
  - `facebook_feed`
  - `gallery_albums`
  - `gallery_images`

### Admin előkészítés

- Létrejött az első `/admin` oldal.
- Leírtuk az Apps Script szerződést.
- Előkészítettük a szükséges környezeti változókat.

### Miért került be ez a napló

Ez a fájl azért készült, hogy később is visszakövethető legyen:

- milyen döntéseket hoztunk,
- milyen sorrendben épült fel a projekt,
- és miért választottuk az aktuális technikai irányt.

## Következő fókusz

1. Apps Script Web App megírása.
2. Admin CRUD alapok.
3. Valós Google Sheet olvasás.
4. Később adminból indított Drive képfeltöltés.

## 2026-03-26 - Apps Script előkészítés

- Elkészült a másolható Apps Script Web App első verziója.
- Az Apps Script már a valós, különálló Google Sheet ID-khez van igazítva.
- Bekerült egy Next.js proxy route: `/api/admin/content`.
- Ez a route mock mód és élő Apps Script mód között is tud működni.
- Az admin oldal most már jelzi, hogy mock vagy Apps Script állapotban van-e a projekt.

## 2026-03-26 - Élő admin előnézet

- Az admin oldal már élő `events` és `facebook_feed` adatokat tud előnézetben megjeleníteni.
- Az admin ugyanazt a háttérlogikát használja, mint az API route.
- Üres sheet esetén a felület ezt külön, kulturált üres állapotként kezeli.
- Beépült a forrásjelzés is, így látszik, hogy mock vagy Apps Script adat jött-e.

## 2026-03-26 - Első admin űrlap

- Elkészült az első működő admin űrlap az `events` erőforráshoz.
- Az adminból most már új esemény sor hozható létre.
- A mentés az Apps Scripten keresztül közvetlenül az `events` Sheetbe történik.
- Sikeres mentés után az admin előnézet újratöltődik.

## 2026-03-26 - Facebook feed űrlap

- Elkészült a második működő admin űrlap a `facebook_feed` erőforráshoz.
- Az adminból most már új Facebook feed kártya is létrehozható.
- Az `events` és a `facebook_feed` mentés ugyanazt az API útvonalat és Apps Script hidat használja.

## 2026-03-26 - Galéria album űrlap

- Elkészült a `gallery_albums` admin űrlap is.
- Az adminból most már új galéria album is létrehozható.
- A slug kézzel is megadható, de ha üres marad, a rendszer automatikusan generálja.
