/**
 * apps-script/ControllerMedia.js
 *
 * Handler upload gambar ke Cloudinary via Signed Upload API.
 * Google Drive tidak lagi digunakan sebagai primary image CDN.
 *
 * Endpoint Cloudinary: https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload
 * Autentikasi: SHA-1 signed upload (api_key + api_secret dari Script Properties)
 *
 * SETUP (wajib dilakukan sekali):
 * 1. Buka Apps Script Editor → Project Settings → Script Properties
 * 2. Tambahkan tiga property:
 *    - CLOUDINARY_CLOUD_NAME  → nama cloud Anda (contoh: "my-portfolio-cloud")
 *    - CLOUDINARY_API_KEY     → API Key dari Cloudinary Dashboard
 *    - CLOUDINARY_API_SECRET  → API Secret dari Cloudinary Dashboard
 */

/**
 * Menangani upload file base64 dari admin dashboard ke Cloudinary.
 *
 * @param {object} payload - Objek berisi:
 *   - base64Content {string}  Base64-encoded file content (tanpa prefix data URI)
 *   - filename      {string}  Nama file asli (digunakan sebagai public_id)
 *   - mimeType      {string}  MIME type (misal: "image/png")
 *   - subfolder     {string?} Subfolder tujuan di Cloudinary (misal: "projects")
 *
 * @returns {object} Metadata file terupload: url, publicId, width, height, format, size
 */
function handleUploadFile(payload) {
  // ── Validasi Input ─────────────────────────────────────────────
  if (!payload.base64Content || !payload.filename || !payload.mimeType) {
    throw new Error("base64Content, filename, dan mimeType wajib disertakan.");
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Konfigurasi Cloudinary belum lengkap. " +
      "Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET " +
      "sudah ditambahkan di Apps Script Script Properties."
    );
  }

  // ── Bangun public_id (path di Cloudinary) ──────────────────────
  // Contoh: "portfolio/projects/nama-file" atau "portfolio/nama-file"
  var baseFolder = "portfolio";
  var subfolder  = payload.subfolder ? payload.subfolder.replace(/\/$/, '') : null;
  var baseName   = sanitizePublicId(payload.filename);
  var publicId   = subfolder
    ? baseFolder + "/" + subfolder + "/" + baseName
    : baseFolder + "/" + baseName;

  // ── Generate Signature (Cloudinary Signed Upload) ──────────────
  // Signature = SHA1(sorted_params_string + api_secret)
  var timestamp = Math.round(Date.now() / 1000);

  var paramsToSign = {
    folder: baseFolder + (subfolder ? "/" + subfolder : ""),
    public_id: baseName,
    timestamp: timestamp
  };

  var signature = generateCloudinarySignature(paramsToSign, CLOUDINARY_API_SECRET);

  // ── Bangun multipart/form-data untuk UrlFetchApp ───────────────
  // Cloudinary menerima base64 dengan prefix "data:{mimeType};base64,{content}"
  var dataUri = "data:" + payload.mimeType + ";base64," + payload.base64Content;

  var uploadEndpoint =
    "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/upload";

  var formPayload = {
    file:       dataUri,
    api_key:    CLOUDINARY_API_KEY,
    timestamp:  String(timestamp),
    signature:  signature,
    folder:     baseFolder + (subfolder ? "/" + subfolder : ""),
    public_id:  baseName,
  };

  // ── Kirim Request ke Cloudinary ────────────────────────────────
  var options = {
    method:    "POST",
    payload:   formPayload,   // UrlFetchApp akan encode sebagai multipart/form-data
    muteHttpExceptions: true
  };

  var response    = UrlFetchApp.fetch(uploadEndpoint, options);
  var statusCode  = response.getResponseCode();
  var responseText = response.getContentText();

  if (statusCode !== 200) {
    var errBody = {};
    try { errBody = JSON.parse(responseText); } catch (e) {}
    throw new Error(
      "Upload ke Cloudinary gagal (" + statusCode + "): " +
      (errBody.error ? errBody.error.message : responseText)
    );
  }

  // ── Parse Respons Cloudinary ───────────────────────────────────
  var result = JSON.parse(responseText);

  return {
    url:       result.secure_url,       // https://res.cloudinary.com/...
    publicId:  result.public_id,
    fileId:    result.public_id,        // Alias agar kompatibel dengan API lama
    filename:  result.original_filename || payload.filename,
    mimeType:  result.resource_type + "/" + result.format,
    size:      result.bytes,
    width:     result.width  || null,
    height:    result.height || null,
    format:    result.format || null,
  };
}

// ─────────────────────────────────────────────────────────────────
// HELPERS PRIVATE
// ─────────────────────────────────────────────────────────────────

/**
 * Menghasilkan Cloudinary signature sesuai spesifikasi:
 * SHA1( sorted_param_string + api_secret )
 *
 * Referensi: https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
 *
 * @param {object} params - Parameter yang akan di-sign (excluding api_key, file, resource_type)
 * @param {string} apiSecret - Cloudinary API Secret
 * @returns {string} Hexadecimal SHA-1 digest
 */
function generateCloudinarySignature(params, apiSecret) {
  // Urutkan keys secara alphabetical dan bangun query string
  var sortedKeys = Object.keys(params).sort();
  var paramString = sortedKeys
    .map(function(key) { return key + "=" + params[key]; })
    .join("&");

  var signatureInput = paramString + apiSecret;

  // Hitung SHA-1 menggunakan Utilities bawaan GAS
  var signatureBytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_1,
    signatureInput,
    Utilities.Charset.UTF_8
  );

  // Konversi bytes ke hex string
  return signatureBytes.map(function(byte) {
    var hex = (byte & 0xFF).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

/**
 * Sanitasi nama file menjadi Cloudinary-safe public_id.
 * Hapus ekstensi, ganti spasi/karakter non-alphanumeric dengan underscore.
 *
 * @param {string} filename
 * @returns {string} public_id yang aman
 */
function sanitizePublicId(filename) {
  // Hapus ekstensi file
  var nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  // Ganti karakter tidak valid dengan underscore, lowercase
  return nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 100); // Cloudinary max public_id length
}
