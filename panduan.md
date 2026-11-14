# 📁 Panduan Struktur Project `umiq-food`

> Project ini menggunakan **Laravel** (backend PHP) + **React + TypeScript** (frontend) yang dihubungkan via **Inertia.js** — teknologi ini bikin Laravel dan React bisa jalan bareng tanpa perlu API terpisah.

---

## 🗂️ Gambaran Besar

```
umiq-food/
├── app/           ← 🧠 Otak backend (PHP/Laravel)
├── resources/     ← 🎨 Frontend (React/TypeScript/CSS)
├── routes/        ← 🗺️ Peta URL website kamu
├── database/      ← 🗄️ Semua urusan database
├── config/        ← ⚙️ Pengaturan aplikasi
├── public/        ← 🌐 File yang bisa diakses publik
├── storage/       ← 📦 Tempat simpan file & log
├── bootstrap/     ← 🚀 File starter Laravel (jangan diutak-atik)
├── vendor/        ← 📚 Library PHP (jangan diutak-atik)
├── node_modules/  ← 📚 Library JS (jangan diutak-atik)
├── tests/         ← 🧪 Tempat nulis test/pengujian
├── .env           ← 🔑 Konfigurasi rahasia (DB, API key, dll)
├── artisan        ← 🛠️ Tool command line Laravel
├── composer.json  ← 📋 Daftar library PHP yang dipakai
└── package.json   ← 📋 Daftar library JS yang dipakai
```

---

## 🧠 Folder `app/` — Otak Backend

Ini adalah folder **terpenting** di Laravel. Semua logika bisnis ada di sini.

```
app/
├── Http/
│   ├── Controllers/   ← 🎮 "Manager" yang terima request & kirim response
│   ├── Middleware/    ← 🛡️ Penjaga/filter sebelum request masuk
│   └── Requests/      ← ✅ Validasi data yang masuk dari user
├── Models/            ← 🗃️ Representasi tabel database dalam kode
├── Providers/         ← 🔌 Tempat daftarin service/fitur Laravel
├── Actions/           ← ⚡ Aksi-aksi spesifik (login, daftar, reset password)
└── Concerns/          ← 🧩 Potongan kode yang bisa dipakai ulang
```

### Penjelasan Detail:

#### 📂 `Controllers/` — Si Pengatur
> **Analogi:** Seperti pelayan restoran. Menerima pesanan (request) dari customer, mengambil data ke dapur (Model), lalu menyajikannya kembali (response).

```php
// Contoh: UserController.php
class UserController {
    public function index() {
        $users = User::all(); // ambil data dari database
        return view('users', compact('users')); // kirim ke tampilan
    }
}
```

#### 📂 `Models/` — Si Perwakilan Database
> **Analogi:** Seperti formulir yang bentuknya sama persis dengan tabel di database. Kalau ada tabel `users`, ada file `User.php`.

```php
// User.php = merepresentasikan tabel "users" di database
class User extends Model {
    protected $fillable = ['name', 'email', 'password'];
}
```

#### 📂 `Middleware/` — Si Penjaga Pintu
> **Analogi:** Satpam yang cek apakah kamu boleh masuk atau tidak. Contoh: kalau belum login, langsung diarahkan ke halaman login.

#### 📂 `Requests/` — Si Validator
> **Analogi:** Petugas yang cek apakah form yang kamu isi sudah benar sebelum data dikirim ke database.

---

## 🎨 Folder `resources/` — Tampilan Frontend

```
resources/
├── js/
│   ├── pages/         ← 📄 Halaman-halaman website (React components)
│   │   ├── auth/      ← Login, Register, Lupa Password
│   │   └── settings/  ← Pengaturan profil user
│   ├── components/    ← 🧩 Komponen UI yang bisa dipakai ulang
│   │   └── ui/        ← Komponen shadcn/ui (Button, Card, Input, dll)
│   ├── layouts/       ← 🖼️ Kerangka tampilan (header, sidebar, dll)
│   │   ├── app/       ← Layout untuk halaman dalam app (sudah login)
│   │   ├── auth/      ← Layout untuk halaman login/register
│   │   └── settings/  ← Layout untuk halaman pengaturan
│   ├── routes/        ← 🗺️ Routing frontend (Inertia.js)
│   └── actions/       ← ⚡ Fungsi-fungsi aksi dari frontend
└── css/
    └── app.css        ← 🎨 Style global (Tailwind CSS)
```

### Penjelasan Detail:

#### 📂 `pages/` — Halaman Website
> **Analogi:** Setiap file di sini = satu halaman yang bisa dibuka di browser.

```
pages/
├── auth/
│   ├── login.tsx      ← Halaman Login
│   ├── register.tsx   ← Halaman Daftar
│   └── ...
└── settings/
    ├── profile.tsx    ← Halaman Edit Profil
    └── ...
```

#### 📂 `components/` — Komponen UI
> **Analogi:** Lego blocks. Dibuat sekali, bisa dipakai berkali-kali di mana saja.

```
components/
├── ui/
│   ├── button.tsx     ← Komponen tombol
│   ├── input.tsx      ← Komponen input text
│   ├── card.tsx       ← Komponen kartu
│   └── ...
├── app-sidebar.tsx    ← Komponen sidebar navigasi
├── app-header.tsx     ← Komponen header atas
└── nav-main.tsx       ← Komponen navigasi utama
```

