var express = require("express");
var router = express.Router();
var announcementBl = require(__base + "/bl/announcementBl.js");
var errorWrap = require(__base + "/errormiddleware.js");
const multer = require("multer");
 
var authmiddleware = require("../middleware/authmiddleware");
const storage = multer.memoryStorage(); // Storing the image in memory for this example
const upload = multer({ storage: storage }).single("file");

//Announcement API start here
//get all announcement
router.get(
    "/get_announcement",
    authmiddleware.verify,
    errorWrap(async function (req, res, next) {
        let response = await announcementBl.getAllAnnouncement(req);
        if (response) {
            if (response.status != "error") {
                res.status(200).send(response);
            } else {
                res.status(400).send(response);
            }
        } else {
            res
                .status(400)
                .send({ status: "error", message: "Something went wrong..." });
        }
    })
);

//create or add Announcemnet
router.post(
    "/create_announcement",
    upload,
    authmiddleware.verify,
    errorWrap(async function (req, res, next) {
        let response = await announcementBl.addAnnouncement(req);
        if (response) {
            if (response.status !== "error") {
                res.status(200).send(response);
            } else {
                res.status(400).send(response);
            }
        } else {
            res
                .status(400)
                .send({ status: "error", message: "something went wrong..." });
        }
    })
);

//update Announcemnet
router.put(
    "/update_announcement",
    upload,
    authmiddleware.verify,
    errorWrap(async function (req, res, next) {
        let response = await announcementBl.updateAnnouncement(req);
        if (response) {
            if (response.status != "error") {
                res.status(200).send(response);
            } else {
                res.status(400).send(response);
            }
        } else {
            res
                .status(400)
                .send({ status: "error", message: "something went wrong......." });
        }
    })
);

//delete Announcement
router.delete(
    "/delete_announcement",
    authmiddleware.verify,
    errorWrap(async function (req, res, next) {
        let response = await announcementBl.deleteAnnouncement(req);
        if (response) {
            if (response.status != "error") {
                res.status(200).send(response);
            } else {
                res.status(400).send(response);
            }
        } else {
            res
                .status(400)
                .send({ status: "error", message: "something went wrong..." });
        }
    })
);

//download announcement file
router.get(
    "/download_announcment/:announcement_id",
    authmiddleware.verify,
    errorWrap(async function (req, res, next) {
        const response = await announcementBl.downloadAnnouncement(req);
        if (response && response.status === "success" && response.data) {
            const fileRecord = response.data;

            // Set headers for file download
            res.setHeader("Content-Disposition", `attachment; filename="${fileRecord.attachment_url || 'file.bin'}"`);
            res.setHeader("Content-Type", "application/octet-stream");

            // Send BLOB buffer
            res.send(fileRecord.attachment_buffer);
        } else {
            res.status(400).send(response || { status: "error", message: "Something went wrong..." });
        }
    })
);

//Announcement API End here

module.exports = router;
