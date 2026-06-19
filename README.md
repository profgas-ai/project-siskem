# CryptGuard - Sistem Autentikasi Menggunakan Bcrypt dan SHA-256

## Deskripsi Project

CryptGuard merupakan aplikasi web berbasis Python Flask yang dirancang untuk mendemonstrasikan implementasi algoritma Bcrypt dan SHA-256 dalam bidang keamanan informasi.

Aplikasi ini menyediakan fitur registrasi dan login pengguna dengan mekanisme hashing password menggunakan Bcrypt, serta fitur demonstrasi SHA-256 yang memungkinkan pengguna memahami proses hashing dan verifikasi integritas data secara interaktif.

Selain itu, aplikasi dilengkapi dengan Password Strength Checker untuk membantu pengguna membuat password yang lebih kuat dan aman.

---

## Mata Kuliah

**Sistem Keamanan**

---

## Anggota Kelompok

| Nama | NIM |
|--------|--------|
| Muhammad Bagas Risllah | 2401020146 |
| Muhammad Dimaz Albintani | 2401020159 |

---

## Fitur Utama

### 1. Sistem Registrasi Pengguna
- Registrasi akun baru
- Validasi data pengguna
- Penyimpanan password dalam bentuk hash Bcrypt
- Pencegahan duplikasi email

### 2. Sistem Login
- Verifikasi password menggunakan Bcrypt
- Session management
- Autentikasi pengguna

### 3. Dashboard
- Menampilkan informasi keamanan sistem
- Menampilkan status login pengguna

### 4. Demo SHA-256
- Hashing teks menggunakan algoritma SHA-256
- Menampilkan hasil hash 256-bit dalam format hexadecimal
- Simulasi proses hashing secara visual

### 5. Password Strength Checker
- Analisis kekuatan password secara real-time
- Kategori Weak, Medium, dan Strong
- Validasi kecocokan password dan konfirmasi password

---

## Teknologi yang Digunakan

### Backend
- Python
- Flask
- Bcrypt
- Hashlib

### Frontend
- HTML5
- CSS3
- JavaScript

### Penyimpanan Data
- JSON

---

## Struktur Project

```text
project-siskem/
│
├── app.py
├── users.json
├── requirements.txt
│
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   └── sha256.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── main.js
│       ├── password.js
│       └── sha256.js
│
└── README.md
```

---

## Implementasi Keamanan

### Bcrypt

Bcrypt digunakan untuk:

- Hashing password saat registrasi
- Verifikasi password saat login
- Penggunaan salt otomatis
- Cost factor untuk meningkatkan keamanan terhadap brute force attack

### SHA-256

SHA-256 digunakan untuk:

- Demonstrasi hashing data
- Verifikasi integritas data
- Edukasi konsep hashing kriptografi

### Keamanan Tambahan

- Session Protection
- Server-side Validation
- Password Strength Checker
- Generic Error Message
- Pencegahan penyimpanan password plaintext

---

## Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/Project-siskem.git
```

### 2. Masuk ke Folder Project

```bash
cd project-siskem
```

### 3. Install Dependency

```bash
pip install -r requirements.txt
```

### 4. Jalankan Aplikasi

```bash
python app.py
```

### 5. Buka Browser

```text
http://127.0.0.1:5000
```

---

## Hasil Implementasi

Fitur yang berhasil diimplementasikan:

- Registrasi pengguna
- Login pengguna
- Logout pengguna
- Hashing password menggunakan Bcrypt
- Verifikasi password menggunakan Bcrypt
- Demo SHA-256
- Visualisasi proses SHA-256
- Password Strength Checker
- Dashboard keamanan

---

## Tujuan Project

Project ini dibuat untuk:

- Memahami konsep hashing dalam keamanan informasi
- Mengimplementasikan Bcrypt pada sistem autentikasi
- Mengimplementasikan SHA-256 pada demonstrasi hashing data
- Menunjukkan pentingnya penyimpanan password yang aman
- Mempelajari penerapan keamanan pada aplikasi web

---

## Lisensi

Project ini dibuat untuk keperluan pembelajaran dan tugas Mata Kuliah Sistem Keamanan.