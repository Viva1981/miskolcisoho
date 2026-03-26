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
