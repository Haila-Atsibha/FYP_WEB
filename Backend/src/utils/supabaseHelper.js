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
    const bucketName = process.env.SUPABASE_BUCKET || 'QuickServe_files';
    const filename = folder ? `${folder}/${uuidv4()}` : uuidv4();

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true
        });

    if (error) {
        console.error("Supabase Storage Error Details:", error);
        if (error.message?.includes("Bucket not found") || error.error === "Bucket not found") {
            throw new Error(`Storage configuration error: Bucket '${bucketName}' not found in Supabase. Please create it or check the name.`);
        }
        throw error;
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filename);
    return urlData.publicUrl;
}

/**
 * Generates a signed URL for a file path or an existing public URL.
 * @param {string} pathOrUrl 
 * @param {number} expiresIn - seconds
 * @returns {string} signedUrl
 */
async function getSignedUrl(pathOrUrl, expiresIn = 3600) {
    if (!pathOrUrl) return null;

    const bucketName = process.env.SUPABASE_BUCKET || 'QuickServe_files';
    let path = pathOrUrl;

    // If it's a full URL, extract the path after the bucket name
    if (pathOrUrl.startsWith('http')) {
        const parts = pathOrUrl.split(`/${bucketName}/`);
        if (parts.length > 1) {
            path = parts[1];
        }
    }

    const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, expiresIn);

    if (error) {
        console.error("Error creating signed URL:", error);
        return pathOrUrl; // fallback to original if signing fails
    }

    return data.signedUrl;
}

module.exports = { uploadFile, getSignedUrl };