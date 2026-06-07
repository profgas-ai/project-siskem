/**
 * main.js - Script umum yang dijalankan di semua halaman
 * CryptGuard: Sistem Keamanan - Bcrypt & SHA-256
 */

/**
 * Toggle visibilitas password (tampilkan/sembunyikan)
 * Dipanggil oleh tombol 👁 di sebelah input password
 * 
 * @param {string} fieldId - ID dari input field password
 */
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Ganti type antara 'password' (tersembunyi) dan 'text' (terlihat)
    field.type = field.type === 'password' ? 'text' : 'password';
}

/**
 * Validasi form sebelum submit
 * Mencegah pengiriman form dengan field kosong
 */
document.addEventListener('DOMContentLoaded', function () {

    // Tambahkan animasi fade-in pada elemen utama
    const mainElements = document.querySelectorAll('.card, .panel, .auth-box, .stat-card');
    mainElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(12px)';
        el.style.transition = `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`;
        
        // Trigger animasi
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        });
    });

    // Highlight nav item aktif berdasarkan URL saat ini
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });
});
