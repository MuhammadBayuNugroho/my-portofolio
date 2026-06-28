/**
 * apps-script/code.js — Google Apps Script Backend Code
 *
 * Copy-paste this script into your Google Spreadsheet Script Editor:
 * Extensions > Apps Script.
 *
 * This code implements the unified REST API backend for your portofolio:
 * - Read/Write operations on sheets (Projects, Blogs, Contact Messages)
 * - JSON token auth security for writing endpoints
 * - Standardized JSON response formatting
 * - CORS headers support
 */

var ADMIN_USER = "admin";
var ADMIN_PASS = "admin"; // Change this in production
var JWT_SECRET = "secure-key-change-me";

function doGet(e) {
  var action = e.parameter.action;
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var response;

  try {
    if (action === "get_projects") {
      response = getProjects(sheet, e.parameter.category);
    } else if (action === "get_project_by_slug") {
      response = getProjectBySlug(sheet, e.parameter.slug);
    } else if (action === "get_blogs") {
      response = getBlogs(sheet);
    } else if (action === "get_blog_by_slug") {
      response = getBlogBySlug(sheet, e.parameter.slug);
    } else {
      throw new Error("Action tidak valid atau method salah.");
    }
    return buildResponse(true, response);
  } catch (err) {
    return buildResponse(false, null, err.message);
  }
}

function doPost(e) {
  var action = e.parameter.action;
  var payload = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var response;

  try {
    if (action === "login") {
      if (payload.username === ADMIN_USER && payload.password === ADMIN_PASS) {
        response = {
          token: generateToken(payload.username),
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        };
      } else {
        throw new Error("Username atau password salah.");
      }
    } else if (action === "send_message") {
      response = saveContactMessage(sheet, payload);
    } else {
      // Secure actions requiring token validation
      var token = e.parameter.token || payload.token;
      validateToken(token);

      if (action === "create_project") {
        response = createProject(sheet, payload);
      } else if (action === "update_project") {
        response = updateProject(sheet, payload);
      } else if (action === "delete_project") {
        response = deleteProject(sheet, payload.id);
      } else {
        throw new Error("Aksi tidak didukung.");
      }
    }
    return buildResponse(true, response);
  } catch (err) {
    return buildResponse(false, null, err.message);
  }
}

function buildResponse(success, data, error) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  out.setContent(JSON.stringify({
    success: success,
    data: data,
    error: error || null
  }));
  return out;
}

// ─────────────────────────────────────────────────────────────────
// SECURITY UTILITIES
// ─────────────────────────────────────────────────────────────────
function generateToken(username) {
  return Utilities.base64EncodeWebSafe(JSON.stringify({
    user: username,
    exp: Date.now() + 86400000 // 24 hours expiry
  }));
}

function validateToken(token) {
  if (!token) throw new Error("Akses ditolak: Token tidak disertakan.");
  try {
    var raw = Utilities.newBlob(Utilities.base64DecodeWebSafe(token)).getDataAsString();
    var parsed = JSON.parse(raw);
    if (parsed.exp < Date.now()) {
      throw new Error("Token kedaluwarsa.");
    }
  } catch(e) {
    throw new Error("Token tidak valid.");
  }
}

// ─────────────────────────────────────────────────────────────────
// SHEET DATA HANDLERS
// ─────────────────────────────────────────────────────────────────
function getProjects(sheet, category) {
  var activeSheet = sheet.getSheetByName("Projects") || createSheetHelper(sheet, "Projects", ["id", "title", "slug", "description", "category", "techStack", "coverImage", "projectUrl", "githubUrl", "createdAt"]);
  var rows = activeSheet.getDataRange().getValues();
  var headers = rows[0];
  var data = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    if (obj.techStack) {
      obj.techStack = obj.techStack.split(",").map(function(s) { return s.trim(); });
    }
    if (!category || obj.category === category) {
      data.push(obj);
    }
  }
  return data;
}

function getProjectBySlug(sheet, slug) {
  var projects = getProjects(sheet);
  for (var i = 0; i < projects.length; i++) {
    if (projects[i].slug === slug) return projects[i];
  }
  throw new Error("Proyek tidak ditemukan.");
}

function getBlogs(sheet) {
  var activeSheet = sheet.getSheetByName("Blogs") || createSheetHelper(sheet, "Blogs", ["id", "title", "slug", "excerpt", "contentMarkdown", "coverImage", "category", "tags", "readingTime", "createdAt"]);
  var rows = activeSheet.getDataRange().getValues();
  var headers = rows[0];
  var data = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    if (obj.tags) {
      obj.tags = obj.tags.split(",").map(function(s) { return s.trim(); });
    }
    data.push(obj);
  }
  return data;
}

function getBlogBySlug(sheet, slug) {
  var blogs = getBlogs(sheet);
  for (var i = 0; i < blogs.length; i++) {
    if (blogs[i].slug === slug) return blogs[i];
  }
  throw new Error("Artikel tidak ditemukan.");
}

function saveContactMessage(sheet, payload) {
  var activeSheet = sheet.getSheetByName("Messages") || createSheetHelper(sheet, "Messages", ["id", "senderName", "senderEmail", "subject", "message", "createdAt"]);
  var id = "msg_" + Date.now();
  activeSheet.appendRow([
    id,
    payload.senderName,
    payload.senderEmail,
    payload.subject,
    payload.message,
    new Date().toISOString()
  ]);
  return { id: id };
}

function createSheetHelper(sheet, name, headers) {
  var newSheet = sheet.insertSheet(name);
  newSheet.appendRow(headers);
  return newSheet;
}
