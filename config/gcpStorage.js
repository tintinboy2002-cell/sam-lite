const { Storage } = require("@google-cloud/storage");
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : "";
const bucketName = "sam_lite";

const storage = new Storage({
  credentials: credentialsJson,
});

const bucket = storage.bucket(bucketName);

module.exports = bucket;
