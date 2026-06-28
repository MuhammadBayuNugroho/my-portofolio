/**
 * apps-script/ServiceSpreadsheet.js
 * 
 * Reusable database operations helper untuk Google Spreadsheet.
 * Dilengkapi dengan fitur inisialisasi otomatis (Auto-Init) Sheet dan Dummy Data.
 */

/**
 * Membaca data dari sheet dan memetakan baris menjadi array objek JSON
 */
function readAllRows(sheetName) {
  var db = getDatabase();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    // Jalankan auto-init jika sheet belum ada
    initDatabase();
    sheet = db.getSheetByName(sheetName);
  }
  
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length <= 1) {
    return []; // Hanya ada baris header
  }
  
  var headers = values[0];
  var results = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var val = row[j];
      
      // Parse data bertipe boolean dan CSV array
      if (val === true || val === "TRUE") {
        obj[header] = true;
      } else if (val === false || val === "FALSE") {
        obj[header] = false;
      } else if (typeof val === 'string' && (header === 'techStack' || header === 'tags' || header === 'images' || header === 'highlights')) {
        obj[header] = val ? val.split(',').map(function(item) { return item.trim(); }) : [];
      } else if (val instanceof Date) {
        obj[header] = val.toISOString();
      } else {
        obj[header] = val;
      }
    }
    results.push(obj);
  }
  
  return results;
}

/**
 * Menyimpan data baris baru ke dalam Sheet
 */
function createRow(sheetName, payload) {
  var db = getDatabase();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    initDatabase();
    sheet = db.getSheetByName(sheetName);
  }
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = [];
  
  // Set meta data wajib jika belum ada
  payload.id = payload.id || (sheetName.substring(0, 3).toLowerCase() + "_" + Date.now());
  payload.createdAt = new Date().toISOString();
  payload.updatedAt = payload.createdAt;
  
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var val = payload[header];
    
    // Normalisasi array atau boolean untuk spreadsheet
    if (Array.isArray(val)) {
      newRow.push(val.join(', '));
    } else if (val === true) {
      newRow.push(true);
    } else if (val === false) {
      newRow.push(false);
    } else {
      newRow.push(val === undefined ? "" : val);
    }
  }
  
  sheet.appendRow(newRow);
  return payload;
}

/**
 * Mengubah data baris yang sudah ada berdasarkan ID
 */
function updateRow(sheetName, id, payload) {
  var db = getDatabase();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    initDatabase();
    sheet = db.getSheetByName(sheetName);
  }
  
  var range = sheet.getDataRange();
  var values = range.getValues();
  var headers = values[0];
  var rowIndex = -1;
  
  // Cari index baris berdasarkan ID
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      rowIndex = i + 1; // 1-indexed dan baris pertama adalah 2
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error("Data dengan ID '" + id + "' tidak ditemukan di sheet " + sheetName);
  }
  
  // Update timestamp pembaruan
  payload.updatedAt = new Date().toISOString();
  
  var updateRange = sheet.getRange(rowIndex, 1, 1, headers.length);
  var currentRowValues = values[rowIndex - 1];
  var updatedRowValues = [];
  
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    
    // Gunakan value dari payload jika tersedia, jika tidak tetap gunakan value lama
    var val = payload[header] !== undefined ? payload[header] : currentRowValues[j];
    
    // Jangan ubah ID dan tanggal dibuat
    if (header === 'id') val = id;
    if (header === 'createdAt') val = currentRowValues[headers.indexOf('createdAt')];
    
    if (Array.isArray(val)) {
      updatedRowValues.push(val.join(', '));
    } else if (val === true) {
      updatedRowValues.push(true);
    } else if (val === false) {
      updatedRowValues.push(false);
    } else {
      updatedRowValues.push(val === undefined ? "" : val);
    }
  }
  
  updateRange.setValues([updatedRowValues]);
  
  // Kembalikan objek baru
  var resultObj = {};
  for (var k = 0; k < headers.length; k++) {
    resultObj[headers[k]] = updatedRowValues[k];
  }
  return resultObj;
}

/**
 * Menghapus baris berdasarkan ID
 */
function deleteRow(sheetName, id) {
  var db = getDatabase();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
  }
  
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error("Data dengan ID '" + id + "' tidak ditemukan.");
  }
  
  sheet.deleteRow(rowIndex);
  return true;
}

/**
 * INISIALISASI DATABASE SECARA OTOMATIS
 * Membuat sheet yang belum ada, menulis header, dan menambahkan data dummy sebagai contoh.
 * Jalankan fungsi ini secara manual dari Google Apps Script editor dengan mengklik tombol "Run"
 */
