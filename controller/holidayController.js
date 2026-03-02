var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var holidayBl = require(__base + "/bl/holidayBl.js");
var authmiddleware = require("../middleware/authmiddleware");
const upload = require("../middleware/upload")

router.post(
  "/addholiday",
  upload.single('image'),
  errorWrap(async function (req, res,next) {
    let response = await holidayBl.addHoliday(req,res);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "SOmething went wrong" });
    }
  })
);

router.put(
  "/updateholiday",
  upload.single('image'),
  errorWrap(async function (req, res) {
    let response = await holidayBl.updateHoliday(req);
    if (response) {
      if (response != "error") {
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

router.get(
  "/listholidays",
  errorWrap(async function (req, res) {
    let response = await holidayBl.getHolidays(req);
    if (response) {
      if (response != "error") {
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

router.delete(
  "/deleteholiday",
  errorWrap(async function (req, res) {
    let response = await holidayBl.deleteHolidays(req);
    if (response) {
      if (response != "error") {
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

module.exports = router;