#### 📂 `layouts/` — Kerangka Halaman
> **Analogi:** Template/frame gambar. Semua halaman dalam app punya header dan sidebar yang sama — itu datangnya dari layout.

---

## 🗺️ Folder `routes/` — Peta URL

```
routes/
├── web.php       ← 🌐 Semua URL website (yang dibuka browser)
├── console.php   ← 🖥️ Command-command artisan custom
└── settings.php  ← ⚙️ URL khusus halaman settings
```

> **Analogi:** Seperti daftar isi buku. Kalau ada yang buka `website.com/masakan`, di sini ditulis "kalau ada yang buka `/masakan`, panggil si `MasakanController`".

```php
// web.php
Route::get('/masakan', [MasakanController::class, 'index']); // tampilkan daftar masakan
Route::post('/masakan', [MasakanController::class, 'store']); // simpan masakan baru
Route::delete('/masakan/{id}', [MasakanController::class, 'destroy']); // hapus masakan
```

---

## 🗄️ Folder `database/` — Urusan Database

```
database/
├── migrations/    ← 📋 "Blueprint" pembuatan tabel database
├── seeders/       ← 🌱 Data awal/contoh untuk database
└── factories/     ← 🏭 Generator data palsu untuk testing
```

### Penjelasan Detail:

#### 📂 `migrations/` — Pembuat Tabel
> **Analogi:** Seperti instruksi IKEA. File migration = instruksi step-by-step cara bikin tabel di database. Kalau jalanin `php artisan migrate`, Laravel baca semua instruksi ini dan bikin tabelnya.

```php
// create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->timestamps(); // otomatis bikin kolom created_at & updated_at
});
```

#### 📂 `seeders/` — Pengisi Data Awal
> **Analogi:** Seperti mengisi toko baru dengan produk contoh sebelum dibuka. Berguna untuk testing.

---

## ⚙️ Folder `config/` — Pengaturan App

Berisi file-file konfigurasi Laravel seperti:
- `database.php` → pengaturan koneksi database
- `mail.php` → pengaturan email
- `app.php` → pengaturan dasar aplikasi

> **Penting:** Nilai sensitif (password, API key) **jangan** ditulis langsung di sini. Tulis di `.env`, lalu panggil via `env('DB_PASSWORD')`.

---

## 🌐 Folder `public/` — Bisa Diakses Publik

Folder ini yang "dilihat" oleh internet. Hanya file di sini yang bisa diakses langsung via browser.

```
public/
├── index.php    ← Pintu masuk utama semua request ke Laravel
├── build/       ← Hasil compile CSS & JS (dibuat otomatis saat build)
└── storage/     ← Link ke folder storage (untuk foto yang diupload)
```

---

## 📦 Folder `storage/` — Gudang File

```
storage/
├── app/
│   └── public/  ← Foto & file yang diupload user disimpan di sini
├── framework/   ← Cache, session (jangan diutak-atik)
└── logs/
    └── laravel.log  ← 📋 Log error aplikasi (sangat berguna untuk debug!)
```

> **Tips:** Kalau ada error, selalu cek `storage/logs/laravel.log` dulu!

---

## 🔑 File-file Penting di Root

| File | Fungsi |
|---|---|
| `.env` | Konfigurasi rahasia (DB, API key). **Jangan di-commit ke Git!** |
| `.env.example` | Contoh file `.env` tanpa nilai asli (aman di-commit) |
| `artisan` | CLI tool Laravel: `php artisan migrate`, `php artisan serve`, dll |
| `composer.json` | Daftar library PHP yang dipakai (seperti `package.json` tapi untuk PHP) |
| `package.json` | Daftar library JavaScript/TypeScript yang dipakai |
| `vite.config.ts` | Konfigurasi Vite (tool bundler JS/CSS) |
| `tsconfig.json` | Konfigurasi TypeScript |

---

## 🔄 Alur Kerja (Bagaimana Semuanya Terhubung)

```
Browser buka URL
      ↓
routes/web.php          ← URL dicocokkan di sini
      ↓
Controllers/            ← Controller yang sesuai dipanggil
      ↓
Models/                 ← Controller minta data ke Model
      ↓
Database (MySQL)        ← Model ambil data dari database
      ↓
resources/js/pages/     ← Controller render halaman React
      ↓
Browser tampilkan       ← User melihat hasilnya
```

---

## 🚀 Command yang Sering Dipakai

```bash
# Jalankan server lokal
php artisan serve

# Buat migration baru (contoh: tabel masakan)
php artisan make:migration create_masakans_table

# Jalankan migration ke database
php artisan migrate

# Buat Controller baru
php artisan make:controller MasakanController

# Buat Model baru
php artisan make:model Masakan

# Reset dan isi ulang database
php artisan migrate:fresh --seed

# Compile frontend (React/CSS)
npm run dev    ← mode development (ada hot reload)
npm run build  ← mode production
```

---

## 💡 Tips Belajar

1. **Mulai dari `routes/web.php`** — pahami URL apa saja yang ada
2. **Ikuti alurnya** — dari route → controller → model → halaman
3. **Coba buat 1 fitur kecil** — misalnya CRUD daftar masakan
4. **Kalau error, cek** `storage/logs/laravel.log`
5. **Gunakan** `php artisan tinker` untuk coba-coba query database langsung

