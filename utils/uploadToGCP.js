const bucket = require("../config/gcpStorage");

module.exports = async (file) => {
  return new Promise((resolve, reject) => {
    const currentYear = new Date().getFullYear();
    const fileName = `HolidayImages/${currentYear}/${file.originalname}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({ 
      resumable: false,
      contentType: file.mimetype,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    blobStream.on("error", (err) => reject(err));

    blobStream.on("finish", async () => {
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};
