var express = require("express");
var router = express.Router();
var leaveManagementBl = require(__base + "/bl/leaveManagementBl.js");

router.get("/getassigned-leaves", async function (req, res, next) {
  let response = await leaveManagementBl.getAssignedLeaves(req);
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
});

router.post("/apply-leave", async function (req, res, next) {
  let response = await leaveManagementBl.applyLeave(req);
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
});

router.get("/getemployeelogs", async function (req, res, next) {
    let response = await leaveManagementBl.getEmployeeLogs(req);
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
  });

  router.get("/getleave-details", async function (req, res, next) {
    let response = await leaveManagementBl.getLeaveDetails(req);
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
  });

  router.put("/update-leavedetails", async function (req, res, next) {
    let response = await leaveManagementBl.updateLeaveDetails(req);
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
  });

  router.get("/get-leave-rules", async function (req, res, next) {
    let response = await leaveManagementBl.getLeaveRules(req, res);
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
  
  router.post("/create-new-leave-rule", async function (req, res, next) {
    let response = await leaveManagementBl.createNewLeaveRule(req, res);
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
  
  router.put("/update-leave-rule", async function (req, res, next) {
    let response = await leaveManagementBl.updateLeaveRule(req, res);
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
  
  router.delete("/delete-leave-rule/:rule_id", async function (req, res, next) {
    let response = await leaveManagementBl.deleteLeaveRule(req, res);
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
  
  router.post("/assign-leave-rules", async function (req, res, next) {
    let response = await leaveManagementBl.assignLeaveRulesToUsers(req, res);
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
  
  router.delete("/delete-assigned-leave-rule", async function (req, res, next) {
    let response = await leaveManagementBl.deleteAssignedLeaveRulesToUsers(
      req,
      res
    );
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
  
  router.get("/assigned-rule-users", async function (req, res, next) {
    let response = await leaveManagementBl.getAssignedRuleUsers(req, res);
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
  

  router.put("/update-leave-application", async function (req, res, next) {
    let response = await leaveManagementBl.updateLeaveApplication(req, res);
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


  router.get("/get-accrual-history/:rule_id", async function (req, res, next) {
    let response = await leaveManagementBl.getAccrualHistory(req, res);
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


  router.post("/getleave-view-details", async function (req, res, next) {
    let response = await leaveManagementBl.getLeaveViewDetails(req);
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
  });

  router.get("/get-leave-details/:user_id", async function (req, res, next) {
    let response = await leaveManagementBl.getLeaveDetailsByUserId(req, res);
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

  router.get("/get-assigned-leave-types/:user_id", async function (req, res, next) {
    let response = await leaveManagementBl.getAssignedLeavesByUserId(req, res);
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
  
  router.post("/delete-leave-application", async function (req, res, next) {
    let response = await leaveManagementBl.deactivateLeaveApplication(req);
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
  });

  router.get("/adminleave-summary", async function (req, res, next) {
  try {
    const response = await leaveManagementBl.getOrgLeaveSummary(req);
    res.status(response.status === "success" ? 200 : 400).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});

module.exports = router;
