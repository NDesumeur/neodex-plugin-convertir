# Convertir

Change le format de tes fichiers sans logiciel en plus : images, sons, vidéos, tableaux et documents. Le fichier converti est créé à côté de l'original, qui n'est jamais modifié.

*English version: [README.en.md](README.en.md)*

## Comment l'utiliser

1. **Glisse des fichiers** sur la zone de dépôt, ou clique **Choisir des fichiers…** (plusieurs à la fois si tu veux). Depuis l'appli Fichiers, tu peux aussi envoyer un fichier directement à Convertir.
2. Chaque fichier apparaît dans la liste avec son type (image, son, vidéo, tableau, document) et un format de sortie déjà choisi ; change-le dans sa liste « → … » si tu veux.
3. Règle si besoin la **taille**, la **qualité** et le **recadrage** (voir plus bas).
4. Clique **Tout convertir**. Une barre montre l'avancement de chaque fichier ; à la fin, **Ouvrir** ouvre le résultat et **Dossier** le montre dans l'Explorateur.

**Vider la liste** retire tout, la croix d'une ligne retire un seul fichier. Si un fichier du même nom existe déjà, le nouveau reçoit un autre nom : rien n'est jamais écrasé.

## Formats

| Type | Fichiers acceptés | Formats de sortie |
|---|---|---|
| Image | PNG, JPG, WebP, GIF, BMP, TIFF, ICO, AVIF | PNG, JPG, WebP, GIF, BMP, ICO, AVIF, TIFF |
| Son | MP3, WAV, OGG, FLAC, M4A, AAC, Opus, WMA | MP3, WAV, OGG, FLAC, M4A, Opus |
| Vidéo | MP4, MKV, WebM, MOV, AVI, WMV, FLV, M4V, 3GP | MP4, WebM, MKV, MOV, GIF animé, et le son seul en MP3, WAV ou M4A |
| Tableau | Excel (XLSX, XLS), ODS, CSV, TSV, JSON | XLSX, CSV, JSON, ODS, TSV, page HTML |
| Document | Word (DOCX), Markdown, HTML, texte | PDF (format A4), HTML, texte, Markdown |

## Réglages

- **Taille** : d'origine, 75 %, 50 %, 25 %, ou une largeur maximale (1920, 1280, 720, 512 ou 256 points pour une icône). Une image plus petite que la limite n'est jamais agrandie.
- **Qualité** : haute, normale ou fichier léger ; elle règle la compression des JPG, WebP, MP3, OGG et vidéos.
- **Recadrer en carré** : garde le carré central de l'image ou de la vidéo, pratique pour les icônes et les vignettes.

Ces réglages s'appliquent aux images et aux vidéos ; les tableaux et documents sont convertis tels quels.

## Ce qu'il faut

Les images, sons et vidéos passent par **ffmpeg**, qui doit être installé sur le PC (par exemple avec `winget install ffmpeg`). Sans lui, Convertir le signale en haut et ne propose que les tableaux et documents, qui fonctionnent sans rien installer.

## Données et synchronisation

Rien n'est synchronisé : les fichiers convertis restent sur le PC, dans le dossier de l'original. Convertir demande l'accès à tes documents pour lire et écrire ces fichiers.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Convertir → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
