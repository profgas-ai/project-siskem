/**
 * password.js - Password Strength Checker & Validasi
 * CryptGuard: Sistem Keamanan - Bcrypt & SHA-256
 * 
 * Digunakan pada halaman Register untuk:
 * - Menampilkan kekuatan password secara real-time
 * - Memvalidasi persyaratan password
 * - Mengecek kecocokan password & konfirmasi
 */

/**
 * Mengecek kekuatan password dan memperbarui indikator UI
 * Dipanggil setiap kali user mengetik di field password
 * 
 * Level kekuatan:
 * - Weak   : kurang dari 2 kriteria terpenuhi
 * - Medium : 2 kriteria terpenuhi  
 * - Strong : semua 3 kriteria terpenuhi
 * 
 * @param {string} password - Password yang sedang diketik
 */
function checkPasswordStrength(password) {
    // Ambil elemen UI
    const fill  = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    const reqLength = document.getElementById('req-length');
    const reqLetter = document.getElementById('req-letter');
    const reqNumber = document.getElementById('req-number');

    if (!fill || !label) return; // Guard: elemen mungkin tidak ada di halaman ini

    // === CEK SETIAP KRITERIA ===

    // Kriteria 1: Minimal 8 karakter
    const hasLength = password.length >= 8;

    // Kriteria 2: Mengandung minimal 1 huruf (a-z atau A-Z)
    const hasLetter = /[A-Za-z]/.test(password);

    // Kriteria 3: Mengandung minimal 1 angka (0-9)
    const hasNumber = /\d/.test(password);

    // Hitung berapa kriteria yang terpenuhi
    const score = [hasLength, hasLetter, hasNumber].filter(Boolean).length;

    // === UPDATE TAMPILAN REQUIREMENT CHECKLIST ===

    // Update status setiap requirement
    updateReq(reqLength, hasLength, '✗ Min. 8 karakter', '✓ Min. 8 karakter');
    updateReq(reqLetter, hasLetter, '✗ Ada huruf',       '✓ Ada huruf');
    updateReq(reqNumber, hasNumber, '✗ Ada angka',       '✓ Ada angka');

    // === UPDATE STRENGTH BAR & LABEL ===

    if (password.length === 0) {
        // Password masih kosong
        fill.style.width = '0%';
        fill.style.background = 'transparent';
        label.textContent = '—';
        label.style.color = 'var(--text-muted)';

    } else if (score <= 1) {
        // Weak: hanya 0-1 kriteria terpenuhi
        fill.style.width = '30%';
        fill.style.background = 'var(--error)';
        label.textContent = 'Weak';
        label.style.color = 'var(--error)';

    } else if (score === 2) {
        // Medium: 2 kriteria terpenuhi
        fill.style.width = '65%';
        fill.style.background = 'var(--warning)';
        label.textContent = 'Medium';
        label.style.color = 'var(--warning)';

    } else {
        // Strong: semua 3 kriteria terpenuhi
        fill.style.width = '100%';
        fill.style.background = 'var(--success)';
        label.textContent = 'Strong';
        label.style.color = 'var(--success)';
    }

    // Juga update pengecekan match jika confirm password sudah diisi
    checkPasswordMatch();
}


/**
 * Helper: Update tampilan satu item requirement checklist
 * 
 * @param {HTMLElement} el       - Elemen requirement
 * @param {boolean}     isMet   - Apakah kriteria terpenuhi
 * @param {string}      failText - Teks jika gagal
 * @param {string}      passText - Teks jika berhasil
 */
function updateReq(el, isMet, failText, passText) {
    if (!el) return;
    el.textContent = isMet ? passText : failText;
    el.classList.toggle('ok', isMet); // Tambah/hapus class 'ok' (untuk styling warna hijau)
}


/**
 * Mengecek apakah password dan konfirmasi password cocok
 * Dipanggil saat user mengetik di field konfirmasi atau saat password berubah
 */
function checkPasswordMatch() {
    const password = document.getElementById('password');
    const confirm  = document.getElementById('confirm_password');
    const label    = document.getElementById('matchLabel');

    if (!password || !confirm || !label) return;

    // Hanya tampilkan feedback jika konfirmasi sudah mulai diisi
    if (confirm.value.length === 0) {
        label.textContent = '';
        return;
    }

    if (password.value === confirm.value) {
        label.textContent = '✓ Password cocok';
        label.style.color = 'var(--success)';
    } else {
        label.textContent = '✗ Password tidak cocok';
        label.style.color = 'var(--error)';
    }
}


/**
 * Toggle visibilitas password di halaman register
 * (Fungsi ini dipanggil juga dari base template melalui main.js)
 * 
 * @param {string} fieldId - ID field yang ingin di-toggle
 */
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.type = field.type === 'password' ? 'text' : 'password';
}
