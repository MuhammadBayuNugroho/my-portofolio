/**
 * ============================================================
 * PORTFOLIO BACKEND — GOOGLE APPS SCRIPT (SINGLE FILE)
 * ============================================================
 * Salin SELURUH isi file ini ke Google Apps Script Editor.
 *
 * CARA SETUP:
 * 1. Buka https://script.google.com dan buat proyek baru.
 * 2. Hapus kode default, ganti dengan seluruh isi file ini.
 * 3. Klik "Run" → pilih fungsi "initDatabase" → Authorize.
 * 4. Deploy: Klik "Deploy" → "New deployment" → pilih tipe "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Salin URL deployment, isi ke NEXT_PUBLIC_GAS_BASE_URL di .env.local
 *
 * SCRIPT PROPERTIES (Project Settings → Script Properties):
 * - SPREADSHEET_ID  : ID Google Spreadsheet database
 * - MEDIA_FOLDER_ID : ID Google Drive folder untuk upload media
 * - JWT_SECRET      : Secret key untuk signing token (ganti!)
 * - ADMIN_USERNAME  : Username admin portal
 * - ADMIN_PASSWORD  : Password admin portal (ganti!)
 * ============================================================
 */

// ============================================================
// SECTION 1: CONFIGURATION
// ============================================================

var scriptProperties = PropertiesService.getScriptProperties();

var JWT_SECRET      = scriptProperties.getProperty('JWT_SECRET')      || 'portfolio-secret-key-ganti-ini';
var ADMIN_USERNAME  = scriptProperties.getProperty('ADMIN_USERNAME')  || 'admin';
var ADMIN_PASSWORD  = scriptProperties.getProperty('ADMIN_PASSWORD')  || 'admin123';
var SPREADSHEET_ID  = scriptProperties.getProperty('SPREADSHEET_ID')  || '';
var MEDIA_FOLDER_ID = scriptProperties.getProperty('MEDIA_FOLDER_ID') || '';

/** Mendapatkan instance Spreadsheet */
function getDatabase() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/** Mendapatkan folder media dari Google Drive */
function getMediaFolder() {
  if (!MEDIA_FOLDER_ID || MEDIA_FOLDER_ID.trim() === '') {
    throw new Error('MEDIA_FOLDER_ID belum diatur di Script Properties.');
  }
  return DriveApp.getFolderById(MEDIA_FOLDER_ID.trim());
}


// ============================================================
// SECTION 2: MAIN ENTRY POINTS (doGet & doPost)
// ============================================================

/**
 * HTTP GET — Operasi baca publik (tidak perlu auth)
 */
function doGet(e) {
  var action = e.parameter.action;
  try {
    if (!action) throw new Error("Parameter 'action' tidak disertakan.");
    var data;
    switch (action) {
      case 'get_all_data':
        data = {
          settings:     handleGetSettings(),
          skills:       handleGetSkills(),
          projects:     handleGetProjects(),
          experiences:  handleGetExperiences(),
          certificates: handleGetCertificates(),
          blogs:        handleGetBlogs(),
          testimonials: handleGetTestimonials()
        };
        break;
      case 'get_settings':     data = handleGetSettings(); break;
      case 'get_skills':       data = handleGetSkills(); break;
      case 'get_projects':     data = handleGetProjects(e.parameter.category); break;
      case 'get_project_by_slug': data = handleGetProjectBySlug(e.parameter.slug); break;
      case 'get_experiences':  data = handleGetExperiences(); break;
      case 'get_certificates': data = handleGetCertificates(); break;
      case 'get_blogs':        data = handleGetBlogs(); break;
      case 'get_blog_by_slug': data = handleGetBlogBySlug(e.parameter.slug); break;
      case 'get_testimonials': data = handleGetTestimonials(); break;
      default:
        throw new Error("Action GET '" + action + "' tidak dikenali.");
    }
    return jsonResponse(true, data, 'Berhasil.');
  } catch (err) {
    return jsonResponse(false, null, err.message);
  }
}

/**
 * HTTP POST — Operasi tulis (login publik; CRUD butuh auth token)
 */
