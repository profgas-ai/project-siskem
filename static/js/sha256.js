/**
 * sha256.js - SHA-256 Demo dengan Visualisasi Proses Animatif
 * CryptGuard: Sistem Keamanan - Bcrypt & SHA-256
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

function updateCharCount() {
    const ta = document.getElementById('sha-input');
    const ct = document.getElementById('char-count');
    if (ta && ct) ct.textContent = ta.value.length;
}

function showError(msg) {
    const el = document.getElementById('sha-error');
    if (el) { el.textContent = '⚠ ' + msg; el.style.display = 'flex'; }
}

function hideError() {
    const el = document.getElementById('sha-error');
    if (el) el.style.display = 'none';
}

// ─── Kalkulasi padding SHA-256 (untuk visualisasi) ──────────────────────────

function calcPadding(inputLen) {
    const msgBits   = inputLen * 8;
    // Cari panjang setelah padding agar ≡ 448 mod 512
    let padBits = 448 - (msgBits % 512);
    if (padBits <= 0) padBits += 512;
    const zeroBits  = padBits - 1;           // -1 karena 1 bit '1'
    const totalBits = msgBits + 1 + zeroBits + 64;
    const blocks    = totalBits / 512;
    return { msgBits, zeroBits, totalBits, blocks };
}

// ─── Animasi satu step ───────────────────────────────────────────────────────

function activateStep(stepId, statusId, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            const step   = document.getElementById(stepId);
            const status = document.getElementById(statusId);

            if (step)   step.classList.add('pv-step-active');
            if (status) { status.textContent = '⟳'; status.classList.add('pv-loading'); }

            // Simulasikan "proses" sebentar lalu selesai
            setTimeout(() => {
                if (status) {
                    status.textContent = '✓';
                    status.classList.remove('pv-loading');
                    status.classList.add('pv-done');
                }
                resolve();
            }, 550);
        }, delay);
    });
}

function showArrow(id, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.classList.add('pv-arr-visible');
            resolve();
        }, delay);
    });
}

// ─── Reset semua step ke kondisi awal ───────────────────────────────────────

function resetSteps() {
    for (let i = 1; i <= 5; i++) {
        const step   = document.getElementById(`pv-step-${i}`);
        const status = document.getElementById(`pv-s${i}-status`);
        if (step)   { step.classList.remove('pv-step-active'); }
        if (status) { status.textContent = ''; status.className = 'pv-step-status'; }
    }
    for (let i = 1; i <= 4; i++) {
        const arr = document.getElementById(`pv-arr-${i}`);
        if (arr) arr.classList.remove('pv-arr-visible');
    }
    const fill = document.getElementById('pv-round-fill');
    if (fill) { fill.style.width = '0%'; fill.style.transition = 'none'; }

    const hashDisplay = document.getElementById('sha-hash-display');
    if (hashDisplay) hashDisplay.classList.remove('pv-hash-revealed');
}

// ─── Main: Generate SHA-256 dengan animasi proses ────────────────────────────

async function generateSHA256() {
    const inputEl = document.getElementById('sha-input');
    const visual  = document.getElementById('process-visual');
    hideError();

    const text = inputEl ? inputEl.value : '';
    if (!text.trim()) { showError('Teks tidak boleh kosong.'); return; }

    // Tampilkan container visual
    if (visual) { visual.style.display = 'block'; }

    resetSteps();

    // ── Isi data Step 1 ────────────────────────────────────────────────────
    const preview = text.length > 50 ? text.slice(0, 50) + '...' : text;
    const bytes   = Array.from(new TextEncoder().encode(text.slice(0, 8)))
                         .map(b => b.toString(16).padStart(2, '0'))
                         .join(' ') + (text.length > 8 ? ' ...' : '');

    const pad = calcPadding(text.length);

    set('pv-input-text', preview);
    set('pv-bytes',      bytes);
    set('pv-input-len',  text.length + ' karakter = ' + pad.msgBits + ' bit');

    // Step 2 data
    set('pv-pad-msg-len', pad.msgBits + ' bit');
    set('pv-pad-zeros',   pad.zeroBits + ' bit');
    set('pv-total-bits',  pad.totalBits + ' bit');
    set('pv-blocks',      pad.blocks + ' blok × 512-bit');

    // ── Animasi Steps berurutan ────────────────────────────────────────────
    await activateStep('pv-step-1', 'pv-s1-status', 0);
    await showArrow('pv-arr-1', 200);
    await activateStep('pv-step-2', 'pv-s2-status', 300);
    await showArrow('pv-arr-2', 500);
    await activateStep('pv-step-3', 'pv-s3-status', 600);
    await showArrow('pv-arr-3', 850);

    // Step 4: animasi progress bar 64 rounds
    setTimeout(() => {
        const fill = document.getElementById('pv-round-fill');
        if (fill) {
            fill.style.transition = 'width 0.9s ease';
            fill.style.width = '100%';
        }
    }, 950);
    await activateStep('pv-step-4', 'pv-s4-status', 950);

    // ── Fetch ke server ──────────────────────────────────────────────────
    await showArrow('pv-arr-4', 1200);

    let data = null;
    try {
        const resp = await fetch('/api/sha256', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        data = await resp.json();
        if (!resp.ok || data.error) { showError(data.error || 'Error dari server.'); return; }
    } catch (e) {
        showError('Gagal terhubung ke server. Pastikan Flask berjalan.'); return;
    }

    // Step 5: tampilkan hasil dengan animasi
    setTimeout(() => {
        activateStep('pv-step-5', 'pv-s5-status', 0);

        // Isi output
        const hashDisplay = document.getElementById('sha-hash-display');
        if (hashDisplay) {
            hashDisplay.textContent = data.hash;
            setTimeout(() => hashDisplay.classList.add('pv-hash-revealed'), 200);
        }
        set('hash-length',  data.length + ' karakter');
        set('input-length', data.input_length + ' karakter');
        set('plain-preview', preview);
        set('hash-preview',  data.hash);
    }, 1350);
}

function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ─── Copy hash ───────────────────────────────────────────────────────────────

async function copyHash() {
    const el = document.getElementById('sha-hash-display');
    if (!el || !el.textContent || el.textContent === '—') return;
    try {
        await navigator.clipboard.writeText(el.textContent.trim());
        const btn = document.querySelector('.btn-copy');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = '✓ Tersalin!';
            btn.style.color = 'var(--success)';
            setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000);
        }
    } catch(e) { alert('Gagal menyalin: ' + e.message); }
}

// ─── Avalanche demo ──────────────────────────────────────────────────────────

function demoAvalanche() {
    const input = document.getElementById('sha-input');
    if (!input) return;
    input.value = 'Hello';
    updateCharCount();
    generateSHA256();

    setTimeout(() => {
        const hint = document.createElement('div');
        hint.style.cssText = `
            position:fixed; bottom:2rem; right:2rem; z-index:1000;
            background:var(--bg-elevated); border:1px solid var(--neon-blue);
            color:var(--text-primary); padding:.85rem 1.25rem;
            border-radius:8px; font-size:.85rem; max-width:280px;
            line-height:1.5; box-shadow:0 0 20px rgba(0,212,255,.2);
            animation: fadeIn .3s ease;
        `;
        hint.innerHTML = `💡 <strong>Coba ubah</strong> "Hello" → "hello" lalu klik Generate lagi. Lihat betapa berbedanya hash-nya!`;
        document.body.appendChild(hint);
        setTimeout(() => hint.remove(), 5000);
    }, 500);
}

// ─── Event listener ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const ta = document.getElementById('sha-input');
    if (ta) {
        ta.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault(); generateSHA256();
            }
        });
    }
});
