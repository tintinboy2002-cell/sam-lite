var mysqlConnection = require(__base + "/mysqlClient.js");
var bluebird = require("bluebird");
var db = bluebird.promisifyAll(mysqlConnection.getMySqlConnectionPool());
const { Storage } = require("@google-cloud/storage");

function doQuery(query) {
  return new bluebird(function (resolve, reject) {
    query = query.replace("undefined", "null");
    db.queryAsync(
      {
        sql: query,
      },
      function (err, data) {
        if (err) {
          global.sqlMessage = err.sqlMessage;
          return resolve(err);
        } else {
          return resolve(data);
        }
      }
    );
  });
}

function doQueryParams(query, bindParams = []) {
  return new bluebird(function (resolve, reject) {
    db.queryAsync(
      {
        sql: query,
        values: bindParams,
      },
      function (err, data) {
        return err ? reject(err) : resolve(data);
      }
    );
  });
}

// function Gcpstorage(data, reqBody) {
//   const credentialsJson = JSON.parse(
//     process.env.GOOGLE_APPLICATION_CREDENTIALS
//   );

//   const storage = new Storage({
//     credentials: credentialsJson,
//   });

//   const bucketName = "sam_lite";
//   const file = reqBody.file;
//   const filename = reqBody.file.originalname;

//   const allowedTypes = ["image/jpeg", "image/png"];
//   if (!allowedTypes.includes(file.mimetype)) {
//     throw new Error("Only JPG and PNG files are allowed");
//   }
//   const filePath = `ProfilePictures/Org${data.org_id}/${data.user_id}${filename}`;
//   const bucket = storage.bucket(bucketName);

//   return new Promise((resolve, reject) => {
//     const fileUpload = bucket.file(filePath);
//     const writeStream = fileUpload.createWriteStream({
//       metadata: {
//         contentType: file.mimetype,
//       },
//     });

//     writeStream.on("finish", () => {
//       const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
//       resolve(publicUrl);
//     });

//     writeStream.on("error", (err) => {
//       reject(err);
//     });
//     writeStream.end(file.buffer);
//   });
// }

function storeDataToGCP(data, reqBody) {
  const credentialsJson = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  const storage = new Storage({
    credentials: credentialsJson,
  });

  const bucketName = "sam_lite";
  const file = reqBody.file;
  const filename = reqBody.file.originalname;

  let filePath;
  if (data.org_id && data.user_id) {
    filePath = `ProfilePictures/Org${data.org_id}/${data.user_id}${filename}`;
  } else if (data.org_id) {
    filePath = `organizationlogo/org${data.org_id}/${filename}`;
  } else {
    throw new Error("Missing organization or user information.");
  }

  const bucket = storage.bucket(bucketName);

  return new Promise((resolve, reject) => {
    const fileUpload = bucket.file(filePath);
    const writeStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    writeStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
      resolve(publicUrl);
    });

    writeStream.on("error", (err) => {
      reject(err);
    });
    writeStream.end(file.buffer);
  });
}




function storeDocumentToGCP(data, file) {
  console.log("storeDocumentToGCP called with data:", data);
  const credentialsJson = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  const storage = new Storage({
    credentials: credentialsJson,
  });

  const bucketName = 'sam_lite';
  const bucket = storage.bucket(bucketName);

  const orgId = data.org_id;
  const userId = data.user_id;
  const idType = data.filetype;

  // Format today's date as YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${yyyy}-${mm}-${dd}`;

  // Normalize file name with date AFTER document name
  let normalizedName = '';
  if (idType === 'Aadhaar Card') {
    normalizedName = `aadhaar_card_${formattedDate}.pdf`;
  } else if (idType === 'Pan Card') {
    normalizedName = `pan_card_${formattedDate}.pdf`;
  } else {
    normalizedName = `document_${formattedDate}_${file.originalname}`;
  }

  // Construct folder path
  const filePath = `documents/org_${orgId}/user_${userId}/${normalizedName}`;
  const fileUpload = bucket.file(filePath);

  return new Promise((resolve, reject) => {
    const writeStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    writeStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
      resolve(publicUrl);
    });

    writeStream.on('error', reject);
    writeStream.end(file.buffer);
  });
}


//storing eduction document in GCP
function storeEductionDocumentToGCP(data, file) {
  const credentialsJson = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  const storage = new Storage({
    credentials: credentialsJson,
  });

  const bucketName = 'sam_lite';
  const bucket = storage.bucket(bucketName);
  const orgId = data.org_id;
  const userId = data.user_id;
  const originalfilename = data.Docname;
  const orgName=data.orgName

  // Format today's date as YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const hh = String(today.getHours()).padStart(2, '0');
  const min = String(today.getMinutes()).padStart(2, '0');
  const ss = String(today.getSeconds()).padStart(2, '0');

  const formattedDateTime = `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`;
  let normalizedName = `${originalfilename}_${formattedDateTime}.pdf`;

  // Construct folder path
  const filePath = `EducationDocuments/${orgName}_${orgId}/user_${userId}/${normalizedName}`;
  const fileUpload = bucket.file(filePath);
  return new Promise((resolve, reject) => {
    const writeStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    writeStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
      resolve(publicUrl);
    });

    writeStream.on('error', reject);
    writeStream.end(file.buffer);
  });
}


async function deleteDocumentFromGCP(fileUrl) {
  console.log("deleteDocumentFromGCP called with URL:", fileUrl);
  const credentialsJson = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  const storage = new Storage({
    credentials: credentialsJson,
  });

  const bucketName = 'sam_lite';
  const bucket = storage.bucket(bucketName);

  // Extract relative path from full URL
  const filePath = fileUrl.split(`https://storage.googleapis.com/${bucketName}/`)[1];

  if (!filePath) {
    console.error("Invalid file URL, unable to extract path:", fileUrl);
    return false;
  }

  const file = bucket.file(filePath);

  return file.delete()
    .then(() => {
      console.log(`File ${filePath} deleted successfully.`);
      return true;
    })
    .catch((err) => {
      console.error(`Failed to delete file ${filePath}:`, err);
      return false;
    });
}





module.exports = {
  doQuery: doQuery,
  doQueryParams: doQueryParams,
  storeDataToGCP: storeDataToGCP,
  storeDocumentToGCP: storeDocumentToGCP,
  storeEductionDocumentToGCP: storeEductionDocumentToGCP,
  deleteDocumentFromGCP: deleteDocumentFromGCP,
};
