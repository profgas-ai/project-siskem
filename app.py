"""
=============================================================
  Aplikasi Web: Sistem Keamanan - Bcrypt & SHA-256 Hashing
=============================================================
  Mata Kuliah : Sistem Keamanan
  Topik       : Bcrypt dan SHA-256 (Hashing)
  Deskripsi   : Implementasi autentikasi aman menggunakan
                Bcrypt untuk password hashing dan SHA-256
                untuk demo hashing data umum.
=============================================================
"""

from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import bcrypt          # Untuk hashing password (one-way + salt)
import hashlib         # Untuk SHA-256 (built-in Python)
import json            # Untuk baca/tulis file JSON
import os              # Untuk operasi file dan environment
import re              # Untuk validasi format email
from datetime import datetime  # Untuk mencatat waktu login

# --- Inisialisasi Aplikasi Flask ---
app = Flask(__name__)

# Secret key untuk enkripsi session cookie
# Di production, gunakan nilai acak yang kuat dan simpan di environment variable
app.secret_key = os.environ.get("SECRET_KEY", "secretkey-sistem-keamanan-2026-bcrypt-sha256")

# --- Path ke file penyimpanan data user ---
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")


# ============================================================
#  FUNGSI UTILITAS: Manajemen File JSON
# ============================================================

def load_users():
    """
    Membaca data user dari file users.json.
    Jika file belum ada, kembalikan list kosong.
    """
    if not os.path.exists(USERS_FILE):
        return []  # Belum ada user terdaftar
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        # Jika file rusak atau tidak bisa dibaca, kembalikan list kosong
        return []


def save_users(users):
    """
    Menyimpan list user ke file users.json.
    Menggunakan indent=4 agar file mudah dibaca.
    """
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)


def find_user_by_email(email):
    """
    Mencari user berdasarkan email (case-insensitive).
    Mengembalikan dict user jika ditemukan, None jika tidak.
    """
    users = load_users()
    for user in users:
        if user["email"].lower() == email.lower():
            return user
    return None


# ============================================================
#  FUNGSI UTILITAS: Validasi Input
# ============================================================

def validate_email(email):
    """
    Validasi format email menggunakan regex sederhana.
    Contoh valid: user@example.com
    """
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def validate_password(password):
    """
    Validasi kekuatan password:
    - Minimal 8 karakter
    - Harus mengandung minimal 1 huruf
    - Harus mengandung minimal 1 angka
    Mengembalikan (True, "") jika valid, (False, pesan_error) jika tidak.
    """
    if len(password) < 8:
        return False, "Password minimal 8 karakter."
    if not re.search(r"[A-Za-z]", password):
        return False, "Password harus mengandung minimal 1 huruf."
    if not re.search(r"\d", password):
        return False, "Password harus mengandung minimal 1 angka."
    return True, ""


