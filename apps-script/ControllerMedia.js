/**
 * apps-script/ControllerMedia.js
 * 
 * Handler khusus untuk upload berkas ke Google Drive dan penyediaan URL publik.
 */

/**
 * Menangani upload file base64 dari admin dashboard
 * @param {object} payload 
 * @returns {object} metadata file terupload dan URL publik
 */
function handleUploadFile(payload) {
  if (!payload.base64Content || !payload.filename || !payload.mimeType) {
    throw new Error("Konten base64, nama file, dan tipe MIME wajib disertakan.");
  }
  
  var parentFolder = getMediaFolder();
  var targetFolder = parentFolder;
  
  // Jika ditentukan folder tujuan, telusuri/buat foldernya
  if (payload.subfolder) {
    targetFolder = getOrCreateSubfolder(parentFolder, payload.subfolder);
  }
  
  // Decode base64 content
  var decodedBytes = Utilities.base64Decode(payload.base64Content);
  var blob = Utilities.newBlob(decodedBytes, payload.mimeType, payload.filename);
  
  // Simpan file ke Drive
  var file = targetFolder.createFile(blob);
  
  // Berikan hak akses publik: "Anyone with the link can view"
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileId = file.getId();
  
  // Format URL direct link performa tinggi dari Google Photos CDN infra
  var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
  
  return {
    fileId: fileId,
    filename: file.getName(),
    mimeType: file.getMimeType(),
    size: file.getSize(),
    url: directUrl,
    downloadUrl: file.getDownloadUrl()
  };
}

/**
 * Helper untuk membuat atau menelusuri folder secara rekursif
 * @param {Folder} parent 
 * @param {string} path (misal "projects/cover")
 * @returns {Folder}
 */
function getOrCreateSubfolder(parent, path) {
  var parts = path.split('/');
  var currentFolder = parent;
  
  for (var i = 0; i < parts.length; i++) {
    var folderName = parts[i].trim();
    if (!folderName) continue;
    
    var subFolders = currentFolder.getFoldersByName(folderName);
    if (subFolders.hasNext()) {
      currentFolder = subFolders.next();
    } else {
      currentFolder = currentFolder.createFolder(folderName);
    }
  }
  
  return currentFolder;
}
