# Convertir (Convert)

Change your files' format without extra software: images, sounds, videos, spreadsheets and documents. The converted file is created next to the original, which is never modified.

*Version française : [README.md](README.md)*

## How to use it

1. **Drag files** onto the drop area, or click **Choose files…** (several at once if you like). From the Files app, you can also send a file straight to Convertir.
2. Each file appears in the list with its type (image, sound, video, spreadsheet, document) and an output format already chosen; change it in its "→ …" list if you like.
3. Adjust the **size**, **quality** and **crop** if needed (see below).
4. Click **Convert all**. A bar shows each file's progress; when done, **Open** opens the result and **Folder** shows it in Explorer.

**Clear the list** removes everything, a row's cross removes a single file. If a file with the same name already exists, the new one gets another name: nothing is ever overwritten.

## Formats

| Type | Accepted files | Output formats |
|---|---|---|
| Image | PNG, JPG, WebP, GIF, BMP, TIFF, ICO, AVIF | PNG, JPG, WebP, GIF, BMP, ICO, AVIF, TIFF |
| Sound | MP3, WAV, OGG, FLAC, M4A, AAC, Opus, WMA | MP3, WAV, OGG, FLAC, M4A, Opus |
| Video | MP4, MKV, WebM, MOV, AVI, WMV, FLV, M4V, 3GP | MP4, WebM, MKV, MOV, animated GIF, and the sound alone as MP3, WAV or M4A |
| Spreadsheet | Excel (XLSX, XLS), ODS, CSV, TSV, JSON | XLSX, CSV, JSON, ODS, TSV, HTML page |
| Document | Word (DOCX), Markdown, HTML, text | PDF (A4), HTML, text, Markdown |

## Settings

- **Size**: original, 75%, 50%, 25%, or a maximum width (1920, 1280, 720, 512, or 256 for an icon). An image smaller than the limit is never enlarged.
- **Quality**: high, normal or small file; it sets the compression of JPG, WebP, MP3, OGG and videos.
- **Crop to square**: keeps the central square of the image or video, handy for icons and thumbnails.

These settings apply to images and videos; spreadsheets and documents are converted as they are.

## Requirements

Images, sounds and videos go through **ffmpeg**, which must be installed on the PC (for example with `winget install ffmpeg`). Without it, Convertir says so at the top and only offers spreadsheets and documents, which work with nothing to install.

## Data and sync

Nothing is synced: converted files stay on the PC, in the original's folder. Convertir asks for access to your documents to read and write these files.

## Install

In NeoDex: **NeoStore → Discover → Convertir → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
