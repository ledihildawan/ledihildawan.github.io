# Ledi Hildawan - Portfolio Website

Situs portofolio pribadi yang aktif di [ledihildawan.github.io](https://ledihildawan.github.io/).
Dibangun di atas fondasi tema *Creative CV* dari [TemplateFlip](https://templateflip.com/) dan telah dimodernisasi sepenuhnya menggunakan runtime **Bun**, arsitektur **Vite 8** (Rolldown + LightningCSS), serta metodologi **Co-located Component UI**.

---

## 🚀 Memulai Proyek (Development dengan Bun)

Pastikan telah menginstal [Bun](https://bun.sh/) (versi 1.2+ / latest).

```bash
# Clone repositori
git clone https://github.com/ledihildawan/ledihildawan.github.io.git
cd ledihildawan.github.io

# Install dependensi
bun install

# Jalankan server lokal (Hot Module Replacement aktif di port 3000)
bun run dev
```

Buka `http://localhost:3000` di browser.

### 🛠️ Script yang Tersedia
- `bun run dev` : Menjalankan development server lokal dengan HMR instan.
- `bun run build` : Mengompilasi kode ke folder `dist/` untuk produksi (Rolldown & LightningCSS).
- `bun run preview` : Menjalankan preview server lokal untuk hasil build `dist/`.
- `bun run lint` : Menjalankan ESLint v9 Flat Config.
- `bun run lint:fix` : Memperbaiki otomatis issue ESLint.
- `bun run format` : Memformat seluruh kode sumber HTML, CSS, dan JS dengan Prettier.

---

## 📁 Struktur Arsitektur Proyek

Proyek ini menggunakan pola **Co-located UI (HTML + CSS + JS)** di dalam `src/ui/`:

```text
ledihildawan.github.io/
├── .github/workflows/
│   └── deploy.yml            # CI/CD otomatis build & deploy via Bun ke GitHub Pages
├── public/                   # Asset statis murni (favicon, data, font WOFF2)
│   ├── data/
│   └── fonts/
├── src/
│   ├── assets/               # Gambar (WebP) dan SVG ikon proyek
│   └── ui/                   # Arsitektur Komponen Terpadu
│       ├── index.css         # Master CSS bundle orchestrator
│       ├── index.js          # Master JS ESM entry point
│       ├── base/             # Reset & grid dasar
│       ├── layouts/          # Meta/Head, Navbar (Header), dan Footer
│       ├── patterns/         # Feature sections (Hero, About, Exp, Portfolio, Contact)
│       └── primitives/       # Tooltips, Popovers, Smooth-scroll, Buttons, Cards
├── index.html                # Root entry template
├── LICENSE-free.txt          # Lisensi asli tema TemplateFlip
├── bun.lockb / bun.lock      # Bun lockfile
├── package.json
└── vite.config.js
```

---

## 🎨 Detail Teknis & Panduan Kustomisasi

- **Warna & Desain Token:** Menggunakan CSS custom properties `--lh-*` pada tema terang dan gelap (`@media (prefers-color-scheme: dark)`).
- **Form Kontak:** Terhubung melalui layanan Formspree pada komponen `src/ui/patterns/contact/contact-box.html`.
- **Anti-Spam Filter:** Domain email pengunjung divalidasi terhadap daftar disposable domains di `public/data/disposable_email_domains.txt`.
- **Asset Hashing & Cache Busting:** Vite secara otomatis memberikan hash unik pada nama file build produksi.

---

## 📄 Lisensi & Kredit

- **Desain Awal:** [TemplateFlip](https://templateflip.com) (*Creative CV v1.1.0*).
- **Kustomisasi & Pembaruan:** [Ledi Hildawan](https://www.instagram.com/ledihildawan/).
- **Ketentuan Lisensi:** Rincian lisensi penggunaan bebas non-komersial tersedia di file [LICENSE-free.txt](LICENSE-free.txt).
