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
var ADMIN_PASSWORD = scriptProperties.getProperty('ADMIN_PASSWORD') || 'admin'; // Disarankan diganti segera

// Konfigurasi Database & Drive
var SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID') || '';
var MEDIA_FOLDER_ID = scriptProperties.getProperty('MEDIA_FOLDER_ID') || ''; // Diisi dengan ID Folder Google Drive Aset

/**
 * Mendapatkan Spreadsheet instance aktif
 */
function getDatabase() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
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