function doPost(e) {
  var action = e.parameter.action;
  try {
    if (!action) throw new Error("Parameter 'action' tidak disertakan.");

    var payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (_) {
        // Jika JSON parse gagal, abaikan (payload tetap {})
      }
    }

    // ── LOGIN & SEND MESSAGE — tidak perlu token ──────────────────
    if (action === 'login') {
      var u = payload.username || '';
      var p = payload.password || '';
      if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
        var token    = generateToken(u);
        var expires  = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        return jsonResponse(true, { token: token, expiresAt: expires }, 'Login berhasil.');
      }
      throw new Error('Username atau password salah.');
    }

    if (action === 'send_message') {
      return jsonResponse(true, handleSendMessage(payload), 'Pesan terkirim.');
    }

    // ── CRUD — wajib token valid ──────────────────────────────────
    var rawToken = e.parameter.token || payload.token || '';
    validateToken(rawToken);

    var data;
    switch (action) {
      // Settings
      case 'upsert_setting':      data = handleUpsertSetting(payload); break;
      // Skills
      case 'create_skill':        data = handleCreateSkill(payload); break;
      case 'update_skill':        data = handleUpdateSkill(payload); break;
      case 'delete_skill':        data = handleDeleteSkill(payload.id); break;
      // Projects
      case 'create_project':      data = handleCreateProject(payload); break;
      case 'update_project':      data = handleUpdateProject(payload); break;
      case 'delete_project':      data = handleDeleteProject(payload.id); break;
      // Experiences
      case 'create_experience':   data = handleCreateExperience(payload); break;
      case 'update_experience':   data = handleUpdateExperience(payload); break;
      case 'delete_experience':   data = handleDeleteExperience(payload.id); break;
      // Certificates
      case 'create_certificate':  data = handleCreateCertificate(payload); break;
      case 'update_certificate':  data = handleUpdateCertificate(payload); break;
      case 'delete_certificate':  data = handleDeleteCertificate(payload.id); break;
      // Blogs
      case 'create_blog':         data = handleCreateBlog(payload); break;
      case 'update_blog':         data = handleUpdateBlog(payload); break;
      case 'delete_blog':         data = handleDeleteBlog(payload.id); break;
      // Testimonials
      case 'create_testimonial':  data = handleCreateTestimonial(payload); break;
      case 'update_testimonial':  data = handleUpdateTestimonial(payload); break;
      case 'delete_testimonial':  data = handleDeleteTestimonial(payload.id); break;
      // Messages
      case 'get_messages':        data = handleGetMessages(); break;
      case 'mark_message_read':   data = handleMarkMessageRead(payload.id); break;
      // Media
      case 'upload_file':         data = handleUploadFile(payload); break;

      default:
        throw new Error("Action POST '" + action + "' tidak didukung.");
    }
    return jsonResponse(true, data, 'Berhasil.');
  } catch (err) {
    return jsonResponse(false, null, err.message);
  }
}

/** Membangun JSON response dengan header CORS */
function jsonResponse(success, data, message) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify({
    success: success,
    data:    success ? (data !== undefined ? data : null) : null,
    message: success ? (message || 'OK') : null,
    error:   success ? null : (message || 'Terjadi kesalahan.')
  }));
  return output;
}


// ============================================================
// SECTION 3: AUTHENTICATION (JWT-like HMAC-SHA256)
// ============================================================

function generateToken(username) {
  var header  = { alg: 'HS256', typ: 'JWT' };
  var exp     = Date.now() + 24 * 60 * 60 * 1000;
  var payload = { user: username, exp: exp };
  var b64h    = b64Encode(JSON.stringify(header));
  var b64p    = b64Encode(JSON.stringify(payload));
  var sig     = hmacSha256(b64h + '.' + b64p, JWT_SECRET);
  return b64h + '.' + b64p + '.' + sig;
}

function validateToken(token) {
  if (!token) throw new Error('Akses ditolak: Token tidak disertakan.');
  if (token.indexOf('Bearer ') === 0) token = token.substring(7);
  var parts = token.split('.');
  if (parts.length !== 3) throw new Error('Akses ditolak: Format token tidak valid.');
  var expected = hmacSha256(parts[0] + '.' + parts[1], JWT_SECRET);
  if (parts[2] !== expected) throw new Error('Akses ditolak: Signature token tidak valid.');
  var decoded = JSON.parse(b64Decode(parts[1]));
  if (Date.now() > decoded.exp) throw new Error('Sesi login kedaluwarsa. Silakan login kembali.');
  return decoded;
}

