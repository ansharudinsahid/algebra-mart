document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // 1. SELEKSI ELEMEN UTAMA & VARIABEL GAME
    // =========================================================
    const formulaInput = document.getElementById("formula-box");
    const paidInput = document.getElementById("paid-box");
    const priceDisplay = document.getElementById("harga-display");

    const inputButtons = document.querySelectorAll(".btn-num, .btn-var, .btn-op");
    const backspaceBtn = document.querySelector(".btn-backspace");
    const clearBtn = document.querySelector(".btn-clear");
    const calcBtn = document.querySelector(".btn-calc");
    const confirmBtn = document.getElementById("btn-final-checkout");
    const modal = document.getElementById("receipt-modal");

    const hargaX = 2000;
    const hargaY = 1500;
    let tagihanTervalidasi = 0;
    let activeInput = formulaInput; // Awal fokus pada kotak input Rumus

    // =========================================================
    // 2. SISTEM MULTI-LAYAR BARU (3 KONDISI LAYAR)
    // =========================================================
    const screenMain = document.getElementById("screen-main");
    const screenLevel = document.getElementById("screen-level");
    const screenGame = document.getElementById("screen-game");

    const btnStartGame = document.getElementById("btn-start-game");
    const btnBackToMain = document.getElementById("btn-back-to-main");
    const btnBackMenu = document.getElementById("btn-back-menu");

    /**
     * Fungsi Terpusat untuk Mengatur Visibilitas Layar Aktif
     * @param {HTMLElement} targetScreen - Elemen div layar tujuan
     */
    function switchScreen(targetScreen) {
        screenMain.classList.remove("active");
        screenLevel.classList.remove("active");
        screenGame.classList.remove("active");
        targetScreen.classList.add("active");
    }

    // Navigasi Beranda Utama -> Pilih Level
    btnStartGame.addEventListener("click", () => {
        switchScreen(screenLevel);
    });

    // Navigasi Pilih Level -> Kembali ke Beranda Utama
    btnBackToMain.addEventListener("click", () => {
        switchScreen(screenMain);
    });

    // Navigasi Gameplay Kasir -> Kembali ke Pilih Level
    btnBackMenu.addEventListener("click", () => {
        switchScreen(screenLevel);
    });

    // =========================================================
    // 3. GENERASI DINAIMS 18 TOMBOL GRID LEVEL
    // =========================================================
    const levelGrid = document.getElementById("level-grid");

    // Membuat tombol level 2 sampai 18 secara loop otomatis agar kode HTML bersih
    for (let i = 2; i <= 18; i++) {
        const levelBtn = document.createElement("div");
        levelBtn.className = "level-card locked";
        levelBtn.id = `level-${i}`;
        levelBtn.innerHTML = `
            ${i}
            <span class="lock-icon">🔒</span>
        `;
        levelGrid.appendChild(levelBtn);
    }

    // Masuk ke Game saat mengklik Level 1
    document.getElementById("level-1").addEventListener("click", () => {
        switchScreen(screenGame);
    });

    // =========================================================
    // 4. LOGIKA INPUT INTERAKTIF (KEYPAD KASIR)
    // =========================================================
    function setFocus(inputElement) {
        activeInput = inputElement;
        formulaInput.classList.remove("input-active");
        paidInput.classList.remove("input-active");
        inputElement.classList.add("input-active");
    }

    formulaInput.addEventListener("click", () => setFocus(formulaInput));
    paidInput.addEventListener("click", () => setFocus(paidInput));

    inputButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            activeInput.value += btn.textContent;
            activeInput.style.color = "#1a1a1a";
        });
    });

    backspaceBtn.addEventListener("click", () => {
        activeInput.value = activeInput.value.slice(0, -1);
    });

    clearBtn.addEventListener("click", () => {
        activeInput.value = "";
        if (activeInput === formulaInput) {
            priceDisplay.textContent = "";
            tagihanTervalidasi = 0;
            document.getElementById("tray-items").innerHTML = "";
        }
    });

    // =========================================================
    // 5. VALIDASI SUBSTITUSI ALJABAR (TOMBOL = )
    // =========================================================
    calcBtn.addEventListener("click", () => {
        if (activeInput === formulaInput) {
            let rumusBersih = formulaInput.value.replace(/\s+/g, '').toLowerCase();

            if (rumusBersih === "3x+2y") {
                tagihanTervalidasi = (3 * hargaX) + (2 * hargaY); // Hasil: 9000
                priceDisplay.textContent = "Rp " + tagihanTervalidasi.toLocaleString('id-ID');
                priceDisplay.style.color = "#a5d6a7";
                munculkanKueDiNampan();
            } else {
                priceDisplay.textContent = "Rumus Salah!";
                priceDisplay.style.color = "#ef9a9a";
                tagihanTervalidasi = 0;
                document.getElementById("tray-items").innerHTML = "";
            }
        }
    });

    // =========================================================
    // 6. PENYELESAIAN TRANSAKSI & VALIDASI STRUK (TOMBOL CHECKOUT)
    // =========================================================
    confirmBtn.addEventListener("click", () => {
        if (tagihanTervalidasi === 0) {
            alert("Harap ketik rumus '3x+2y' dan tekan '=' terlebih dahulu!");
            return;
        }

        let uangDibayar = parseInt(paidInput.value.replace(/[^0-9]/g, ''));
        const maksimalDompet = 10000;

        if (isNaN(uangDibayar) || uangDibayar < tagihanTervalidasi) {
            paidInput.value = "Kurang!";
            paidInput.style.color = "red";
            return;
        }

        if (uangDibayar > maksimalDompet) {
            alert("Uang tidak logis! Maksimal dompet pelanggan adalah Rp 10.000");
            paidInput.value = "Tdk Logis!";
            paidInput.style.color = "red";
            return;
        }

        let kembalian = uangDibayar - tagihanTervalidasi;

        // Render data edukatif ke dalam Modal Struk
        document.getElementById("struk-rumus").textContent = "3x + 2y";
        document.getElementById("struk-proses").textContent = `3(Rp ${hargaX.toLocaleString('id-ID')}) + 2(Rp ${hargaY.toLocaleString('id-ID')})`;
        document.getElementById("struk-rincian").textContent = `Rp ${(3 * hargaX).toLocaleString('id-ID')} + Rp ${(2 * hargaY).toLocaleString('id-ID')}`;
        document.getElementById("struk-total").textContent = "Rp " + tagihanTervalidasi.toLocaleString('id-ID');
        document.getElementById("struk-bayar-total").textContent = "Rp " + uangDibayar.toLocaleString('id-ID');
        document.getElementById("struk-bayar-rincian").textContent = tentukanPecahanUang(uangDibayar);
        document.getElementById("struk-kembalian-hitung").textContent = `Kembalian: Rp ${uangDibayar.toLocaleString('id-ID')} - Rp ${tagihanTervalidasi.toLocaleString('id-ID')} = Rp ${kembalian.toLocaleString('id-ID')}`;
        document.getElementById("struk-kembalian-final").textContent = "Rp " + kembalian.toLocaleString('id-ID');

        modal.style.display = "flex";
    });

    // =========================================================
    // 7. RESET PAPAN GAME, SIMPAN PROGRESS & UNLOCK LEVEL BARU
    // =========================================================
    document.getElementById("btn-close-modal").addEventListener("click", () => {
        // A. Reset Form Gameplay
        modal.style.display = "none";
        formulaInput.value = "";
        paidInput.value = "";
        priceDisplay.textContent = "";
        tagihanTervalidasi = 0;
        document.getElementById("tray-items").innerHTML = "";
        setFocus(formulaInput);

        // B. Efek Gamifikasi: Berikan 3 Bintang Kuning Aktif pada Level 1
        const starsLevel1 = document.getElementById("stars-level-1");
        starsLevel1.innerHTML = "★★★";
        starsLevel1.classList.add("active");

        // C. Efek Gamifikasi: Membuka Gembok Level 2 Secara Otomatis
        const level2 = document.getElementById("level-2");
        if (level2 && level2.classList.contains("locked")) {
            level2.classList.remove("locked");
            
            const lockIcon = level2.querySelector(".lock-icon");
            if (lockIcon) lockIcon.remove();

            level2.innerHTML += `<div class="star-container" id="stars-level-2">☆☆☆</div>`;

            // Membuat Level 2 dapat diakses
            level2.addEventListener("click", () => {
                switchScreen(screenGame);
            });
        }

        // D. Mengembalikan Siswa Kembali ke Layar Pemilihan Level setelah Sukses
        switchScreen(screenLevel);
    });

    // =========================================================
    // 8. FUNGSI HELPER (PECAHAN UANG & GENERASI VISUAL KUE)
    // =========================================================
    function tentukanPecahanUang(amount) {
        const daftarPecahan = [10000, 5000, 2000, 1000];
        let sisaUang = amount;
        let hasilTeks = [];

        for (let pecahan of daftarPecahan) {
            if (sisaUang >= pecahan) {
                let jumlahLembar = Math.floor(sisaUang / pecahan);
                sisaUang = sisaUang % pecahan;
                hasilTeks.push(`${jumlahLembar} Lembar Rp ${pecahan.toLocaleString('id-ID')}`);
            }
        }
        return "(" + hasilTeks.join(" + ") + ")";
    }

    function munculkanKueDiNampan() {
        const tray = document.getElementById("tray-items");
        tray.innerHTML = ""; // Cegah bug tumpukan ganda data

        // Generate 3 visual Kue Padamaran (x)
        for (let i = 0; i < 3; i++) {
            tray.innerHTML += `
                <div class="tray-product">
                    <span class="tray-label">x</span>
                    <img src="image/padamaran.png" class="product-size" alt="Kue Padamaran">
                </div>
            `;
        }

        // Generate 2 visual Kue Gandus (y)
        for (let i = 0; i < 2; i++) {
            tray.innerHTML += `
                <div class="tray-product">
                    <span class="tray-label">y</span>
                    <img src="image/gandus.png" class="product-size" alt="Kue Gandus">
                </div>
            `;
        }
    }
});