/**
 * apps-script/Main.js
 * 
 * Entry point REST API utama untuk Google Apps Script (doGet & doPost).
 * Mengatur routing action dan CORS.
 */

/**
 * Menangani HTTP GET Request (Operasi Read Publik / Non-Secure)
 */
function doGet(e) {
  var action = e.parameter.action;
  var responseData;
  
  try {
    if (!action) {
      throw new Error("Parameter 'action' tidak ditentukan.");
    }
    
    switch (action) {
      case "get_all_data":
        responseData = {
          settings: handleGetSettings(),
          skills: handleGetSkills(),
          projects: handleGetProjects(),
          experiences: handleGetExperiences(),
          certificates: handleGetCertificates(),
          blogs: handleGetBlogs(),
          testimonials: handleGetTestimonials()
        };
        break;
      case "get_settings":
        responseData = handleGetSettings();
        break;
      case "get_skills":
        responseData = handleGetSkills();
        break;
      case "get_projects":
        responseData = handleGetProjects(e.parameter.category);
        break;
      case "get_project_by_slug":
        responseData = handleGetProjectBySlug(e.parameter.slug);
        break;
      case "get_experiences":
        responseData = handleGetExperiences();
        break;
      case "get_certificates":
        responseData = handleGetCertificates();
        break;
      case "get_blogs":
        responseData = handleGetBlogs();
        break;
      case "get_blog_by_slug":
        responseData = handleGetBlogBySlug(e.parameter.slug);
        break;
      case "get_testimonials":
        responseData = handleGetTestimonials();
        break;
      default:
        throw new Error("Action GET '" + action + "' tidak dikenal atau tidak diizinkan.");
    }
    
    return buildJsonResponse(true, responseData, "Operasi berhasil.");
  } catch (error) {
    return buildJsonResponse(false, null, error.message);
  }
}

/**
 * Menangani HTTP POST Request (Operasi Write / Secure CRUD / Upload / Login)
 */
function doPost(e) {
  var action = e.parameter.action;
  var responseData;
  
  try {
    if (!action) {
      throw new Error("Parameter 'action' tidak ditentukan.");
    }
    
    // Parse Payload JSON
    var payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    // ─────────────────────────────────────────────────────────────────
    // FLOW LOGIN & HUBUNGI KAMI (PUBLIK)
    // ─────────────────────────────────────────────────────────────────
    if (action === "login") {
      if (payload.username === ADMIN_USERNAME && payload.password === ADMIN_PASSWORD) {
        var token = generateToken(payload.username);
        var expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();
        return buildJsonResponse(true, { token: token, expiresAt: expiresAt }, "Login berhasil.");
      } else {
        throw new Error("Username atau password salah.");
      }
    }
    
    if (action === "send_message") {
      responseData = handleSendMessage(payload);
      return buildJsonResponse(true, responseData, "Pesan berhasil dikirim.");
    }
    
    // ─────────────────────────────────────────────────────────────────
    // MIDDLEWARE SECURE AUTHENTICATION UNTUK CRUD & MEDIA UPLOAD
    // ─────────────────────────────────────────────────────────────────
    var authHeader = e.parameter.token || payload.token;
    validateToken(authHeader);
    
    // ─────────────────────────────────────────────────────────────────
    // ROUTING OPERASI SECURE
    // ─────────────────────────────────────────────────────────────────
    switch (action) {
      // Settings CRUD
      case "upsert_setting":
        responseData = handleUpsertSetting(payload);
        break;
        
      // Skills CRUD
      case "create_skill":
        responseData = handleCreateSkill(payload);
        break;
      case "update_skill":
        responseData = handleUpdateSkill(payload);
        break;
      case "delete_skill":
        responseData = handleDeleteSkill(payload.id);
        break;
        
      // Projects CRUD
      case "create_project":
        responseData = handleCreateProject(payload);
        break;
      case "update_project":
        responseData = handleUpdateProject(payload);
        break;
      case "delete_project":
        responseData = handleDeleteProject(payload.id);
        break;
        
      // Experiences CRUD
      case "create_experience":
        responseData = handleCreateExperience(payload);
        break;
      case "update_experience":
        responseData = handleUpdateExperience(payload);
        break;
      case "delete_experience":
        responseData = handleDeleteExperience(payload.id);
        break;
        
      // Certificates CRUD
      case "create_certificate":
        responseData = handleCreateCertificate(payload);
        break;
      case "update_certificate":
        responseData = handleUpdateCertificate(payload);
        break;
      case "delete_certificate":
        responseData = handleDeleteCertificate(payload.id);
        break;
        
      // Blogs CRUD
      case "create_blog":
        responseData = handleCreateBlog(payload);
        break;
      case "update_blog":
        responseData = handleUpdateBlog(payload);
        break;
      case "delete_blog":
        responseData = handleDeleteBlog(payload.id);
        break;
        
      // Testimonials CRUD
      case "create_testimonial":
        responseData = handleCreateTestimonial(payload);
        break;
      case "update_testimonial":
        responseData = handleUpdateTestimonial(payload);
        break;
      case "delete_testimonial":
        responseData = handleDeleteTestimonial(payload.id);
        break;
        
      // Messages CRUD (Admin Access Only)
      case "get_messages":
        responseData = handleGetMessages();
        break;
      case "mark_message_read":
        responseData = handleMarkMessageRead(payload.id);
        break;
        
      // Media Upload CRUD
      case "upload_file":
        responseData = handleUploadFile(payload);
        break;
        
      default:
        throw new Error("Action POST '" + action + "' tidak didukung atau akses ditolak.");
    }
    
    return buildJsonResponse(true, responseData, "Operasi berhasil.");
  } catch (error) {
    return buildJsonResponse(false, null, error.message);
  }
}

/**
 * Helper untuk menyusun HTTP Response JSON + Header CORS
 */
function buildJsonResponse(success, data, message) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  var response = {
    success: success,
    data: data || null,
    message: success ? (message || "Operasi berhasil.") : null,
    error: success ? null : (message || "Terjadi kesalahan sistem.")
  };
  
  output.setContent(JSON.stringify(response));
  return output;
}
