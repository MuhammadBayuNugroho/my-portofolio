/**
 * apps-script/ControllerData.js
 * 
 * Handler API spesifik untuk modul database (Settings, Skills, Projects, Experiences, Certificates, Blogs, Testimonials).
 */

// ─────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────
function handleGetSettings() {
  return readAllRows("Settings");
}

function handleUpsertSetting(payload) {
  if (!payload.key) throw new Error("Key wajib disertakan.");
  
  var settings = handleGetSettings();
  var exists = settings.some(function(s) { return s.key === payload.key; });
  
  if (exists) {
    return updateRow("Settings", payload.key, payload);
  } else {
    return createRow("Settings", payload);
  }
}

// ─────────────────────────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────────────────────────
function handleGetSkills() {
  return readAllRows("Skills");
}

function handleCreateSkill(payload) {
  if (!payload.name || !payload.category) throw new Error("Nama dan Kategori skill wajib diisi.");
  return createRow("Skills", payload);
}

function handleUpdateSkill(payload) {
  if (!payload.id) throw new Error("ID skill wajib disertakan.");
  return updateRow("Skills", payload.id, payload);
}

function handleDeleteSkill(id) {
  if (!id) throw new Error("ID skill wajib disertakan.");
  return deleteRow("Skills", id);
}

// ─────────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────────
function handleGetProjects(category) {
  var projects = readAllRows("Projects");
  if (category) {
    return projects.filter(function(p) { return p.category === category; });
  }
  return projects;
}

function handleGetProjectBySlug(slug) {
  if (!slug) throw new Error("Slug proyek wajib disertakan.");
  var projects = handleGetProjects();
  for (var i = 0; i < projects.length; i++) {
    if (projects[i].slug === slug) return projects[i];
  }
  throw new Error("Proyek dengan slug '" + slug + "' tidak ditemukan.");
}

function handleCreateProject(payload) {
  if (!payload.title || !payload.slug) throw new Error("Judul dan Slug proyek wajib diisi.");
  
  // Validasi slug unik
  var projects = handleGetProjects();
  var exists = projects.some(function(p) { return p.slug === payload.slug; });
  if (exists) throw new Error("Slug '" + payload.slug + "' sudah digunakan oleh proyek lain.");
  
  return createRow("Projects", payload);
}

function handleUpdateProject(payload) {
  if (!payload.id) throw new Error("ID proyek wajib disertakan.");
  return updateRow("Projects", payload.id, payload);
}

function handleDeleteProject(id) {
  if (!id) throw new Error("ID proyek wajib disertakan.");
  return deleteRow("Projects", id);
}

// ─────────────────────────────────────────────────────────────────
// EXPERIENCES
// ─────────────────────────────────────────────────────────────────
function handleGetExperiences() {
  return readAllRows("Experiences");
}

function handleCreateExperience(payload) {
  if (!payload.title || !payload.organization || !payload.type) {
    throw new Error("Judul, Organisasi, dan Tipe pengalaman wajib diisi.");
  }
  return createRow("Experiences", payload);
}

function handleUpdateExperience(payload) {
  if (!payload.id) throw new Error("ID pengalaman wajib disertakan.");
  return updateRow("Experiences", payload.id, payload);
}

function handleDeleteExperience(id) {
  if (!id) throw new Error("ID pengalaman wajib disertakan.");
  return deleteRow("Experiences", id);
}

// ─────────────────────────────────────────────────────────────────
// CERTIFICATES
// ─────────────────────────────────────────────────────────────────
function handleGetCertificates() {
  return readAllRows("Certificates");
}

function handleCreateCertificate(payload) {
  if (!payload.title || !payload.issuer) throw new Error("Judul dan Penerbit sertifikat wajib diisi.");
  return createRow("Certificates", payload);
}

function handleUpdateCertificate(payload) {
  if (!payload.id) throw new Error("ID sertifikat wajib disertakan.");
  return updateRow("Certificates", payload.id, payload);
}

function handleDeleteCertificate(id) {
  if (!id) throw new Error("ID sertifikat wajib disertakan.");
  return deleteRow("Certificates", id);
}

// ─────────────────────────────────────────────────────────────────
// BLOGS
// ─────────────────────────────────────────────────────────────────
function handleGetBlogs() {
  return readAllRows("Blogs");
}

function handleGetBlogBySlug(slug) {
  if (!slug) throw new Error("Slug blog wajib disertakan.");
  
  var db = getDatabase();
  var sheet = db.getSheetByName("Blogs");
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var slugColIndex = headers.indexOf("slug");
  var viewsColIndex = headers.indexOf("views");
  
  if (slugColIndex === -1 || viewsColIndex === -1) {
    throw new Error("Struktur kolom Blogs tidak sesuai standar.");
  }
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][slugColIndex] === slug) {
      var currentViews = Number(values[i][viewsColIndex]) || 0;
      var newViews = currentViews + 1;
      
      // Update views secara langsung ke cell spreadsheet
      sheet.getRange(i + 1, viewsColIndex + 1).setValue(newViews);
      
      // Ambil ulang data terupdate
      var blogs = handleGetBlogs();
      return blogs.filter(function(b) { return b.slug === slug; })[0];
    }
  }
  
  throw new Error("Artikel blog dengan slug '" + slug + "' tidak ditemukan.");
}

function handleCreateBlog(payload) {
  if (!payload.title || !payload.slug) throw new Error("Judul dan Slug blog wajib diisi.");
  
  // Validasi slug unik
  var blogs = handleGetBlogs();
  var exists = blogs.some(function(b) { return b.slug === payload.slug; });
  if (exists) throw new Error("Slug '" + payload.slug + "' sudah digunakan oleh artikel lain.");
  
  payload.views = 0;
  return createRow("Blogs", payload);
}

function handleUpdateBlog(payload) {
  if (!payload.id) throw new Error("ID blog wajib disertakan.");
  return updateRow("Blogs", payload.id, payload);
}

function handleDeleteBlog(id) {
  if (!id) throw new Error("ID blog wajib disertakan.");
  return deleteRow("Blogs", id);
}

// ─────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────────
function handleGetTestimonials() {
  return readAllRows("Testimonials");
}

function handleCreateTestimonial(payload) {
  if (!payload.authorName || !payload.content) throw new Error("Nama Pengarang dan Konten testimonial wajib diisi.");
  return createRow("Testimonials", payload);
}

function handleUpdateTestimonial(payload) {
  if (!payload.id) throw new Error("ID testimonial wajib disertakan.");
  return updateRow("Testimonials", payload.id, payload);
}

function handleDeleteTestimonial(id) {
  if (!id) throw new Error("ID testimonial wajib disertakan.");
  return deleteRow("Testimonials", id);
}
