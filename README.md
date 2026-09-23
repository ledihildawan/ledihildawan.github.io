# ledihildawan.github.io

My personal portfolio site, live at [ledihildawan.github.io](https://ledihildawan.github.io/).
Started from a free TemplateFlip theme and heavily customized since. This repo is just
for my own use.

## Running it locally

```bash
git clone https://github.com/ledihildawan/ledihildawan.github.io.git
cd ledihildawan.github.io
python -m http.server 8000
```

Then open http://localhost:8000. There is no build step. To publish, push to `master`
and GitHub Pages picks it up in a minute or two.

## Things worth knowing before editing

**Colors** — all colors are CSS variables in `:root` (inline critical CSS in [index.html](index.html)),
prefixed `--lh-`. Change a variable, and the site follows. Dark mode overrides live in the
`@media (prefers-color-scheme: dark)` block below it.

Main ones:

| Variable | Light | Used for |
|---|---|---|
| `--lh-surface` | `#FFFFFF` | Page background, cards |
| `--lh-base` | `#F0EFEB` | Navbar, avatar pulse |
| `--lh-primary` | `#F0EEE9` | Buttons, year strips |
| `--lh-ink` | `#2C2C2C` | Text, borders, shadows |
| `--lh-link` / `--lh-accent` | `#2D4DB6` | Links, active states, focus (WCAG AAA) |

**Contact form** — sends through Formspree. The form ID is in the `action` attribute in
[index.html](index.html) and referenced again in [scripts/main.js](scripts/main.js).

**Spam filtering** — visitors' emails are checked against [data/disposable_email_domains.json](data/disposable_email_domains.json)
(125k throwaway domains). The file loads only when someone focuses the email field.

**Backgrounds** — hero and contact map images have light and dark versions
(`*-light.webp`, `*-dark.webp`) in [images/](images). They're picked by system preference.

**Editing content** — it's all in [index.html](index.html). Find the text, change it, done.

**Gotchas:**

- Bump the `?ver=` query when changing CSS or JS files, otherwise browsers serve the cached one
- [css/style.min.css](css/style.min.css) loads after the inline styles and contains duplicate `!important` rules
  from the original theme — sometimes an override needs `html body` in front of the selector
- All site JavaScript is vanilla, in [scripts/main.js](scripts/main.js) — no jQuery/Bootstrap runtime

## Docs in this repo

- [README.txt](README.txt) — the original template documentation
- [LICENSE-free.txt](LICENSE-free.txt) — the template license

## Credits

Design by [TemplateFlip](https://templateflip.com), customized by
[Ledi Hildawan](https://www.instagram.com/ledihildawan/).

`© Creative CV. Seluruh hak cipta dilindungi.` — that line belongs to the template and stays.
The free license means personal use only: no client websites, no removing the credit link.
