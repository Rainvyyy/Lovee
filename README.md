# Romantic Web — Lengkap (Tahap 1–4)

Website kejutan romantis berbasis Flask dengan alur penuh:

**Loading → Password → Gift → Amplop → Surat (typewriter) → Galeri → Bunga → Penutup**

Semua animasi dibuat murni CSS/SVG/Canvas — tidak butuh file gambar/aset
eksternal untuk berjalan (foto galeri & musik bersifat opsional, tinggal
ditambahkan sendiri).

## Menjalankan

```bash
pip install -r requirements.txt
python app.py
```

Lalu buka `http://localhost:5000`.

## Kustomisasi cepat

Semua pengaturan penting ada di bagian atas `app.py`:

```python
PASSWORD = "140224"          # ganti dengan tanggal/kode spesial kalian
RECIPIENT_NAME = "Sayang"    # nama yang muncul di halaman

LETTER_TITLE = "Untuk Kamu"
LETTER_DATE = "14 Juli 2026"
LETTER_BODY = "..."          # isi surat, boleh multi-paragraf (\n\n = ganti paragraf)
LETTER_SIGNATURE = "Selalu milikmu"

ENDING_HEADLINE = "Terima Kasih"
ENDING_SUBLINE = "..."
```

- **Foto galeri**: taruh file `.jpg/.png/.webp` di `static/gallery/` — otomatis
  terdeteksi dan tampil di grid. Kalau folder kosong, akan muncul kartu
  petunjuk, bukan error.
- **Musik latar**: ganti isi `static/audio/music.mp3` dengan file musik kalian
  (format mp3). Musik mulai diputar saat tombol "Buka" di halaman gift ditekan
  (browser mewajibkan interaksi pengguna sebelum autoplay audio).
- **Password**: keypad berbentuk 6 digit angka. Kalau ingin kurang/lebih dari
  6 digit, sesuaikan jumlah `<span class="dot">` di `templates/index.html`
  dan panjang `PASSWORD` di `app.py`.

## Struktur

```
romantic_web/
├── app.py                   # route Flask + semua konten teks (surat, ending)
├── requirements.txt
├── templates/
│   └── index.html           # seluruh 8 stage dalam satu halaman (SPA-style)
└── static/
    ├── css/style.css        # design tokens + styling semua stage (~950 baris)
    ├── js/script.js         # stage manager, loading, password, amplop,
    │                        #   typewriter surat, galeri, bunga, ending
    ├── js/particles.js      # partikel latar (canvas, dipakai di semua stage)
    ├── img/                 # (opsional) aset tambahan kalau mau ganti CSS-art
    ├── audio/music.mp3      # musik latar (ganti dengan file kalian)
    └── gallery/              # foto-foto untuk halaman galeri
```

## Alur & animasi per stage

| Stage | Animasi |
|---|---|
| Loading | progress bar non-linear, heartbeat emblem, fade-blur transisi |
| Password | keypad 6 digit, shake saat salah, glow saat benar |
| Gift | fade up, tombol buka (trigger musik + lanjut) |
| Amplop | lilin retak → flap 3D terbuka → surat naik keluar → zoom |
| Surat | efek mengetik (typewriter) di atas kertas vintage, auto-scroll |
| Galeri | grid foto, hover scale + rotate + shadow, fetch otomatis dari `/api/gallery` |
| Bunga | buket CSS floating + breathing glow |
| Penutup | heartbeat, teks penutup, tombol putar ulang |

## Roadmap

- [x] **Tahap 1** — Struktur Flask, loading, password
- [x] **Tahap 2** — Animasi amplop membuka + surat keluar
- [x] **Tahap 3** — Typewriter, musik, halaman galeri
- [x] **Tahap 4** — Bunga CSS, halaman penutup, responsive dasar

## Ide pengembangan lanjutan (opsional)

- Ganti bentuk bunga CSS dengan ilustrasi SVG kustom di `static/img/`
- Tambah confetti/sparkle saat masuk ke stage penutup
- Simpan status "sudah lihat" di `session` Flask agar bisa langsung lanjut
  kalau dibuka ulang
- Deploy ke layanan seperti Render/Railway/PythonAnywhere agar bisa dibagikan
  lewat link