function b64Encode(str) {
  return Utilities.base64EncodeWebSafe(Utilities.newBlob(str).getBytes()).replace(/=+$/, '');
}
function b64Decode(str) {
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(str)).getDataAsString();
}
function hmacSha256(input, secret) {
  var key = Utilities.newBlob(secret).getBytes();
  var sig = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, input, key);
  return Utilities.base64EncodeWebSafe(sig).replace(/=+$/, '');
}


// ============================================================
// SECTION 4: SPREADSHEET SERVICE (Generic CRUD)
// ============================================================

/** Membaca semua baris sheet sebagai array of objects */
function readAllRows(sheetName) {
  var db    = getDatabase();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    initDatabase();
    sheet = db.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan setelah inisialisasi.");
  }
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0];
  var results = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var h = headers[j];
      var v = row[j];
      if (v === true || v === 'TRUE')  { obj[h] = true; }
      else if (v === false || v === 'FALSE') { obj[h] = false; }
      else if (v instanceof Date)      { obj[h] = v.toISOString(); }
      else if (typeof v === 'string' && (h === 'techStack' || h === 'tags' || h === 'images' || h === 'highlights')) {
        obj[h] = v ? v.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
      }
      else { obj[h] = v; }
    }
    results.push(obj);
  }
  return results;
}

/** Menyisipkan baris baru */
function createRow(sheetName, payload) {
  var db    = getDatabase();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) { initDatabase(); sheet = db.getSheetByName(sheetName); }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var now     = new Date().toISOString();
  payload.id        = payload.id || (sheetName.slice(0, 3).toLowerCase() + '_' + Date.now());
  payload.createdAt = now;
  payload.updatedAt = now;
  var newRow = headers.map(function(h) {
    var v = payload[h];
    if (Array.isArray(v))  return v.join(', ');
    if (v === undefined || v === null) return '';
    return v;
  });
  sheet.appendRow(newRow);
  return payload;
}

/** Mengubah baris berdasarkan ID */
function updateRow(sheetName, id, payload) {
  var db    = getDatabase();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
  var values  = sheet.getDataRange().getValues();
  var headers = values[0];
  var rowIdx  = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) { rowIdx = i + 1; break; }
  }
  if (rowIdx === -1) throw new Error("Data ID '" + id + "' tidak ditemukan di " + sheetName + ".");
  payload.updatedAt = new Date().toISOString();
  var currentRow = values[rowIdx - 1];
  var updatedRow = headers.map(function(h, idx) {
    if (h === 'id')        return id;
    if (h === 'createdAt') return currentRow[headers.indexOf('createdAt')];
    var v = payload[h] !== undefined ? payload[h] : currentRow[idx];
    if (Array.isArray(v))  return v.join(', ');
    if (v === undefined || v === null) return '';
    return v;
  });
  sheet.getRange(rowIdx, 1, 1, headers.length).setValues([updatedRow]);
  var result = {};
  headers.forEach(function(h, i) { result[h] = updatedRow[i]; });
  return result;
}

/** Menghapus baris berdasarkan ID */
function deleteRow(sheetName, id) {
  var db    = getDatabase();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { deleted: true, id: id };
    }
  }
  throw new Error("Data ID '" + id + "' tidak ditemukan.");
}


// ============================================================
// SECTION 5: DATABASE INITIALIZATION & SCHEMA
// ============================================================

/**
 * Inisialisasi semua sheet database.
 * Jalankan MANUAL sekali dari editor GAS (tombol Run).
 */
