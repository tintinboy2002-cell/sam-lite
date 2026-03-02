var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var NubaxPortalBl = require(__base + "/bl/nubaxPortalBl.js");
const multer = require("multer");

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});


//api Endpoint to handle sending notification emails
router.post(
    "/send-contact-email",
    upload.single("cv"),
    errorWrap(async function (req, res, next) {
        let response = await NubaxPortalBl.sendContactEmail(req, res);
        if (response) {
            if (response.status !== "error") {
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

module.exports = router;