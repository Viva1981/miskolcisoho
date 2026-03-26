# Project Architecture

## Cél

A Miskolci Soho weboldala úgy épül fel, hogy a tartalmat később nem fejlesztő fogja kezelni. Emiatt a rendszernek egyszerre kell:

- költséghatékonynak lennie,
- könnyen átadhatónak lennie,
- adminfelületről szerkeszthetőnek lennie,
- és később képfeltöltést is támogatnia.

## Fő döntések

### Miért nem Supabase

A projekt fenntartási költsége miatt elvetettük a Supabase alapú megoldást. Helyette Google ökoszisztémára állunk rá.

### Miért Google Sheets + Drive + Apps Script

- A `Google Sheets` lesz a strukturált adatok tárolója.
- A `Google Drive` lesz a képek és fájlok tárolója.
- Az `Apps Script Web App` lesz az egyszerű API réteg az admin és a Google szolgáltatások között.

Ez azért jó, mert:

- olcsón fenntartható,
- nem igényel külön adatbázis-hostingot,
- a tartalom később nem csak fejlesztői oldalról érhető el,
- és fokozatosan bővíthető adminból indított feltöltéssel.

## Tartalmi egységek

### 1. Főoldali események

Felhasználás:

- hero alatti eseménykártyák,
- dátum, idő, Facebook link, borítókép,
- később teljes admin kezelés.

Forrás:

- `events` Sheet
- kapcsolódó képek a Drive-ban

### 2. Facebook feed blokk

Felhasználás:

- a `Kövess minket Facebookon` szekció kártyái,
- cím, rövid szöveg, link, borítókép,
- legfeljebb 9 elem megjelenítése.

Forrás:

- `facebook_feed` Sheet
- kapcsolódó képek a Drive-ban

### 3. Galéria

Felhasználás:

- galéria listaoldal,
- albumoldal,
- album metaadatok és albumképek külön kezelése.

Forrás:

- `gallery_albums` Sheet
- `gallery_images` Sheet
- galériaképek a Drive-ban

## Jelenlegi adatforrások

### Drive gyökér

- `Soho_Content`
- mappa ID: `1xP-S-AMCuT4qBR38-DZyEYa0QewG2TuO`

### Google Sheetek

- `events`
- `facebook_feed`
- `gallery_albums`
- `gallery_images`

## Kódszintű felépítés

### Frontend

- `src/app/page.tsx`
  A főoldal.
- `src/app/galeria/page.tsx`
  Albumlista oldal.
- `src/app/galeria/[slug]/page.tsx`
  Egyedi albumoldal.
- `src/app/admin/page.tsx`
  Admin előkészítő és architektúra oldal.

### Komponensek

- `src/components/soho-header.tsx`
  Header és mobil menü.
- `src/components/soho-events-carousel.tsx`
  Eseménykártya carousel.

### Adatmodellek

- `src/lib/content.ts`
  Főoldali események és Facebook feed adatok.
- `src/lib/gallery.ts`
  Galéria albumok és képek.
- `src/lib/content-config.ts`
  Drive és Sheet konfiguráció.

## Miért mock adatokat használunk most

Jelenleg azért használunk mock adatokat, mert:

- előbb a felületet és az adatmodellt kell stabilizálni,
- a Google Apps Script API még nincs bekötve,
- és így a frontend párhuzamosan tud készülni az admin háttérrésszel.

## Következő lépések

1. Apps Script Web App első verzió.
2. Admin listázás és mentés a Sheetek felé.
3. Galéria és események valós olvasása a Sheetekből.
4. Adminból indított Drive képfeltöltés.
5. Mock adatok lecserélése valós tartalomra.