function initDatabase() {
  var db = getDatabase();
  var schemas = {
    'Settings':     ['key', 'value', 'description', 'type', 'updatedAt'],
    'Skills':       ['id', 'name', 'category', 'level', 'percentage', 'iconUrl', 'order', 'createdAt', 'updatedAt'],
    'Projects':     ['id', 'title', 'slug', 'description', 'contentMarkdown', 'coverImage', 'images', 'techStack', 'projectUrl', 'githubUrl', 'figmaUrl', 'category', 'isGalleryOnly', 'status', 'featured', 'order', 'createdAt', 'updatedAt'],
    'Experiences':  ['id', 'title', 'organization', 'location', 'startDate', 'endDate', 'isCurrent', 'description', 'highlights', 'type', 'logoUrl', 'link', 'createdAt', 'updatedAt'],
    'Certificates': ['id', 'title', 'issuer', 'category', 'issueDate', 'expiryDate', 'credentialId', 'credentialUrl', 'imageUrl', 'description', 'status', 'featured', 'createdAt', 'updatedAt'],
    'Blogs':        ['id', 'title', 'slug', 'excerpt', 'contentMarkdown', 'coverImage', 'tags', 'category', 'status', 'views', 'readingTime', 'featured', 'createdAt', 'updatedAt'],
    'Testimonials': ['id', 'authorName', 'authorRole', 'authorOrganization', 'authorImageUrl', 'content', 'rating', 'relation', 'projectId', 'status', 'featured', 'createdAt', 'updatedAt'],
    'Messages':     ['id', 'senderName', 'senderEmail', 'subject', 'message', 'isRead', 'isReplied', 'ipAddress', 'createdAt']
  };

  for (var name in schemas) {
    var sheet    = db.getSheetByName(name);
    var isNew    = false;
    if (!sheet)               { sheet = db.insertSheet(name); isNew = true; }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schemas[name]);
      isNew = true;
    }
    if (isNew) insertDummyData(name, sheet);
  }
  Logger.log('Database berhasil diinisialisasi.');
}

function insertDummyData(sheetName, sheet) {
  var now = new Date().toISOString();
  var rows = [];
  if (sheetName === 'Settings') {
    rows = [
      ['site_name',    'Muhammad Bayu Nugroho', 'Nama pemilik', 'text', now],
      ['bio_title',    'Frontend Developer & UI Designer', 'Jabatan utama', 'text', now],
      ['resume_url',   '', 'Link CV PDF', 'url', now],
      ['contact_email','bayu@example.com', 'Email kontak', 'text', now]
    ];
  } else if (sheetName === 'Skills') {
    rows = [
      ['sk_' + Date.now() + '1', 'Next.js',    'Frontend', 'Expert',   95, '', 1, now, now],
      ['sk_' + Date.now() + '2', 'React.js',   'Frontend', 'Expert',   90, '', 2, now, now],
      ['sk_' + Date.now() + '3', 'TypeScript', 'Frontend', 'Advanced', 88, '', 3, now, now],
      ['sk_' + Date.now() + '4', 'Figma',      'Design',   'Advanced', 85, '', 4, now, now]
    ];
  } else if (sheetName === 'Projects') {
    rows = [
      ['pr_' + Date.now(), 'Portfolio Website', 'portfolio-website', 'Website portofolio interaktif berbasis Next.js.', '', '', '', 'Next.js, TypeScript, TailwindCSS', '', 'https://github.com', '', 'Web', false, 'Published', true, 1, now, now]
    ];
  } else if (sheetName === 'Experiences') {
    rows = [
      ['ex_' + Date.now(), 'Frontend Developer', 'Freelance', 'Remote', '2024-01-01', '', true, 'Membangun website klien menggunakan Next.js & React.', 'Delivered 10+ projects', 'Professional', '', '', now, now]
    ];
  } else if (sheetName === 'Certificates') {
    rows = [
      ['crt_' + Date.now(), 'Dicoding React Expert', 'Dicoding', 'Frontend', '2024-06-01', '', 'DICR-12345', '', '', 'Sertifikasi React tingkat lanjut', 'Active', true, now, now]
    ];
  } else if (sheetName === 'Blogs') {
    rows = [
      ['bl_' + Date.now(), 'Membangun Portfolio dengan Next.js', 'portfolio-nextjs', 'Panduan step-by-step.', '# Mulai\\n\\nInstal Next.js...', '', 'Next.js, React', 'Tech', 'Published', 0, 5, true, now, now]
    ];
  } else if (sheetName === 'Testimonials') {
    rows = [
      ['ts_' + Date.now(), 'Client A', 'CEO', 'Startup XYZ', '', 'Bayu adalah developer yang sangat profesional.', 5, 'Client', '', 'Published', true, now, now]
    ];
  } else if (sheetName === 'Messages') {
    rows = [
      ['msg_' + Date.now(), 'Test User', 'test@example.com', 'Halo', 'Ini pesan contoh.', false, false, '', now]
    ];
  }
  rows.forEach(function(r) { sheet.appendRow(r); });
}


