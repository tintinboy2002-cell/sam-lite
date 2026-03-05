const admin = require("firebase-admin");

let firebaseApp = null;

function initFirebase() {
  try {
    if (!process.env.FB_PROJECT_ID) {
      console.warn("Firebase not configured. Skipping initialization.");
      return null;
    }

    const serviceAccount = {
      type: process.env.FB_TYPE,
      project_id: process.env.FB_PROJECT_ID,
      private_key_id: process.env.FB_PRIVATE_KEY_ID,
      private_key: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FB_CLIENT_EMAIL,
      client_id: process.env.FB_CLIENT_ID,
      auth_uri: process.env.FB_AUTH_URI,
      token_uri: process.env.FB_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FB_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FB_UNIVERSE_DOMAIN
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log("Firebase initialized successfully");

    return firebaseApp;

  } catch (error) {
    console.error("Firebase initialization failed:", error.message);
    return null;
  }
}

initFirebase();

module.exports = admin;