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

- Külön kezeljük a főoldali eseményeket.
- Külön kezeljük a Facebook feed blokkot.
- Külön kezeljük a galéria album és galériakép réteget.

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

## 2026-03-26 - Galéria képek admin és admin szövegtisztítás

- Az admin oldalon minden látható magyar szöveg vissza lett állítva normál ékezetes formára.
- Elkészült az első admin űrlap a `gallery_images` Sheethez.
- A galériaképekhez most már külön rögzíthető az `album_id`, a Drive fájl azonosítója, a Drive URL, a képaláírás és a sorrend.
- A következő lépés a közvetlen Drive-os képfeltöltés lett, hogy a fájl ID-t és URL-t már ne kézzel kelljen bemásolni.

## 2026-03-26 - Közvetlen Drive képfeltöltés adminból

- A galéria kép űrlap most már közvetlenül képfájlt is fogad.
- Mentéskor a rendszer először feltölti a fájlt a megadott Drive mappába, majd az ebből visszakapott `fileId` és `fileUrl` értékkel hozza létre a `gallery_images` sort.
- Később ugyanezt a feltöltési mintát át tudjuk emelni az esemény és Facebook feed borítóképekre is.

## 2026-03-26 - Automatikus album mappa a galériához

- A galéria album létrehozása már nem kézi `drive_folder_id` mezővel működik.
- Az admin új album mentésekor a rendszer automatikusan létrehoz egy almappát a `Soho_Content/gallery` alatt.
- A mappa neve az album címe lesz, és ennek az azonosítója kerül be a `gallery_albums` sheet megfelelő mezőjébe.
- Így a későbbi képfeltöltés már albumonként rendezett Drive struktúrába tud menni.

## 2026-03-26 - Esemény és Facebook feed borítófeltöltés

- Az esemény és Facebook feed admin űrlapok most már közvetlen képfeltöltést is tudnak.
- Mindkét esetben a rendszer létrehozza a saját Drive almappát a megfelelő gyűjtőmappán belül.
- A fájl feltöltése után a visszakapott `cover_drive_file_id` és `cover_drive_url` automatikusan bekerül a mentett sorba.
- Így az admin felhasználónak már nem kell kézzel fájl azonosítót vagy Drive linket másolnia.

## 2026-03-26 - Admin törlés a preview táblákból

- A preview táblák most már soronként törlés gombot kaptak.
- A törlés valós Apps Script `DELETE_ROW` műveleten keresztül megy.
- A sikeres törlés után az admin oldal automatikusan frissül, így a preview és a Google Sheet állapota együtt marad.

## 2026-03-26 - Admin szerkesztés a preview táblákból

- A preview táblák most már soronként szerkesztés gombot is kaptak.
- A szerkesztés egy admin modalon keresztül történik, és a módosításokat az Apps Script `UPDATE_ROW` művelet menti.
- Így a legfontosabb mezők már közvetlenül a listanézetből karbantarthatók.

## 2026-03-26 - Admin kényelmi fejlesztések

- A galéria képfeltöltő űrlap már album legördülőből is tud dolgozni, és automatikusan kitölti a Drive mappa ID-t.
- A preview táblákban a Drive fájlokhoz thumbnail előnézet jelenik meg, a link mezők pedig közvetlenül megnyithatók.
- A listanézetből gyors publikálás váltás és sorrend léptetés is bekerült, így a napi szerkesztés sokkal gyorsabb lett.

## 2026-03-26 - Drive preview jogosultsági javítás

- Kiderült, hogy a törött admin thumbnail nem frontend hiba volt, hanem Google Drive láthatósági probléma.
- Az új Apps Script minta most már a feltöltött képeket automatikusan `anyone with the link can view` jogosultsággal hozza létre.
- A létrehozott galéria- és gyűjtőmappák is publikus megtekintési jogosultságot kapnak.
- Ettől az újonnan feltöltött képek admin preview-ja működni fog.
- A korábban feltöltött fájlokat külön újra kell osztani vagy újra kell tölteni, ha preview képként is látszaniuk kell.