def escape_html(text):
    """
    Escape karakter HTML berbahaya untuk mencegah XSS (Cross-Site Scripting).
    Karakter seperti <, >, &, " diubah menjadi HTML entity.
    """
    return (str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#x27;"))


# ============================================================
#  FUNGSI UTILITAS: Hashing
# ============================================================

def hash_password_bcrypt(password):
    """
    Melakukan hashing password menggunakan Bcrypt.
    
    Proses:
    1. bcrypt.gensalt() → menghasilkan salt acak (contoh: $2b$12$...)
    2. bcrypt.hashpw()  → menggabungkan password + salt, lalu di-hash
    3. Hasilnya adalah byte string yang sudah mengandung salt di dalamnya
    
    Kenapa Bcrypt?
    - Secara otomatis menambahkan salt (mencegah rainbow table attack)
    - Lambat secara by-design (cost factor) → menyulitkan brute force
    - Hasilnya tidak bisa di-reverse (one-way)
    
    Parameter:
        password (str): Password plaintext dari user
    Returns:
        str: Hash Bcrypt dalam format string (untuk disimpan di JSON)
    """
    # Encode password ke bytes (Bcrypt bekerja dengan bytes, bukan string)
    password_bytes = password.encode("utf-8")
    
    # Generate salt dengan cost factor 12 (semakin tinggi = semakin lambat = semakin aman)
    salt = bcrypt.gensalt(rounds=12)
    
    # Hash password dengan salt
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Decode ke string agar bisa disimpan di JSON
    return hashed.decode("utf-8")


def verify_password_bcrypt(password, hashed):
    """
    Memverifikasi password plaintext dengan hash Bcrypt yang tersimpan.
    
    Proses:
    - bcrypt.checkpw() mengekstrak salt dari hash yang tersimpan
    - Kemudian meng-hash password input dengan salt yang sama
    - Membandingkan hasilnya dengan hash yang tersimpan
    
    Parameter:
        password (str): Password plaintext yang diinput user saat login
        hashed   (str): Hash Bcrypt yang tersimpan di users.json
    Returns:
        bool: True jika password cocok, False jika tidak
    """
    try:
        password_bytes = password.encode("utf-8")
        hashed_bytes = hashed.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False  # Jika terjadi error (misal: format hash salah), anggap tidak cocok


def hash_sha256(text):
    """
    Menghasilkan hash SHA-256 dari sebuah teks.
    
    SHA-256 menghasilkan digest berukuran 256 bit = 64 karakter hex.
    SHA-256 bersifat deterministic: input sama → output selalu sama.
    
    Digunakan di sini untuk demo (bukan untuk hashing password),
    karena SHA-256 tanpa salt rentan terhadap rainbow table attack
    untuk password.
    
    Parameter:
        text (str): Teks yang ingin di-hash
    Returns:
        str: Hash SHA-256 dalam format hexadecimal (64 karakter)
    """
    text_bytes = text.encode("utf-8")
    sha256_hash = hashlib.sha256(text_bytes)
    return sha256_hash.hexdigest()  # Kembalikan dalam format hex


# ============================================================
#  ROUTES: Halaman Utama
# ============================================================

@app.route("/")
def index():
    """Landing page - halaman utama aplikasi."""
    return render_template("index.html")


# ============================================================
#  ROUTES: Register
# ============================================================

@app.route("/register", methods=["GET", "POST"])
def register():
    """
    Halaman dan proses registrasi user baru.
    GET  → tampilkan form registrasi
    POST → proses data registrasi
    """
    # Jika sudah login, redirect ke dashboard
    if "user_email" in session:
        return redirect(url_for("dashboard"))

    error = None
    success = None

    if request.method == "POST":
        # Ambil data dari form
        username = request.form.get("username", "").strip()
        email    = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        confirm  = request.form.get("confirm_password", "")

        # --- Validasi: Field tidak boleh kosong ---
        if not username or not email or not password or not confirm:
            error = "Semua field wajib diisi."

        # --- Validasi: Format email ---
        elif not validate_email(email):
            error = "Format email tidak valid."

        # --- Validasi: Kekuatan password ---
        else:
            is_valid, msg = validate_password(password)
            if not is_valid:
                error = msg

            # --- Validasi: Konfirmasi password ---
            elif password != confirm:
                error = "Password dan konfirmasi password tidak cocok."

            # --- Validasi: Email unik (tidak boleh duplikat) ---
            elif find_user_by_email(email):
                error = "Email sudah terdaftar. Gunakan email lain."

            else:
                # === PROSES KEAMANAN: Hash password sebelum disimpan ===
                # Password TIDAK PERNAH disimpan dalam bentuk plaintext
                password_hash = hash_password_bcrypt(password)

                # Buat objek user baru
                new_user = {
                    "username"      : escape_html(username),   # Sanitasi input
                    "email"         : email.lower(),            # Simpan lowercase
                    "password_hash" : password_hash,            # Hanya simpan hash!
                    "registered_at" : datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }

                # Simpan ke file JSON
                users = load_users()
                users.append(new_user)
                save_users(users)

                success = "Registrasi berhasil! Silakan login."

    return render_template("register.html", error=error, success=success)


# ============================================================
#  ROUTES: Login
# ============================================================

@app.route("/login", methods=["GET", "POST"])
def login():
    """
    Halaman dan proses login user.
    GET  → tampilkan form login
    POST → verifikasi kredensial user
    """
    # Jika sudah login, redirect ke dashboard
    if "user_email" in session:
        return redirect(url_for("dashboard"))

    error = None

    if request.method == "POST":
        email    = request.form.get("email", "").strip()
        password = request.form.get("password", "")

        # Validasi: Field tidak boleh kosong
        if not email or not password:
            error = "Email dan password wajib diisi."
        else:
            # Cari user berdasarkan email
            user = find_user_by_email(email)

            if user is None:
                # Pesan error dibuat umum agar tidak memberi tahu attacker
                # apakah email terdaftar atau tidak (mencegah user enumeration)
                error = "Email atau password salah."
            else:
                # === VERIFIKASI PASSWORD menggunakan Bcrypt ===
                # bcrypt.checkpw() membandingkan plaintext dengan hash
                is_correct = verify_password_bcrypt(password, user["password_hash"])

                if is_correct:
                    # Login berhasil → simpan info user ke session
                    # Session di Flask disimpan di cookie (terenkripsi dengan secret_key)
                    session["user_email"]    = user["email"]
                    session["user_username"] = user["username"]
                    session["login_time"]    = datetime.now().strftime("%d %B %Y, %H:%M:%S")
                    return redirect(url_for("dashboard"))
                else:
                    error = "Email atau password salah."

    return render_template("login.html", error=error)


# ============================================================
#  ROUTES: Dashboard (Protected Route)
# ============================================================

@app.route("/dashboard")
def dashboard():
    """
    Halaman dashboard - hanya bisa diakses oleh user yang sudah login.
    Jika belum login (tidak ada session), redirect ke halaman login.
    """
    # === PROTEKSI AKSES: Cek apakah user sudah login ===
    if "user_email" not in session:
        return redirect(url_for("login"))

    username   = session.get("user_username", "User")
    login_time = session.get("login_time", "-")

    return render_template("dashboard.html", username=username, login_time=login_time)


# ============================================================
#  ROUTES: SHA-256 Demo
# ============================================================

@app.route("/sha256")
def sha256_demo():
    """
    Halaman demo SHA-256 - hanya bisa diakses oleh user yang sudah login.
    """
    if "user_email" not in session:
        return redirect(url_for("login"))

    return render_template("sha256.html",
                           username=session.get("user_username", "User"))


@app.route("/api/sha256", methods=["POST"])
def api_sha256():
    """
    API endpoint untuk menghasilkan hash SHA-256.
    Menerima JSON: {"text": "..."} 
    Mengembalikan JSON: {"hash": "...", "length": 64, "input_length": ...}
    """
    # Cek login (proteksi API endpoint)
    if "user_email" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Input teks tidak ditemukan."}), 400

    text = data["text"]

    if not text:
        return jsonify({"error": "Teks tidak boleh kosong."}), 400

    if len(text) > 10000:
        return jsonify({"error": "Teks terlalu panjang (max 10.000 karakter)."}), 400

    # Generate hash SHA-256
    result_hash = hash_sha256(text)

    return jsonify({
        "hash"         : result_hash,
        "length"       : len(result_hash),      # Selalu 64 karakter hex
        "input_length" : len(text),
        "input_preview": escape_html(text[:100])  # Preview input (sanitized)
    })


# ============================================================
#  ROUTES: Logout
# ============================================================

@app.route("/logout")
def logout():
    """
    Logout: hapus semua data session user.
    Session cookie akan dihapus sehingga user tidak bisa mengakses dashboard.
    """
    session.clear()  # Hapus seluruh isi session
    return redirect(url_for("index"))


# ============================================================
#  MENJALANKAN APLIKASI
# ============================================================

if __name__ == "__main__":
    # Buat file users.json kosong jika belum ada
    if not os.path.exists(USERS_FILE):
        save_users([])
        print(f"[INFO] File users.json dibuat di: {USERS_FILE}")

    print("=" * 55)
    print("  Aplikasi Sistem Keamanan - Bcrypt & SHA-256")
    print("  Jalankan di: http://127.0.0.1:5000")
    print("=" * 55)

    # debug=True hanya untuk development, matikan di production!
    app.run(debug=True, host="127.0.0.1", port=5000)