// ============================================================
// SECTION 6: DATA CONTROLLERS
// ============================================================

// ── Settings ──────────────────────────────────────────────────────
function handleGetSettings() { return readAllRows('Settings'); }
function handleUpsertSetting(payload) {
  if (!payload.key) throw new Error('Key wajib disertakan.');
  var all    = handleGetSettings();
  var exists = all.some(function(s) { return s.key === payload.key; });
  return exists ? updateRow('Settings', payload.key, payload) : createRow('Settings', payload);
}

// ── Skills ────────────────────────────────────────────────────────
function handleGetSkills() { return readAllRows('Skills'); }
function handleCreateSkill(p) {
  if (!p.name || !p.category) throw new Error('Nama dan Kategori wajib diisi.');
  return createRow('Skills', p);
}
function handleUpdateSkill(p) {
  if (!p.id) throw new Error('ID skill wajib disertakan.');
  return updateRow('Skills', p.id, p);
}
function handleDeleteSkill(id) {
  if (!id) throw new Error('ID skill wajib disertakan.');
  return deleteRow('Skills', id);
}

// ── Projects ──────────────────────────────────────────────────────
function handleGetProjects(category) {
  var rows = readAllRows('Projects');
  return category ? rows.filter(function(p) { return p.category === category; }) : rows;
}
function handleGetProjectBySlug(slug) {
  if (!slug) throw new Error('Slug wajib disertakan.');
  var found = handleGetProjects().filter(function(p) { return p.slug === slug; })[0];
  if (!found) throw new Error("Proyek slug '" + slug + "' tidak ditemukan.");
  return found;
}
function handleCreateProject(p) {
  if (!p.title || !p.slug) throw new Error('Judul dan Slug wajib diisi.');
  var dup = handleGetProjects().some(function(x) { return x.slug === p.slug; });
  if (dup) throw new Error("Slug '" + p.slug + "' sudah digunakan.");
  return createRow('Projects', p);
}
function handleUpdateProject(p) {
  if (!p.id) throw new Error('ID proyek wajib disertakan.');
  return updateRow('Projects', p.id, p);
}
function handleDeleteProject(id) {
  if (!id) throw new Error('ID proyek wajib disertakan.');
  return deleteRow('Projects', id);
}

// ── Experiences ───────────────────────────────────────────────────
function handleGetExperiences() { return readAllRows('Experiences'); }
function handleCreateExperience(p) {
  if (!p.title || !p.organization || !p.type) throw new Error('Judul, Organisasi, dan Tipe wajib diisi.');
  return createRow('Experiences', p);
}
function handleUpdateExperience(p) {
  if (!p.id) throw new Error('ID pengalaman wajib disertakan.');
  return updateRow('Experiences', p.id, p);
}
function handleDeleteExperience(id) {
  if (!id) throw new Error('ID pengalaman wajib disertakan.');
  return deleteRow('Experiences', id);
}

// ── Certificates ──────────────────────────────────────────────────
function handleGetCertificates() { return readAllRows('Certificates'); }
function handleCreateCertificate(p) {
  if (!p.title || !p.issuer) throw new Error('Judul dan Penerbit wajib diisi.');
  return createRow('Certificates', p);
}
function handleUpdateCertificate(p) {
  if (!p.id) throw new Error('ID sertifikat wajib disertakan.');
  return updateRow('Certificates', p.id, p);
}
function handleDeleteCertificate(id) {
  if (!id) throw new Error('ID sertifikat wajib disertakan.');
  return deleteRow('Certificates', id);
}

