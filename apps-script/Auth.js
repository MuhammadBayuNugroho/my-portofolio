/**
 * apps-script/Auth.js
 * 
 * Sistem Autentikasi Stateless JWT-like menggunakan HMAC-SHA256.
 */

/**
 * Membuat token untuk session login admin
 * @param {string} username 
 * @returns {string} token (header.payload.signature)
 */
function generateToken(username) {
  var header = {
    alg: "HS256",
    typ: "JWT"
  };
  
  // Set durasi token aktif: 24 Jam
  var exp = Date.now() + (24 * 60 * 60 * 1000);
  
  var payload = {
    user: username,
    exp: exp
  };
  
  var stringifiedHeader = JSON.stringify(header);
  var stringifiedPayload = JSON.stringify(payload);
  
  var base64Header = base64Encode(stringifiedHeader);
  var base64Payload = base64Encode(stringifiedPayload);
  
  var signatureInput = base64Header + "." + base64Payload;
  var signature = calculateSignature(signatureInput, JWT_SECRET);
  
  return base64Header + "." + base64Payload + "." + signature;
}

/**
 * Validasi token authorization
 * @param {string} token 
 * @returns {object} payload data jika valid
 */
function validateToken(token) {
  if (!token) {
    throw new Error("Akses ditolak: Token tidak disertakan.");
  }
  
  // Hapus prefix Bearer jika ada
  if (token.indexOf("Bearer ") === 0) {
    token = token.substring(7);
  }
  
  var parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Akses ditolak: Format token tidak valid.");
  }
  
  var headerPart = parts[0];
  var payloadPart = parts[1];
  var signaturePart = parts[2];
  
  // Verifikasi Signature
  var signatureInput = headerPart + "." + payloadPart;
  var expectedSignature = calculateSignature(signatureInput, JWT_SECRET);
  
  if (signaturePart !== expectedSignature) {
    throw new Error("Akses ditolak: Tanda tangan token tidak valid.");
  }
  
  // Verifikasi Expiration
  var decodedPayloadStr = base64Decode(payloadPart);
  var payload = JSON.parse(decodedPayloadStr);
  
  if (Date.now() > payload.exp) {
    throw new Error("Sesi login telah kedaluwarsa. Silakan login kembali.");
  }
  
  return payload;
}

/**
 * Helper Base64 URL Safe Encoding
 */
function base64Encode(str) {
  var bytes = Utilities.newBlob(str).getBytes();
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

/**
 * Helper Base64 URL Safe Decoding
 */
function base64Decode(str) {
  var decodedBytes = Utilities.base64DecodeWebSafe(str);
  return Utilities.newBlob(decodedBytes).getDataAsString();
}

/**
 * Menghitung signature HMAC SHA256
 */
function calculateSignature(input, secret) {
  var key = Utilities.newBlob(secret).getBytes();
  var signatureBytes = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, input, key);
  return Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/, '');
}
