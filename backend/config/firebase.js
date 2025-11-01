const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// Make sure to add your Firebase service account key to .env
let serviceAccount;
let bucket = null;

try {
  // You can either use a JSON file or environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse from environment variable (recommended for production)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Or use a service account key file (for development)
    // Download from Firebase Console > Project Settings > Service Accounts
    serviceAccount = require("./serviceAccountKey.json");
  }

  // Check if storage bucket is configured
  if (!process.env.FIREBASE_STORAGE_BUCKET) {
    console.error("❌ FIREBASE_STORAGE_BUCKET is not set in .env file");
    console.log("⚠️  Add this to your .env file:");
    console.log(`   FIREBASE_STORAGE_BUCKET=${serviceAccount.project_id}.appspot.com`);
    throw new Error("Missing FIREBASE_STORAGE_BUCKET in .env");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // e.g., "your-app.appspot.com"
  });

  bucket = admin.storage().bucket();
  console.log("✅ Firebase Admin initialized successfully");
  console.log(`📦 Storage Bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error.message);
  console.log("⚠️  Make sure to set up Firebase credentials in your .env file");
}

module.exports = { admin, bucket };
