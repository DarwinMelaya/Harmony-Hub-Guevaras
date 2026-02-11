const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

/**
 * Upload base64 image to Supabase Storage
 * @param {String} base64Image - Base64 encoded image string
 * @param {String} folder - Folder name in storage bucket (e.g., 'inventory', 'packages')
 * @returns {Promise<Object>} - { success: boolean, url?: string, error?: string }
 */
async function uploadImageToSupabase(base64Image, folder = "images") {
  try {
    // Validate base64 string
    if (!base64Image) {
      return { success: false, error: "No image provided" };
    }

    // Extract base64 data and mime type
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { success: false, error: "Invalid base64 image format" };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const extension = mimeType.split("/")[1] || "jpg";
    const filename = `${uuidv4()}.${extension}`;
    const filePath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("harmony-hub") // Bucket name
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("harmony-hub").getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Image upload error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete image from Supabase Storage
 * @param {String} imageUrl - Full URL of the image
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
async function deleteImageFromSupabase(imageUrl) {
  try {
    if (!imageUrl) {
      return { success: false, error: "No image URL provided" };
    }

    // Extract file path from URL
    // Supabase URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = imageUrl.split("/storage/v1/object/public/");
    if (urlParts.length !== 2) {
      console.warn("Invalid Supabase URL format:", imageUrl);
      return { success: false, error: "Invalid Supabase URL format" };
    }

    const pathWithoutBucket = urlParts[1];
    const pathParts = pathWithoutBucket.split("/");
    const bucket = pathParts[0];
    const filePath = pathParts.slice(1).join("/");

    // Delete from Supabase Storage
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Image delete error:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  uploadImageToSupabase,
  deleteImageFromSupabase,
};