// ── Blogs ─────────────────────────────────────────────────────────
function handleGetBlogs() { return readAllRows('Blogs'); }
function handleGetBlogBySlug(slug) {
  if (!slug) throw new Error('Slug wajib disertakan.');
  // Increment views
  var db    = getDatabase();
  var sheet = db.getSheetByName('Blogs');
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var slugIdx  = headers.indexOf('slug');
  var viewsIdx = headers.indexOf('views');
  for (var i = 1; i < values.length; i++) {
    if (values[i][slugIdx] === slug) {
      sheet.getRange(i + 1, viewsIdx + 1).setValue((Number(values[i][viewsIdx]) || 0) + 1);
      break;
    }
  }
  var found = handleGetBlogs().filter(function(b) { return b.slug === slug; })[0];
  if (!found) throw new Error("Blog slug '" + slug + "' tidak ditemukan.");
  return found;
}
function handleCreateBlog(p) {
  if (!p.title || !p.slug) throw new Error('Judul dan Slug wajib diisi.');
  var dup = handleGetBlogs().some(function(b) { return b.slug === p.slug; });
  if (dup) throw new Error("Slug '" + p.slug + "' sudah digunakan.");
  p.views = 0;
  return createRow('Blogs', p);
}
function handleUpdateBlog(p) {
  if (!p.id) throw new Error('ID blog wajib disertakan.');
  return updateRow('Blogs', p.id, p);
}
function handleDeleteBlog(id) {
  if (!id) throw new Error('ID blog wajib disertakan.');
  return deleteRow('Blogs', id);
}

// ── Testimonials ──────────────────────────────────────────────────
function handleGetTestimonials() { return readAllRows('Testimonials'); }
function handleCreateTestimonial(p) {
  if (!p.authorName || !p.content) throw new Error('Nama dan Konten wajib diisi.');
  return createRow('Testimonials', p);
}
function handleUpdateTestimonial(p) {
  if (!p.id) throw new Error('ID testimonial wajib disertakan.');
  return updateRow('Testimonials', p.id, p);
}
function handleDeleteTestimonial(id) {
  if (!id) throw new Error('ID testimonial wajib disertakan.');
  return deleteRow('Testimonials', id);
}

// ── Messages ──────────────────────────────────────────────────────
function handleSendMessage(p) {
  if (!p.senderName || !p.senderEmail || !p.message) {
    throw new Error('Nama, email, dan pesan wajib diisi.');
  }
  return createRow('Messages', {
    senderName:  p.senderName,
    senderEmail: p.senderEmail,
    subject:     p.subject || '(Tanpa Subjek)',
    message:     p.message,
    isRead:      false,
    isReplied:   false,
    ipAddress:   p.ipAddress || ''
  });
}
function handleGetMessages() { return readAllRows('Messages'); }
function handleMarkMessageRead(id) {
  if (!id) throw new Error('ID pesan wajib disertakan.');
  return updateRow('Messages', id, { isRead: true });
}


// ============================================================
// SECTION 7: MEDIA UPLOAD (Google Drive)
// ============================================================

function handleUploadFile(payload) {
  if (!payload.base64Content || !payload.filename || !payload.mimeType) {
    throw new Error('base64Content, filename, dan mimeType wajib disertakan.');
  }
  var parent = getMediaFolder();
  var folder = payload.subfolder ? getOrCreateSubfolder(parent, payload.subfolder) : parent;
  var bytes  = Utilities.base64Decode(payload.base64Content);
  var blob   = Utilities.newBlob(bytes, payload.mimeType, payload.filename);
  var file   = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var fileId = file.getId();
  return {
    fileId:      fileId,
    filename:    file.getName(),
    mimeType:    file.getMimeType(),
    size:        file.getSize(),
    url:         'https://lh3.googleusercontent.com/d/' + fileId,
    downloadUrl: 'https://drive.google.com/uc?id=' + fileId + '&export=download'
  };
}

function getOrCreateSubfolder(parent, path) {
  var current = parent;
  path.split('/').forEach(function(part) {
    if (!part.trim()) return;
    var iter = current.getFoldersByName(part.trim());
    current  = iter.hasNext() ? iter.next() : current.createFolder(part.trim());
  });
  return current;
}


// ============================================================
// SECTION 8: UTILITY — TEST CONNECTION
// ============================================================

/**
 * Jalankan fungsi ini dari editor GAS untuk tes koneksi.
 * Buka Execution Log untuk melihat hasilnya.
 */
function testConnection() {
  try {
    var db     = getDatabase();
    var sheets = db.getSheets().map(function(s) { return s.getName(); });
    Logger.log('✅ Koneksi berhasil. Sheet tersedia: ' + sheets.join(', '));
  } catch (e) {
    Logger.log('❌ Koneksi gagal: ' + e.message);
  }
}
