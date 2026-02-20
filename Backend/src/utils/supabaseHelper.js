const { supabase } = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');

/**
 * Uploads a file buffer to the Supabase "user-files" bucket and returns a public URL.
 * @param {Buffer} buffer - file data
 * @param {string} mimeType - mime type of the file
 * @param {string} folder - optional folder path inside the bucket
 * @returns {string} publicUrl
 */
async function uploadFile(buffer, mimeType, folder = '') {
    const filename = folder ? `${folder}/${uuidv4()}` : uuidv4();

    const { data, error } = await supabase.storage
        .from('QuickServe_files')
        .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true
        });

    if (error) {
        throw error;
    }

    const { data: urlData } = supabase.storage.from('QuickServe_files').getPublicUrl(filename);
    return urlData.publicUrl;
}

module.exports = { uploadFile };