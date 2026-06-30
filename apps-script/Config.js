/**
 * apps-script/Config.js
 * 
 * Konfigurasi global backend Google Apps Script.
 * Menggunakan PropertiesService agar credential/secret tidak terekspos langsung di kode.
 */

// Mengambil properties skrip
var scriptProperties = PropertiesService.getScriptProperties();

// Konfigurasi Kredensial Admin & JWT
var JWT_SECRET = scriptProperties.getProperty('JWT_SECRET') || 'default-super-secret-key-please-change-it-in-properties';
var ADMIN_USERNAME = scriptProperties.getProperty('ADMIN_USERNAME') || 'admin';
var ADMIN_PASSWORD = scriptProperties.getProperty('ADMIN_PASSWORD') || 'admin123'; // Disarankan diganti segera

// Konfigurasi Database & Drive
var SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID') || '1Tyc5A29pF8Zkjt1lYktGwrQoXcTUZeSKmvqzQlr9JWc';
var MEDIA_FOLDER_ID = scriptProperties.getProperty('MEDIA_FOLDER_ID') || '1JMRhUy7rM1y6IXULCautTwNWO5qXp-ih'; // Diisi dengan ID Folder Google Drive Aset

// ─────────────────────────────────────────────────────────────────
// KONFIGURASI CLOUDINARY (Primary Image CDN)
// Isi di: Apps Script Editor → Project Settings → Script Properties
// ─────────────────────────────────────────────────────────────────
var CLOUDINARY_CLOUD_NAME = scriptProperties.getProperty('CLOUDINARY_CLOUD_NAME') || '';
var CLOUDINARY_API_KEY    = scriptProperties.getProperty('CLOUDINARY_API_KEY')    || '';
var CLOUDINARY_API_SECRET = scriptProperties.getProperty('CLOUDINARY_API_SECRET') || '';

/**
 * Mendapatkan Spreadsheet instance aktif
 */
function getDatabase() {
  if (SPREADSHEET_ID) {
    var id = SPREADSHEET_ID.trim();
    if (id.indexOf('docs.google.com/spreadsheets') !== -1) {
      var matches = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (matches && matches[1]) {
        id = matches[1];
      }
    }
    return SpreadsheetApp.openById(id);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Mendapatkan Folder Media utama
 */
function getMediaFolder() {
  if (!MEDIA_FOLDER_ID) {
    throw new Error("MEDIA_FOLDER_ID belum diatur pada Script Properties.");
  }
  return DriveApp.getFolderById(MEDIA_FOLDER_ID);
}
