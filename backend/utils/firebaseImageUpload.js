const { bucket } = require("../config/firebase");
const crypto = require("crypto");

/**
 * Upload base64 image to Firebase Storage
 * @param {string} base64String - The base64 encoded image string (with or without data:image prefix)
 * @param {string} folder - The folder path in Firebase Storage (e.g., "inventory")
 * @returns {Promise<string>} - The public download URL of the uploaded image
 */
exports.uploadImageToFirebase = async (base64String, folder = "inventory") => {
  try {
    // Check if bucket is initialized
    if (!bucket) {
      throw new Error("Firebase Storage bucket is not initialized. Check your .env configuration.");
    }

    // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64String.includes("base64,")
      ? base64String.split("base64,")[1]
      : base64String;

    // Extract image type from base64 string
    let contentType = "image/jpeg"; // default
    if (base64String.includes("data:image/")) {
      const matches = base64String.match(/data:image\/([a-zA-Z]*);base64,/);
      if (matches && matches[1]) {
        contentType = `image/${matches[1]}`;
      }
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const filename = `${folder}/${crypto.randomUUID()}.${contentType.split("/")[1]}`;

    // Create a file reference in the bucket
    const file = bucket.file(filename);

    // Upload the image
    await file.save(imageBuffer, {
      metadata: {
        contentType,
        metadata: {
          firebaseStorageDownloadTokens: crypto.randomUUID(), // Required for public access
        },
      },
      public: true, // Make the file publicly accessible
    });

    // Make the file public and get the URL
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    console.log(`✅ Image uploaded successfully: ${filename}`);
    return publicUrl;
  } catch (error) {
    console.error("Firebase Image Upload Error:", error);
    console.error("Error details:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    throw new Error(`Failed to upload image to Firebase Storage: ${error.message}`);
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - The public URL of the image to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
exports.deleteImageFromFirebase = async (imageUrl) => {
  try {
    if (!imageUrl) return false;

    // Extract the file path from the URL
    // URL format: https://storage.googleapis.com/bucket-name/path/to/file.jpg
    const urlParts = imageUrl.split(`${bucket.name}/`);
    if (urlParts.length < 2) {
      console.warn("Invalid Firebase Storage URL format");
      return false;
    }

    const filePath = decodeURIComponent(urlParts[1]);

    // Delete the file
    await bucket.file(filePath).delete();
    console.log(`✅ Deleted image: ${filePath}`);
    return true;
  } catch (error) {
    // Don't throw error if file doesn't exist
    if (error.code === 404) {
      console.warn("Image file not found in Firebase Storage");
      return false;
    }
    console.error("Firebase Image Delete Error:", error);
    return false;
  }
};

/**
 * Replace existing image with new image
 * @param {string} oldImageUrl - The URL of the old image to delete
 * @param {string} newBase64String - The new base64 image to upload
 * @param {string} folder - The folder path in Firebase Storage
 * @returns {Promise<string>} - The URL of the newly uploaded image
 */
exports.replaceImageInFirebase = async (
  oldImageUrl,
  newBase64String,
  folder = "inventory"
) => {
  try {
    // Upload new image first
    const newImageUrl = await exports.uploadImageToFirebase(
      newBase64String,
      folder
    );

    // Delete old image (don't fail if it doesn't exist)
    if (oldImageUrl) {
      await exports.deleteImageFromFirebase(oldImageUrl);
    }

    return newImageUrl;
  } catch (error) {
    console.error("Firebase Image Replace Error:", error);
    throw error;
  }
};
