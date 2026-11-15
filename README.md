# SD HUB

Sashiranka Develogenz brand toolkit and document studio, redesigned from the supplied VZip Hub HTML to match sashiranka.me.

## Open

Open `dist/index.html` in a browser (double-click works; PDF and PNG exports also work from a local file because the signature is embedded in `dist/sig-data.js`), or run `node serve.cjs` and visit http://127.0.0.1:4174. Upload the contents of `dist` to a static web host.

## Features

- Portfolio-inspired ink, paper and signal-red design, Archivo / Instrument Serif / JetBrains Mono typography, original portfolio hero artwork and supplied SD signatures.
- Home page 3D scroll tour (`dist/scene3d.js`): scroll to flip through the five document formats in 3D, mouse tilt, hero parallax, prev/next buttons, and a static layout for reduced-motion settings. No extra libraries.
- Colour copying, original artwork downloads and PNG exports for logo, avatar and social cover.
- Editable invoice, proposal, agreement, email/SMS and meeting-agenda formats.
- Add invoice services, proposal tasks, agreement clauses and agenda items.
- PDF export and browser printing of the selected document.
- Explicit local draft save/restore; drafts stay in the same browser and origin. They are not synchronized across devices or between localhost and the hosted site.

## Before sending a document

Replace sample client, date, address, bank and registration details. Invoice line amounts, tax and totals are manually editable, matching the supplied app; they do not automatically recalculate. The service chart is an illustrative sample, not measured business data. Email/SMS are editable mockups, not messaging integrations.

Internet access is required for Google Fonts, Tailwind, Chart.js, html2canvas and html2pdf. Artwork is bundled locally. Print is available as a fallback if the PDF library cannot load.

## Verification

Checked the desktop and 390px mobile UI in the in-app browser, five document tabs, added proposal tasks and agreement/agenda rows, draft save and restore (including hidden email fields), and successful invoice PDF export. JavaScript syntax checked with Node.

Original files in E:/VZIP HUB 1.1 were not modified.

