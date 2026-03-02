var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var attendenceBl = require(__base + "/bl/attendenceBl.js");

router.post(
  "/clock-in",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.clockIn(req, res);
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

router.put(
  "/clock-out",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.clockOut(req, res);
    if (response) {
      if (response) {
        if (response.status != "error") {
          res.status(200).send(response);
        } else {
          res.status(400).send(response);
        }
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.get(
  "/getclockin",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.getClockInTime(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "errror", message: "Something went wrong..." });
    }
  })
);

router.get(
  "/orgusersAttendence",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.orgusersAttendence(req);
    if (response) {
      if (response != "eror") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "errror", message: "Something went wrong..." });
    }
  })
);

router.get(
  "/dailylogs",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.dailyLogs(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "errror", message: "Something went wrong..." });
    }
  })
);

router.post(
  "/monthlylogs",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.monthlyLogs(req);
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
  "/orgdailylogs",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.orgDailylogs(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong" });
    }
  })
);

router.post(
  "/orgMonthlylogs",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.orgMonthlylogs(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .send(400)
        .send({ status: "'eroor", message: "something went wrong " });
    }
  })
);

router.put(
  "/users_timeupdate",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.updateUserAttendanceTime(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .send(400)
        .send({ status: "'eroor", message: "something went wrong " });
    }
  })
);


//daily logs download
router.get(
  "/daily_logs_download",
  errorWrap(async function (req, res) {
    let response = await attendenceBl.getDownloadById(req);
    if (!response || response.status !== "success") {
      return res.status(400).json(response || {
        status: "error",
        message: "Something went wrong..."
      });
    }
    return res.json(response);
  })
);

//hidtorical logs download
router.post(
  "/historical_logs_download",
  errorWrap(async function (req, res, next) {
    try {
      let data = req.body;
      let response = await attendenceBl.getDownloadMonthLog(req, data);
      if (!response || response.status !== "success") {
      return res.status(400).json(response || {
        status: "error",
        message: "Something went wrong..."
      });
    }
    return res.json(response);
    } catch (err) {
      next(err); 
    }
  })
);


//Raise Attendance Approval Issue Module Start-----------------------

//getForgotClockRecords
router.get(
  "/get-attendance-issues",
  errorWrap(async function (req, res) {
    let response = await attendenceBl.getForgotClockRecords(req);
    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);

//raiseissuefor approval
router.post(
  "/raise-issue",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.raiseIssue(req);
    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);

//getapprovallist
router.get(
  "/get-attendance-pending-issues",
  errorWrap(async function (req, res) {
    let response = await attendenceBl.getPendingIssues(req);
    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);


//approvalaccept
router.post(
  "/approve-raise-issue",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.approveOrRejectIssue(req);
    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);

router.post(
  "/adminmonthlLogs",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.adminmonthlyLogs(req);
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
  "/get-attendance-view",
  errorWrap(async function (req, res) {
    let response = await attendenceBl.getAllattendenceview(req);
    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);
//Raise Attendance Approval Issue Module End-----------------------

///////////////////////////////////////////location/////////////////////////////////////////////
router.post(
  "/clock-Inlocation",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.clockInlocation(req, res);
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


router.post(
  "/clock-Outlocation",
  errorWrap(async function (req, res, next) {
    let response = await attendenceBl.clockOutlocation(req, res);
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

module.exports = router;
