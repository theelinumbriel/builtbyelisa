# Handwritten portfolio assets

The portfolio uses the checked-in SVG wordmarks from `public/handwriting/` and keeps the matching Helvetica labels as an accessible fallback if an asset is ever removed.

Installed wordmarks:

- `elisa-diop-weyer.svg`
- `portfolio.svg`
- `musings.svg`
- `about.svg`
- `contact.svg`

The exports use a shared `147.08`-unit vertical canvas and a consistent 10-unit horizontal crop. The longer name mark has a small inherited outline so its visual weight matches the four navigation labels without changing the handwritten paths.

Freehand also exports `handwritten-alphabet.svg`, an SVG symbol sprite containing every completed uppercase and lowercase glyph.

## Uploading replacements

The private `/handwriting` utility on the Vercel deployment accepts replacements for the name and four primary page titles. Authentication is checked by the server through `HANDWRITING_PASSWORD`; the password is never included in browser code.

Uploads are validated, normalized to black, and stored as immutable versions in a private Vercel Blob store. A private manifest points the public `/api/handwriting?slot=…` route to the current version. If the service or uploaded version is unavailable, the route and the image component fall back to the checked-in SVG.

Accepted slots:

- `elisa-diop-weyer`
- `portfolio`
- `musings`
- `about`
- `contact`
