// script.js - Logika utama aplikasi

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Functions ---

    /**
     * Memeriksa status login pengguna.
     * Jika tidak ada sesi, redirect ke index.html.
     */
    function checkAuth() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage !== 'index.html' && !isLoggedIn) {
            window.location.href = 'index.html';
        } else if (currentPage === 'index.html' && isLoggedIn) {
            window.location.href = 'dashboard.html';
        }
    }
    
    // Panggil checkAuth di awal
    checkAuth();
    
    // Event listener untuk tombol Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('loggedInUser');
            alert("Anda telah berhasil logout.");
            window.location.href = 'index.html';
        });
    }

    // --- Logic untuk index.html (Login) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email').value;
            const passwordInput = document.getElementById('password').value;

            // Cari pengguna di dataPengguna (dari data.js)
            const user = dataPengguna.find(
                p => p.email === emailInput && p.password === passwordInput
            );

            if (user) {
                // Login berhasil
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                alert(`Login Berhasil! Selamat datang, ${user.nama}.`);
                window.location.href = 'dashboard.html';
            } else {
                // Login gagal (menggunakan alert box)
                alert("email/password yang anda masukkan salah");
            }
        });

        // Logika Modal Box untuk Lupa Password dan Daftar
        const forgotModal = document.getElementById('forgot-modal');
        const registerModal = document.getElementById('register-modal');
        const forgotBtn = document.getElementById('forgot-password-btn');
        const registerBtn = document.getElementById('register-btn');
        const closeBtns = document.querySelectorAll('.close-btn');

        forgotBtn.addEventListener('click', () => forgotModal.style.display = 'block');
        registerBtn.addEventListener('click', () => registerModal.style.display = 'block');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                document.getElementById(modalId).style.display = 'none';
            });
        });

        // Tutup modal ketika klik di luar modal
        window.onclick = function(event) {
            if (event.target == forgotModal) {
                forgotModal.style.display = "none";
            }
            if (event.target == registerModal) {
                registerModal.style.display = "none";
            }
        }
    }


    // --- Logic untuk dashboard.html ---
    const greetingMessage = document.getElementById('greeting-message');
    const userInfo = document.getElementById('user-info');
    if (greetingMessage && userInfo) {
        const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
        const hour = new Date().getHours();
        let greeting;

        if (hour < 12) {
            greeting = "Selamat pagi";
        } else if (hour < 17) {
            greeting = "Selamat siang";
        } else {
            greeting = "Selamat sore";
        }

        greetingMessage.textContent = `${greeting}, ${user ? user.nama : 'Pengguna'}`;
        userInfo.textContent = user ? `${user.nama} (${user.role} - ${user.lokasi})` : 'Pengguna SITTA';
    }

    // --- Logic untuk tracking.html ---
    const trackingForm = document.getElementById('tracking-form');
    const trackingResult = document.getElementById('tracking-result');
    if (trackingForm) {
        trackingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nomorDO = document.getElementById('nomor-do').value.trim();
            const data = dataTracking[nomorDO]; // Akses dataTracking dari data.js

            if (data) {
                // Tampilkan hasil
                document.getElementById('nama-penerima').textContent = `Nama Penerima: ${data.nama}`;
                document.getElementById('nomor-do-display').textContent = data.nomorDO;
                
                const statusElement = document.getElementById('status-pengiriman');
                statusElement.textContent = data.status;
                statusElement.className = `status-badge ${data.status.replace(/\s/g, '')}`; // Untuk CSS styling

                document.getElementById('ekspedisi-detail').textContent = data.ekspedisi;
                document.getElementById('tanggal-kirim-detail').textContent = data.tanggalKirim;
                document.getElementById('paket-detail').textContent = data.paket;
                document.getElementById('total-detail').textContent = data.total;

                // Tampilkan Perjalanan Paket
                const perjalananList = document.getElementById('perjalanan-list');
                perjalananList.innerHTML = ''; // Kosongkan list
                
                // Urutkan terbalik agar yang terbaru di atas
                const sortedPerjalanan = [...data.perjalanan].reverse(); 

                sortedPerjalanan.forEach(p => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${p.waktu}</strong>: ${p.keterangan}`;
                    perjalananList.appendChild(li);
                });

                trackingResult.style.display = 'block';

            } else {
                // Not found (menggunakan alert box)
                trackingResult.style.display = 'none';
                alert(`Nomor DO ${nomorDO} tidak ditemukan dalam sistem tracking.`);
            }
        });
    }

    // --- Logic untuk stok.html ---
    const stokTableBody = document.getElementById('stok-table-body');
    const addStockBtn = document.getElementById('add-stock-btn');
    const addStockFormSection = document.getElementById('add-stock-form-section');
    const newStockForm = document.getElementById('new-stock-form');
    const cancelAddBtn = document.getElementById('cancel-add-btn');

    /**
     * Mengisi tabel stok dari dataBahanAjar.
     */
function renderStokTable() {
    if (!stokTableBody) return;
    stokTableBody.innerHTML = ''; // Kosongkan tabel
    
    // Ganti dataBahanAjar.forEach menjadi loop yang menyertakan index
    dataBahanAjar.forEach((item, index) => { // PERUBAHAN DI SINI: tambahkan 'index'
        const row = stokTableBody.insertRow();
        
        // ... (Kolom Cover sampai Edisi tetap sama) ...
        const cellCover = row.insertCell();
        cellCover.innerHTML = `<img src="${item.cover}" alt="Cover ${item.namaBarang}" onerror="this.onerror=null;this.src='img/placeholder.jpg';" title="${item.namaBarang}">`;
        
        row.insertCell().textContent = item.kodeLokasi;
        row.insertCell().textContent = item.kodeBarang;
        row.insertCell().textContent = item.namaBarang;
        row.insertCell().textContent = item.jenisBarang;
        row.insertCell().textContent = item.edisi;
        
        // Kolom Stok
        const cellStok = row.insertCell();
        cellStok.textContent = item.stok;
        if (item.stok < 200) {
            cellStok.style.backgroundColor = '#ffdddd'; 
            cellStok.style.fontWeight = 'bold';
        }

        // TAMBAHKAN KOLOM AKSI (TOMBOL HAPUS)
        const cellAksi = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.className = 'delete-button';
        // Memberikan indeks baris sebagai argumen untuk fungsi penghapusan
        deleteButton.setAttribute('data-index', index); 
        
        // Menambahkan Event Listener langsung ke tombol
        deleteButton.addEventListener('click', (e) => {
             // Dapatkan indeks dari atribut data-index
             const itemIndex = parseInt(e.target.getAttribute('data-index')); 
             deleteStok(itemIndex); // Panggil fungsi penghapusan
        });

        cellAksi.appendChild(deleteButton);
    });
}

    if (stokTableBody) {
        renderStokTable();
    }
/**
 * Menghapus bahan ajar dari array dan memperbarui tabel.
 * @param {number} index - Indeks item yang akan dihapus di dataBahanAjar.
 */
function deleteStok(index) {
    const namaBarang = dataBahanAjar[index].namaBarang;
    
    // Konfirmasi dari pengguna (opsional, tapi disarankan)
    const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus stok untuk Bahan Ajar: "${namaBarang}"?`);

    if (konfirmasi) {
        // Hapus item dari array menggunakan splice()
        dataBahanAjar.splice(index, 1);
        
        // Render ulang tabel untuk memperbarui tampilan
        renderStokTable(); 

        alert(`Bahan Ajar "${namaBarang}" berhasil dihapus dari sistem.`);
    }
}
    // Logika tombol Tambah Stok Baru
    if (addStockBtn) {
        addStockBtn.addEventListener('click', () => {
            addStockFormSection.style.display = 'block';
            addStockBtn.style.display = 'none';
        });

        cancelAddBtn.addEventListener('click', () => {
            addStockFormSection.style.display = 'none';
            addStockBtn.style.display = 'block';
            newStockForm.reset();
        });
    }

    // Logika Form Tambah Stok Baru (Manipulasi Data Tabel)
if (newStockForm) {
    newStockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Ambil nilai Nama Barang
        const namaBarangInput = document.getElementById('namaBarangNew').value;

        // 2. FUNGSI UNTUK GENERATE PATH OTOMATIS
        // Mengubah "Nama Barang" menjadi "img/nama_barang.jpg"
        const generatedCoverPath = 'img/' + namaBarangInput
            .toLowerCase()   // Ubah ke huruf kecil
            .replace(/\s/g, '_') // Ganti semua spasi (\s) dengan underscore (_)
            .replace(/[^a-z0-9_]/g, '') // Hapus karakter non-alphanumeric (selain a-z, 0-9, dan underscore)
            + '.jpg';
        // Contoh: "Manajemen Keuangan" -> "img/manajemen_keuangan.jpg"

        // Ambil nilai dari input form lainnya
        const newStock = {
            kodeLokasi: document.getElementById('kodeLokasiNew').value.toUpperCase(),
            kodeBarang: document.getElementById('kodeBarangNew').value.toUpperCase(),
            namaBarang: namaBarangInput, // Gunakan nilai input yang sudah diambil
            jenisBarang: document.getElementById('jenisBarangNew').value.toUpperCase(),
            edisi: document.getElementById('edisiNew').value,
            stok: parseInt(document.getElementById('stokNew').value, 10),
            
            // 3. GUNAKAN PATH YANG DIGENERATE OTOMATIS
            cover: generatedCoverPath, 
        };

        // Tambahkan data baru ke array dataBahanAjar (simulasi)
        dataBahanAjar.push(newStock);
        
        // Perbarui tampilan tabel (Manipulasi DOM)
        renderStokTable();
        
        // Reset dan sembunyikan form
        newStockForm.reset();
        addStockFormSection.style.display = 'none';
        addStockBtn.style.display = 'block';

        alert(`Bahan Ajar "${newStock.namaBarang}" berhasil ditambahkan!`);
        });
    }
});