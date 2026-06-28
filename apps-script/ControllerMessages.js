/**
 * apps-script/ControllerMessages.js
 * 
 * Handler khusus untuk modul pesan kontak (Contact Messages).
 */

/**
 * Menyimpan pesan masuk dari publik
 * @param {object} payload 
 * @returns {object} ID pesan yang tersimpan
 */
function handleSendMessage(payload) {
  if (!payload.senderName || !payload.senderEmail || !payload.message) {
    throw new Error("Nama pengirim, email, dan pesan wajib diisi.");
  }
  
  // Normalisasi data pesan awal
  var cleanPayload = {
    senderName: payload.senderName,
    senderEmail: payload.senderEmail,
    subject: payload.subject || "No Subject",
    message: payload.message,
    isRead: false,
    isReplied: false,
    ipAddress: payload.ipAddress || ""
  };
  
  return createRow("Messages", cleanPayload);
}

/**
 * Mengambil daftar seluruh pesan masuk (khusus Admin)
 * @returns {Array<object>}
 */
function handleGetMessages() {
  return readAllRows("Messages");
}

/**
 * Menandai pesan masuk sebagai telah dibaca (khusus Admin)
 * @param {string} id 
 * @returns {object}
 */
function handleMarkMessageRead(id) {
  if (!id) throw new Error("ID pesan wajib disertakan.");
  return updateRow("Messages", id, { isRead: true });
}
