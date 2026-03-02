var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var payrollBl = require(__base + "/bl/payrollBl.js");

router.get (
  "/get-payroll-structure",
  errorWrap(async function (req, res, next) {
    let response = await payrollBl.getPayrollStructure(req, res);
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


router.post (
    "/create-payroll-structure",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.createPayrollStructure(req, res);
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
    "/update-payroll-structure",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.updatePayrollStructure(req, res);
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

  router.delete(
    "/delete-payroll-structure/:id",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.deletePayrollStructure(req, res);
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
    "/assign-payroll-structure",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.assignPayrollStructure(req, res);
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


  router.delete(
    "/remove-assigned-payroll-structure/:id",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.removeAssignedPayrollStructure(req, res);
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

  router.get(
    "/get-payroll-details",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getPayrollDetails(req, res);
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
    "/update-payroll-details",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.updatePayrollDetails(req, res);
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


  // ADOC/VARIABLE START
  router.get(
    "/get-adoc-and-variable-details",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getAdocAndVariableDetails(req, res);
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
    "/create-adoc-and-variable",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.createAdocAndVariable(req, res);
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
    "/update-adoc-and-variable",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.updateAdocAndVariable(req, res);
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

  router.delete(
    "/delete-adoc-and-variable/:id",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.deleteAdocAndVariable(req, res);
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
  // ADOC/VARIABLE END

  //SALARY ON HOLD START
  router.post(
    "/hold-salary",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.holdUserSalary(req, res);
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

  router.delete(
    "/release-salary/:id",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.releaseUserSalary(req, res);
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

  router.get(
    "/get-hold-salary-users",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getOnHoldSalaryUsers(req, res);
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
  //SALARY ON HOLD END


  // RUN PAYROLL START
  router.post(
    "/get-run-payroll",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getRunPayroll(req, res);
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
    "/create-payout",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.createPayout(req, res);
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
    "/update-payout-details",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.updatePayoutDetails(req, res);
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

  // RUN PAYROLL END

  // BANK DETAILS START
  router.get(
    "/get-bank-details/:user_id",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getBankDetails(req, res);
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
    "/update-bank-details",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.updateBankDetails(req, res);
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
  // BANK DETAILS END

  // PAYOUT START
  router.post(
    "/get-payout-details",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getPayoutDetails(req, res);
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
    "/generate-payslip",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.generatePayslip(req, res);
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
  // PAYOUT END

  router.post(
    "/get-payslip-details",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getPayslipDetails(req, res);
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

  router.get(
    "/get-salary-structure-details",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getSalaryStructureDetails(req, res);
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
    "/get-payroll-overview",
    errorWrap(async function (req, res, next) {
      let response = await payrollBl.getPayrollOverview(req, res);
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
    "/get-payroll-logs",
    errorWrap(async function (req, res, next) {
      console.log(req.body, " reqbody");
      let response = await payrollBl.getPayrollLogs(req, res);
      if (response) {
         if(response.status != "error") {
          res.status(200).send(response);
         }
         else{
          res.status(400).send(response);
         }
      }
      else{
        res.status(400).send({status: "error", message: "Something went wrong..."});
      }
    })
  )

  router.post(
    "/fetch-usersdetails-for-payroll-logs",
    errorWrap(async function(req, res, next){
      console.log(req.body, "fetchusers");
      let response = await payrollBl.fetchUserDetailsForPayrollLogs(req, res);
      if(response){
        if(response.status != "error"){
          res.status(200).send(response);
        }
        else{
           res.status(400).send(response);
        }
      }
      else{
       res.status(400).send({status: "error", message: "Something went wrong..."});
      }
    })
  )

// START FINAL SETTLEMENT 
  router.get(
  "/get-final-settlement-users",
  errorWrap(async function (req, res, next) {
    let response = await payrollBl.getFinalSettlement(req, res);
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
  "/create-final_settlement-payout",
  errorWrap(async function (req, res, next) {
    let response = await payrollBl.createFinalSettlementPayout(req, res);
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



// END FINAL SETTLEMENT



router.post(
  "/fetch-users-for-payslip",
  errorWrap(async function (req, res, next) {
    let response = await payrollBl.fetchUsersForPayslip(req, res);
    console.log("response", response);
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
  }
)
);

router.post(
  "/view-payslip-details",
  errorWrap(async function (req, res, next) {
    let response  = await payrollBl.viewPayslipDetails(req, res);
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
)


// FINAL SETTLEMENT PAYOUT START

router.post(
  "/get-final-settlement-payout-details",
  errorWrap(async function (req, res, next) {
    let response = await payrollBl.getFinalSettlementPayoutDetails(req, res);
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
  "/update-final-settlement-payout-details",
  errorWrap(async function (req, res, next) {
    let response = await payrollBl.updateFinalSettlementPayoutDetails(req, res);
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



router.delete(
  "/delete-final-settlement-payout-user/:id",
  errorWrap(async function (req, res, next) {
    let response = await payrollBl.deleteFinalSettlementPayoutUsers(req, res);
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
  "/generate-final-settlement-payslip",
  errorWrap(async function (req, res, next) {
    let response = await payrollBl.generateFinalSettlementPayslip(req, res);
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

// FINAL SETTLEMENT PAYOUT END
  module.exports = router;