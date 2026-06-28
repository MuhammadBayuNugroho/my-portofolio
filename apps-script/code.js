/**
 * apps-script/code.js
 * 
 * CATATAN: Kode Apps Script telah didekomposisi menjadi berkas-berkas modular berikut:
 * 1. Config.js — Konfigurasi global & script properties.
 * 2. Auth.js — Mekanisme token autentikasi JWT-like HMAC-SHA256.
 * 3. ServiceSpreadsheet.js — Database CRUD operations helper.
 * 4. ControllerData.js — Logika CRUD untuk modul portofolio.
 * 5. ControllerMessages.js — Handler form kontak masuk.
 * 6. ControllerMedia.js — Sistem manajemen berkas & upload Google Drive.
 * 7. Main.js — Entry point utama API (doGet & doPost).
 * 
 * CARA DEPLOY KE GOOGLE APPS SCRIPT:
 * Copy-paste konten dari ketujuh berkas tersebut ke editor Apps Script Anda 
 * (Ekstensi > Apps Script) sebagai file .gs terpisah agar mudah dipelihara.
 */
