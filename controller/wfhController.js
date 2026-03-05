var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var wfhBl = require(__base + "/bl/wfhBl.js");

//post api
router.post(
  "/add-Wfh-Request",
  errorWrap(async function (req, res) {
    let response = await wfhBl.addWfhRequest(req);
    if (response) {
      if (response.status === "success") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  }),
);

//get api
router.get(
  "/get_wfh_request",
  errorWrap(async function (req, res, next) {
    let response = await wfhBl.getWfhRequest(req);

    if (response) {
      //if data returned successfully
      res.status(200).send({ status: "success", data: response });
    } else {
      //if something went wrong or no data
      res
        .status(404)
        .send({ status: "error", message: "No wfh request found" });
    }
  }),
);

//update api
router.put(
  "/edit_wfh_request",
  errorWrap(async function (req, res, next) {
    let response = await wfhBl.editWfhRequest(req);
    if (response) {
      //if data returned successfully
      res.status(200).send({ status: "success", data: response });
    } else {
      //if something went wrong or no data
      res
        .status(404)
        .send({ status: "error", message: "No wfh request found" });
    }
  }),
);

//remove api
router.delete(
  "/remove_wfh_request/:id",
  errorWrap(async function (req, res, next) {
    let response = await wfhBl.removeWfhRequest(req);
    if (response) {
      res.status(200).send({ status: "success", data: response });
    } else {
      res
        .status(404)
        .send({ status: "error", message: "no wfh request found" });
    }
  }),
);

//update api for approve/reject for admin
router.put(
  "/update_wfh_status",
  errorWrap(async function (req, res) {
    let response = await wfhBl.updateWfhRequestStatus(req);
    if (response) {
      res.status(200).send({ status: "success", data: response });
    } else {
      res
        .status(404)
        .send({ status: "error", message: "no wfh request found" });
    }
  }),
);

module.exports = router;
