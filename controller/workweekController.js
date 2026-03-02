var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var workweekBl = require(__base + "/bl/workweekBl.js");
//var authmiddleware = require("../middleware/authmiddleware");

router.post(
  "/create_workrule",
  errorWrap(async function (req, res, next) {
 let response = await workweekBl.createWorkWeekRule(req);
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

router.post(
  "/assignwork_week",
  errorWrap(async function (req, res, next) {
        let response = await workweekBl.assignWorkWeek(req);
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

router.delete(
  "/delete_rule",
  errorWrap(async function (req, res, next) {
    let response = await workweekBl.deleteWorkWeek(req);
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

router.delete(
  "/deleteuser_rule",
  errorWrap(async function (req, res, next) {
    let response = await workweekBl.deleteUserRule(req);
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

router.put(
  "/update_workweekrules",
  errorWrap(async function (req, res, next) {
    let response = await workweekBl.updateRules(req);
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
  "/getusers_rules",
  errorWrap(async function (req, res, next) {
    let response = await workweekBl.getUsersAndRules(req);
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
  "/listworkweek_rules",
  errorWrap(async function (req, res, next) {
    let response = await workweekBl.getWorkWeekRules(req);
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
  "/getworkweekcalender/:id",
  errorWrap(async function (req, res, next) {
    let response = await workweekBl.getWorkWeekOrgCalender(req);
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
  "/getuserworkweekrule/:user_id",
  errorWrap(async function (req, res, next) {
   let response = await workweekBl.getUserWorkWeekRule(req);
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
  "/getorgworkweek_rule",
  errorWrap(async function (req, res, next) {
    let response = await workweekBl.getorgworkweekrule(req);
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
