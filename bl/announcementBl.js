var announcementDl = require(__base + "/dl/announcementDl.js");
const _ = require("lodash");
var validations = require(__base + "/validations/validation.js");
const admin = require(__base + "/firebase/firebase.js");
var authDl = require(__base + "/dl/authDl.js");

function obj() {
    //Announcement API start here
    //get all announcement
    this.getAllAnnouncement = async function (req, res) {
        let response = {};
        let announcement_data = await announcementDl.getAllAnnouncement();
        announcement_data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        if (!_.isEmpty(announcement_data)) {
            response["status"] = "success";
            response["data"] = announcement_data;
        } else {
            response["status"] = "error";
            response["message"] = "announcement not found";
        }
        return response;
    };

    //create or add Announcemnet
    this.addAnnouncement = async function (req) {
        console.log("req body from add announcement- ", req.body)
        let response = {};
        let validationRuleObj = {
            title: "required",
            message: "required"
        };
        let validationObj = req.body;
        let isValid = await validations.validate(validationObj, validationRuleObj);

        if (isValid) {
            let loggedInUser = authDl.getDecryptToken(req);
            // let user_id =loggedInUser.user_id
            let username = loggedInUser.user_name;
            let attachment_url = null;
            let attachment_buffer = null;
            // File upload handling
            if (req.file) {
                attachment_url = req.file.originalname;
                attachment_buffer = req.file.buffer;
            } else if (req.body && Buffer.isBuffer(req.body)) {
                attachment_url = req.headers['x-filename'] || 'unnamed.pdf';
                attachment_buffer = req.body;
            } else if (req.body.attachment_url) {
                attachment_url = req.body.filename || 'unnamed.pdf';
                attachment_buffer = Buffer.from(req.body.attachment, 'base64');
            }

            const obj = {
                title: req.body.title,
                message: req.body.message,
                attachment_url,
                attachment_buffer,
                start_date: req.body.start_date,
                end_date: req.body.end_date
            };

            // Save announcement
            const announcement = await announcementDl.addAnnouncement(username, obj);

            const FCM_MAX_LIMIT = 500;

            // Split array into chunks of max 500
            function chunkArray(array, size = FCM_MAX_LIMIT) {
                const chunked = [];
                for (let i = 0; i < array.length; i += size) {
                    chunked.push(array.slice(i, i + size));
                }
                return chunked;
            }

            // Fetch all tokens
            const findFcmToken = await announcementDl.findFcmToken();

            if (!_.isEmpty(findFcmToken)) {

                const allTokens = findFcmToken.map(u => u.fcm_token).filter(Boolean);

                if (allTokens.length > 0) {

                    // Automatically chunk ANY number of tokens (10,000 included)
                    const chunks = chunkArray(allTokens, FCM_MAX_LIMIT);

                    let totalSuccess = 0;
                    let totalFailure = 0;

                    console.log(`Sending ${allTokens.length} tokens in ${chunks.length} batches...`);

                    for (const tokenBatch of chunks) {

                        const messagePayload = {
                            notification: {
                                title: `📢 ${req.body.title}`,
                                body: String(obj.message),
                            },
                            data: {
                                type: 'announcement',
                                created_by: String(username),
                            },
                            tokens: tokenBatch,
                            priority: 'high',
                            content_available: true
                        };

                        try {
                            const fbResponse = await admin.messaging().sendEachForMulticast(messagePayload);

                            totalSuccess += fbResponse.successCount;
                            totalFailure += fbResponse.failureCount;

                        } catch (err) {
                            console.error(" Batch sending error:", err);
                        }
                    }

                    console.log(`FINAL RESULT → Success: ${totalSuccess}, Failed: ${totalFailure}`);

                } else {
                    console.log("No valid FCM tokens");
                }

            } else {
                console.log("No tokens found in DB");
            }
            if (!_.isEmpty(announcement)) {
                response.status = "success";
                response.message = "Announcement created and notifications sent successfully";
                response.data = announcement;
            } else {
                response.status = "error";
                response.message = "Failed to create Announcement";
            }
        } else {
            response["errors"] = global.errorMessage;
            let key = Object.keys(global.errorMessage).length > 0
                ? Object.keys(global.errorMessage)[0]
                : null;
            response["message"] = global.errorMessage[key]
                ? global.errorMessage[key].message
                : "Something went wrong";
            response["status"] = "error";
        }
        return response;
    };

    //update Announcemnet
    this.updateAnnouncement = async function (req, res) {
        let response = {};
        let validationRuleObj = {
            announcement_id: "required",
        };
        let validationObj = req.body;
        let isValid = await validations.validate(validationObj, validationRuleObj);

        if (isValid) {
            let loggedInUser = authDl.getDecryptToken(req);
            let created_by = loggedInUser.user_name;

            // --- File handling for updates ---
            let attachment_url = req.file?.originalname || req.body.attachment_url || null;
            let attachment_buffer = req.file?.buffer || null;

            let announcement_id = req.body.announcement_id
            // Build update object with file data if provided
            let updateData = { ...req.body, created_by };
            if (attachment_url) {
                updateData.attachment_url = attachment_url;
            }
            if (attachment_buffer) {
                updateData.attachment_buffer = attachment_buffer;
            }

            const updateAnnouncement = await announcementDl.updatedAnnouncement(announcement_id, updateData)

            const FCM_MAX_LIMIT = 500;

            // Split array into chunks of max 500
            function chunkArray(array, size = FCM_MAX_LIMIT) {
                const chunked = [];
                for (let i = 0; i < array.length; i += size) {
                    chunked.push(array.slice(i, i + size));
                }
                return chunked;
            }

            // Fetch all tokens
            const findFcmToken = await announcementDl.findFcmToken();

            if (!_.isEmpty(findFcmToken)) {

                const allTokens = findFcmToken.map(u => u.fcm_token).filter(Boolean);

                if (allTokens.length > 0) {

                    //Automatically chunk ANY number of tokens (10,000 included)
                    const chunks = chunkArray(allTokens, FCM_MAX_LIMIT);

                    let totalSuccess = 0;
                    let totalFailure = 0;

                    console.log(`Sending ${allTokens.length} tokens in ${chunks.length} batches...`);

                    for (const tokenBatch of chunks) {

                        const messagePayload = {
                            notification: {
                                title: `📢 ${req.body.title}`,
                                body: String(updateData.message),
                            },
                            data: {
                                type: 'announcement',
                                created_by: String(created_by),
                            },
                            tokens: tokenBatch,
                            priority: 'high',
                            content_available: true
                        };

                        try {
                            const fbResponse = await admin.messaging().sendEachForMulticast(messagePayload);

                            totalSuccess += fbResponse.successCount;
                            totalFailure += fbResponse.failureCount;

                        } catch (err) {
                            console.error(" Batch sending error:", err);
                        }
                    }
                    console.log(` FINAL RESULT → Success: ${totalSuccess}, Failed: ${totalFailure}`);
                } else {
                    console.log("No valid FCM tokens");
                }
            } else {
                console.log("No tokens found in DB");
            }

            if (!_.isEmpty(updateAnnouncement)) {
                response["status"] = "success";
                response["data"] = updateAnnouncement;
            } else {
                response["status"] = "error";
                response["message"] = "not updated Announcement";
            }
        }
        else {
            response["errors"] = global.errorMessage;
            let key =
                Object.keys(global.errorMessage).length > 0
                    ? Object.keys(global.errorMessage)[0]
                    : null;
            response["message"] = global.errorMessage[key]
                ? global.errorMessage[key].message
                : "Something went wrong";
            response["status"] = "error";
        }
        return response;
    };

    //delete Announcement
    this.deleteAnnouncement = async function (req, res) {
        let response = {};
        let validationRuleObj = {
            announcement_id: "required",
        };
        let validationObj = req.body;
        let isValid = await validations.validate(validationObj, validationRuleObj);

        if (isValid) {
            let obj = req.body;

            let deleteAnnouncement = await announcementDl.deleteAnnouncement(obj);

            if (!_.isEmpty(deleteAnnouncement)) {
                response["status"] = "success";
                response["data"] = deleteAnnouncement;
            } else {
                response["status"] = "error";
                response["message"] = "No data deleted or record not found";
            }
        }
        else {
            response["errors"] = global.errorMessage;
            let key =
                Object.keys(global.errorMessage).length > 0
                    ? Object.keys(global.errorMessage)[0]
                    : null;
            response["message"] = global.errorMessage[key]
                ? global.errorMessage[key].message
                : "Something went wrong";
            response["status"] = "error";
        }
        return response;
    };

    //download announcement file
    this.downloadAnnouncement = async function (req, res) {
        let response = {};

        let validationRuleObj = {
            announcement_id: "required",
        };
        let validationObj = req.params;
        let isValid = await validations.validate(validationObj, validationRuleObj);

        if (isValid) {
            let obj = req.params;

            let downloadAnnouncement = await announcementDl.downloadAnnouncement(obj);

            if (!_.isEmpty(downloadAnnouncement)) {
                response["status"] = "success";
                response["data"] = downloadAnnouncement;
            } else {
                response["status"] = "error";
                response["message"] = "record not found";
            }
        }
        else {
            response["errors"] = global.errorMessage;
            let key =
                Object.keys(global.errorMessage).length > 0
                    ? Object.keys(global.errorMessage)[0]
                    : null;
            response["message"] = global.errorMessage[key]
                ? global.errorMessage[key].message
                : "Something went wrong";
            response["status"] = "error";
        }
        return response;
    };
    //Announcement API End here

}
var self = (module.exports = new obj());