function initDatabase() {
  var db = getDatabase();
  
  // Definisi Schema Kolom untuk masing-masing Sheet
  var schemas = {
    "Settings": ["key", "value", "description", "type", "updatedAt"],
    "Skills": ["id", "name", "category", "level", "percentage", "iconUrl", "order", "createdAt", "updatedAt"],
    "Projects": ["id", "title", "slug", "description", "contentMarkdown", "coverImage", "images", "techStack", "projectUrl", "githubUrl", "figmaUrl", "category", "isGalleryOnly", "status", "featured", "order", "createdAt", "updatedAt"],
    "Experiences": ["id", "title", "organization", "location", "startDate", "endDate", "isCurrent", "description", "highlights", "type", "logoUrl", "link", "createdAt", "updatedAt"],
    "Certificates": ["id", "title", "issuer", "category", "issueDate", "expiryDate", "credentialId", "credentialUrl", "imageUrl", "description", "status", "featured", "createdAt", "updatedAt"],
    "Blogs": ["id", "title", "slug", "excerpt", "contentMarkdown", "coverImage", "tags", "category", "status", "views", "readingTime", "featured", "createdAt", "updatedAt"],
    "Testimonials": ["id", "authorName", "authorRole", "authorOrganization", "authorImageUrl", "content", "rating", "relation", "projectId", "status", "featured", "createdAt", "updatedAt"],
    "Messages": ["id", "senderName", "senderEmail", "subject", "message", "isRead", "isReplied", "ipAddress", "createdAt"]
  };
  
  for (var sheetName in schemas) {
    var sheet = db.getSheetByName(sheetName);
    var isNewSheet = false;
    
    // Jika sheet belum ada, buat baru
    if (!sheet) {
      sheet = db.insertSheet(sheetName);
      isNewSheet = true;
    }
    
    // Cek apakah kosong atau baru dibuat, lalu isi header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schemas[sheetName]);
      isNewSheet = true;
    }
    
    // Jika sheet baru dibuat atau kosong, isi dengan data dummy default
    if (isNewSheet) {
      insertDummyData(sheetName, sheet, schemas[sheetName]);
    }
  }
}

/**
 * Menyisipkan data dummy default berdasarkan nama sheet
 */
function insertDummyData(sheetName, sheet, headers) {
  var dummyRows = [];
  var now = new Date().toISOString();
  
  if (sheetName === "Settings") {
    dummyRows = [
      ["site_name", "Muhammad Bayu Nugroho", "Nama pemilik website", "text", now],
      ["bio_title", "Lead Frontend Developer & UI/UX Designer", "Jabatan profesional utama", "text", now],
      ["resume_url", "https://drive.google.com/file/d/dummy-resume-id/view", "Link download resume PDF", "url", now],
      ["contact_email", "bayu@example.com", "Email kontak utama", "text", now]
    ];
  } 
  else if (sheetName === "Skills") {
    dummyRows = [
      ["sk_1", "Next.js", "Frontend", "Expert", 95, "https://lh3.googleusercontent.com/d/dummy-icon-nextjs", 1, now, now],
      ["sk_2", "React.js", "Frontend", "Expert", 95, "https://lh3.googleusercontent.com/d/dummy-icon-react", 2, now, now],
      ["sk_3", "TypeScript", "Frontend", "Advanced", 90, "https://lh3.googleusercontent.com/d/dummy-icon-ts", 3, now, now]
    ];
  } 
  else if (sheetName === "Projects") {
    dummyRows = [
      ["pr_1", "Portfolio Website v3", "portfolio-v3", "Website portofolio interaktif dengan design modern Apple Glassmorphism.", "# Portfolio Case Study\n\n## Solusi\nNext.js + TailwindCSS + Google Apps Script REST API.", "https://lh3.googleusercontent.com/d/dummy-proj-cover", "https://lh3.googleusercontent.com/d/dummy-proj-gal1, https://lh3.googleusercontent.com/d/dummy-proj-gal2", "Next.js, TailwindCSS, TypeScript", "https://bayu.dev", "https://github.com/bayu/portfolio", "", "Web", false, "Published", true, 1, now, now]
    ];
  } 
  else if (sheetName === "Experiences") {
    dummyRows = [
      ["ex_1", "Lead Frontend Engineer", "Vercel Partners Agency", "Jakarta (Remote)", "2025-01-01", "", true, "Memimpin tim frontend dalam implementasi layout Next.js 15 performa tinggi.", "Memimpin tim berisi 4 developer, Peningkatan Lighthouse score hingga 100", "Professional", "https://lh3.googleusercontent.com/d/dummy-logo", "", now, now],
      ["ex_2", "Digital Leadership Award", "Youth Tech Foundation", "", "2026-01-01", "", false, "Penghargaan atas kepemimpinan dalam mendigitalisasi program kerja organisasi.", "Juara Umum Nasional", "Achievement", "", "", now, now]
    ];
  } 
  else if (sheetName === "Certificates") {
    dummyRows = [
      ["crt_1", "AWS Certified Cloud Practitioner", "Amazon Web Services", "Cloud", "2025-06-01", "2028-06-01", "AWS-12345", "https://aws.verify.com", "https://lh3.googleusercontent.com/d/dummy-cert", "Sertifikasi cloud basic", "Active", true, now, now]
    ];
  } 
  else if (sheetName === "Blogs") {
    dummyRows = [
      ["bl_1", "Panduan Next.js 15 & Google Sheets Backend", "nextjs15-sheets-backend", "Cara mudah menyulap Google Spreadsheet menjadi database REST API cepat.", "# Panduan Lengkap\n\nGoogle Apps Script bisa digunakan sebagai backend super hemat.", "https://lh3.googleusercontent.com/d/dummy-blog-cover", "Next.js, Backend, Sheets", "Tech", "Published", 150, 5, true, now, now]
    ];
  } 
  else if (sheetName === "Testimonials") {
    dummyRows = [
      ["ts_1", "Alexander Wright", "Product Director", "InnoTech Solutions", "https://lh3.googleusercontent.com/d/dummy-avatar", "Bayu adalah developer bertangan dingin. Kode rapi dan mata desainnya tajam.", 5, "Client", "", "Published", true, now, now]
    ];
  } 
  else if (sheetName === "Messages") {
    dummyRows = [
      ["msg_1", "John Doe", "john@example.com", "Kolaborasi Project", "Halo Bayu, tertarik untuk bekerjasama dalam pembuatan website perusahaan kami.", false, false, "127.0.0.1", now]
    ];
  }
  
  // Masukkan baris dummy ke sheet
  for (var i = 0; i < dummyRows.length; i++) {
    sheet.appendRow(dummyRows[i]);
  }
}
