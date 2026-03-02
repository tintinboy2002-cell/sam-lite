var express = require("express")
var router = express.Router()
var errorWrap = require(__base + "/errormiddleware.js");
var configBl = require(__base + "/bl/configBl.js");
var authmiddleware = require("../middleware/authmiddleware");

router.post("/create-role", async function (req, res, next) {
  let response = await configBl.createRole(req);
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
});


router.get("/getroles", async function (req, res, next) {
  let response = await configBl.getRoles(req);
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
});


router.put("/update-role", async function (req, res, next) {
  let response = await configBl.updateRole(req);
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
});

router.post("/delete-role", async function (req, res, next) {
  let response = await configBl.deleteRole(req);
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
});

module.exports = router