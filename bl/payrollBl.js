var payrollDl = require(__base + "/dl/payrollDl.js");
var authDl = require(__base + "/dl/authDl.js");
var validations = require(__base + "/validations/validation.js");
const PDFDocument = require("pdfkit");
var emailUtils = require(__base + "/utils/emailUtils.js");
const numberToWords = require("number-to-words");
const axios = require("axios");

function Obj() {
  this.getPayrollStructure = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id < 3) {
      let getresults = await payrollDl.getPayrollStructure(user_details.org_id);
      if (!_.isEmpty(getresults)) {
        response["status"] = "success";
        response["data"] = getresults;
      } else {
        response["status"] = "error";
        response["message"] = "No Data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not Authorized";
    }
    return response;
  };

  this.createPayrollStructure = async function (req, res) {
    const modulename = "Create Payroll Structure";
    let response = {};
    let validationrule = {
      name: "required",
      description: "required",
      basic_formula: "required",
      hra_formula: "required",
      conveyance_allowance_formula: "required",
      special_allowance_formula: "required",
      overtime: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      req.body.org_id = user_details.org_id;
      req.body.user_id = user_details.user_id;
      if (user_details.role_id < 3) {
        let result = await payrollDl.createPayrollStructure(req.body);
        let result1 = await payrollDl.postStructureLogs(
          modulename,
          req.body,
          req.body.user_id,
          "Created"
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Payroll Structure Created";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Create Payroll Structure";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.updatePayrollStructure = async function (req, res) {
    let response = {};
    const modulename = "Update Payroll Structure";
    let validationrule = {
      id: "required",
      name: "required",
      description: "required",
      basic_formula: "required",
      hra_formula: "required",
      conveyance_allowance_formula: "required",
      special_allowance_formula: "required",
      overtime: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      req.body.org_id = user_details.org_id;
      req.body.user_id = user_details.user_id;
      if (user_details.role_id < 3) {
        let oldData = await payrollDl.fetchOldPayrollStructureDataForLogs(req.body);
        let result = await payrollDl.updatePayrollStructure(req.body);
        req.body.oldData = oldData;
        if (result.affectedRows > 0) {
           let result1 = await payrollDl.updateStructureLogs(
          modulename,
          req.body,
          req.body.user_id,
          "Updated"
        );
          response["status"] = "success";
          response["message"] = "Payroll Structure Updated Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Update Payroll Structure";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.deletePayrollStructure = async function (req, res) {
    const modulename = "Deleted created Payroll Structure";
    let response = {};
    let validationrule = {
      id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      req.body.org_id = user_details.org_id;
      req.body.user_id = user_details.user_id;
      if (user_details.role_id < 3) {
        let payrollDetails = await payrollDl.getPayrollStructureDetailsForLogs(
          req.params
        );
        let result = await payrollDl.deletePayrollStructure(req.params);

        let payrollRes = await payrollDl.deletePayrollStructureLogs(
          modulename,
          payrollDetails[0],
          req.body.user_id,
          "Deleted"
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Payroll Structure Deleted Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Delete Payroll Structure";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.assignPayrollStructure = async function (req, res) {
    // const modulename = req.body.payroll_structure[0].name;
    // console.log(modulename, "modulename");
    const modulename = "Assign Payroll Structure";
    let response = {};
    let validationrule = {
      payroll_structure: "required",
      users: "required",
      effective_date: "required",
    };
    let validationobj = req.body;
    let newreq = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      req.body.org_id = user_details.org_id;
      req.body.user_id = user_details.user_id;

      if (user_details.role_id < 3) {       
        let result = await payrollDl.assignPayrollToMultipleUsers(req.body);
    
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Payroll Structure Assigned Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Assign Payroll Structure";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.removeAssignedPayrollStructure = async function (req, res) {
    const modulename = "Removed Assigned Payroll Structure";
    let response = {};
    let validationrule = {
      id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      req.params.org_id = user_details.org_id;
      req.params.user_id = user_details.user_id;
      console.log(req.params, "params");
      if (user_details.role_id < 3) {
        let payrollDetails = await payrollDl.getPayrollDetailsForLogss(
          req.params
        );
        let result = await payrollDl.removeAssignedPayrollStructure(req.params);
        let payrollRes = await payrollDl.storeRemovedAssignPayrollStructureLogs(
          modulename,
          payrollDetails[0],
          req.params.user_id,
          "Deleted"
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] =
            "Removed Assigned Payroll Structure Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Remove Assigned Payroll Structure";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.getPayrollDetails = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id < 3) {
      let getresults = await payrollDl.getPayrollDetails(user_details.org_id);
      if (!_.isEmpty(getresults)) {
        response["status"] = "success";
        response["data"] = getresults;
      } else {
        response["status"] = "error";
        response["message"] = "No Data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not Authorized";
    }
    return response;
  };

  this.updatePayrollDetails = async function (req, res) {
    let response = {};
    const modulename = "Update Payroll Details";
    let validationrule = {
      user_id: "required",
      ctc: "required",
      conveyance_allowance: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      const Adminuser_id = user_details.user_id;
      const actionType = "Updated";
      if (user_details.role_id < 3) {
        const oldData = await payrollDl.fetchOldPayrollDetails(req.body);
        let result = await payrollDl.updatePayrollDetails(req.body);
        req.body.oldData = oldData;
        if (result.affectedRows > 0) {
          await payrollDl.storeUpdatedAssignStructureLogs(
            modulename,
            req.body,
            Adminuser_id,
            actionType
          );
          response["status"] = "success";
          response["message"] = "Updated Payroll Details Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Update Payroll Details";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  // ADOC/VARIABLE START
  this.getAdocAndVariableDetails = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id < 3) {
      let result = await payrollDl.getAdocAndVariableDetails(
        user_details.org_id
      );
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "No Data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not Authorized";
    }
    return response;
  };

  this.createAdocAndVariable = async function (req, res) {
    let response = {};
    const modulename = "Create ADOC/Variable logs";
    let validationrule = {
      user_id: "required",
      type: "required",
      amount: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);

    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let result = await payrollDl.createAdocAndVariable(req.body);
        let result1 = await payrollDl.postAdocVariableLogs(
          modulename,
          req.body,
          user_details.user_id,
          "Created"
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Details Added Successfully.";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Add Details";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.updateAdocAndVariable = async function (req, res) {
    console.log(req.body, "adoc variable");
    const modulename = "Update ADOC/Variable logs";
    let response = {};
    let validationrule = {
      id: "required",
      type: "required",
      amount: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let isRecord = await payrollDl.getAdocAndVariableDetailsById(
          user_details.org_id,
          req.body
        );
        const oldData = await payrollDl.getOldAdocAndVariableDataForLogs(req.body);
        req.body.oldData = oldData;
        let result1 = await payrollDl.updateAdocVariableLogs(
          modulename,
          req.body,
          user_details.user_id,
          "Updated"
        );
        if (!_.isEmpty(isRecord)) {
          let result = await payrollDl.updateAdocAndVariable(req.body);
          if (result.affectedRows > 0) {
            response["status"] = "success";
            response["message"] = "Details Updated Successfully.";
          } else {
            response["status"] = "error";
            response["message"] = "Failed to Update Details";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Data not found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.deleteAdocAndVariable = async function (req, res) {
    const modulename = "Deleted ADOC/Variable for employee";
    let response = {};
    let validationrule = {
      id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let isRecord = await payrollDl.getAdocAndVariableDetailsById(
          user_details.org_id,
          req.params
        );
        if (!_.isEmpty(isRecord)) {
          let ADOCDetails = await payrollDl.getAdocAndVariableDetailsForLogs(
            req.params
          );
          let result = await payrollDl.deleteAdocAndVariable(req.params);
          let payrollLogs = await payrollDl.postDeletedADOCVariableLogs(
            modulename,
            ADOCDetails[0],
            user_details.user_id,
            "Deleted"
          );
          if (result.affectedRows > 0) {
            response["status"] = "success";
            response["message"] = "Record Deleted Successfully.";
          } else {
            response["status"] = "error";
            response["message"] = "Failed to Delete Record";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Data not found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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
  // ADOC/VARIABLE END

  // SALARY ON HOLD START
  this.holdUserSalary = async function (req, res) {
    let response = {};
    const modulename = "Hold User Salary";
    let validationrule = {
      user_id: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        const userId = user_details.user_id;
        let result1 = await payrollDl.postHoldUserSalaryLogs(
          modulename,
          req.body,
          userId,
          "Created"
        );
        let result = await payrollDl.holdUserSalary(req.body);
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "User added successfully.";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Add User";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.releaseUserSalary = async function (req, res) {
    const modulename = "delete Held Salary";
    let response = {};
    let validationrule = {
      id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      const user_id = user_details.user_id;
      if (user_details.role_id < 3) {
        let salaryDetails = await payrollDl.getHeldSalaryDetailsForLogs(
          req.params
        );
        let result = await payrollDl.releaseUserSalary(req.params);
        let heldSalary = await payrollDl.deleteHeldSalaryLogs(
          modulename,
          salaryDetails[0],
          user_id,
          "Deleted"
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "User removed successfully.";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to remove User";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.getOnHoldSalaryUsers = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id < 3) {
      let onHoldSalaryUsers = await payrollDl.getOnHoldSalaryUsers(
        user_details
      );
      let releasedSalaryUsers = await payrollDl.getReleasedSalaryUsers(
        user_details
      );
      if (!_.isEmpty(onHoldSalaryUsers) || !_.isEmpty(releasedSalaryUsers)) {
        response["status"] = "success";
        response["message"] = "Data fetched";
        response["data"] = {
          on_hold_salary_users: onHoldSalaryUsers,
          released_users: releasedSalaryUsers,
        };
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not Authorized";
    }
    return response;
  };
  // SALARY ON HOLD END

  // RUN PAYROLL START
  this.getRunPayroll = async function (req, res) {
    let response = {};
     let validationrule = {
      month: "required",
      year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if(isValid) {
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id < 3) {
      let result = await payrollDl.getRunPayrollByOrgId(user_details, req.body)
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["message"] = "Data fetched";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not Authorized";
    }
  } else {
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

  this.createPayout = async function (req, res) {
    let response = {};
    const modulename = "Create Payout";
    let validationrule = {
      users: "required",
      month: "required",
      year: "required",
      monthName: "required"
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let result = await payrollDl.createPayoutForCurrentMonth(
          user_details,
          req.body
        );
        let userDetails = await payrollDl.fetchMultipleUserDetailsForPayrollLogs2(req.body);
        await payrollDl.storeCreatePayoutLogs(modulename, userDetails,user_details.user_id, "Created");
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Payout details generated successfully";
        } else {
          response["status"] = "error";
          response["message"] = "No data found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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
  // RUN PAYROLL END

  // BANK DETAILS START
  this.getBankDetails = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id <= 3) {
      let result = await payrollDl.getBankDetailsByUserId(req.params);
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["message"] = "Data fetched";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not Authorized";
    }
    return response;
  };

  this.updateBankDetails = async (req, res) => {
    let response = {};
    let validationrule = {
      account_holder_name: "required",
      bank_name: "required",
      account_number: "required",
      ifsc_code: "required",
      branch_name: "required",
      city: "required",
      user_id: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      let org_id = user_details.org_id
      let user_id = req.body.user_id
      let data = { org_id, user_id }
      if (user_details.role_id <= 3) {
        let existingData = await payrollDl.getExistingBankDetails(req.body)
        let bank_details = await payrollDl.getBankDetailsByUserId(req.body);
        if (_.isEmpty(bank_details)) {
          let result = await payrollDl.AddBankDetails(req.body);
          if (result.affectedRows > 0) {
          await authDl.updateProfileAuditLogs(existingData, req.body, data, user_details, "INSERT")
            response["status"] = "success";
            response["message"] = "Bank Details updated succesfully.";
          } else {
            response["status"] = "error";
            response["message"] = "Failed to update bank details";
          }
        } else {
          let result = await payrollDl.UpdateBankDetails(req.body);
          if (result.affectedRows > 0) {
            await authDl.updateProfileAuditLogs(existingData, req.body, data, user_details)
            response["status"] = "success";
            response["message"] = "Bank Details updated succesfully.";
          } else {
            response["status"] = "error";
            response["message"] = "Failed to update bank details";
          }
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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
  // BANK DETAILS END

  // PAYOUT START
  this.getPayoutDetails = async (req, res) => {
    let response = {};
    let validationrule = {
      month: "required",
      year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        req.body.org_id = user_details.org_id;
        let result = await payrollDl.getPayoutDetails(req.body);
        if (!_.isEmpty(result)) {
          response["status"] = "success";
          response["message"] = "Data received.";
          response["data"] = result;
        } else {
          response["status"] = "error";
          response["message"] = "No data found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.updatePayoutDetails = async (req, res) => {
     const modulename = "Update Payout Details"
    let response = {};
    let validationrule = {
      row_id: "required",
      status: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        req.body.org_id = user_details.org_id;
        let userDetails1 = await payrollDl.getUserDetailsForPayout(req.body);
        let result = await payrollDl.updatePayoutDetails(req.body);
         let userDetails2 = await payrollDl.getUserDetailsForPayout(req.body);
        userDetails2[0].new_status = userDetails2[0].status;
        userDetails2[0].old_status = userDetails1[0].status;
        delete userDetails2[0].status;
        await payrollDl.storeUpdatePayoutLogs(modulename, userDetails2, user_details.user_id, "Updated");
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "payout details updated successfully";
        } else {
          response["status"] = "error";
          response["message"] = "failed to update payout details";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.generatePayslip = async (req, res) => {
    const modulename = "Generate Payslip";
    let response = {};
    let validationrule = {
      users: "required",
      month: "required",
      year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        req.body.org_id = user_details.org_id;
        req.body.user_id = user_details.user_id;
        let usersData = await authDl.getUsersDataByUserId(req.body);
        let result = await payrollDl.generatePayslip(req.body);
        await payrollDl.storeGeneratedPayslipLogs(modulename, usersData, user_details.user_id, "Created")
        if (result.affectedRows > 0) {
          for (let i = 0; i < usersData.length; i++) {
            let getPayslipDetails = await payrollDl.getPayslipDetails(
              req.body,
              usersData[i]
            );
            if (!_.isEmpty(getPayslipDetails)) {
              let payslipData = getPayslipDetails.find(
                (p) => p.email === usersData[i].email
              );
              if (payslipData) {
                await self.sendGeneratedPayslipAlert(
                  req.body,
                  usersData[i],
                  payslipData
                );
                response["status"] = "success";
                response["message"] = "Payslip generated successfully";
              }
            } else {
              response["status"] = "error";
              response["message"] = "No data found";
            }
          }
        } else {
          response["status"] = "error";
          response["message"] = "Payslip not generated";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.sendGeneratedPayslipAlert = async function (obj, data, pdfData) {
    let response = {};
    let subject = "Payslip Generated";
    let message = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payslip Generated</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #dddddd;
                }
                .header img {
                    max-width: 150px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content h1 {
                    color: #333333;
                }
                .content p {
                    color: #666666;
                    font-size: 16px;
                    line-height: 1.5;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    border-top: 1px solid #dddddd;
                    color: #999999;
                    font-size: 14px;
                }
                .click-link {
                    color: #075dce;
                    text-decoration: none;
                }
                .click-link:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="content">
                    <p>Dear ${pdfData.employee_name},</p>
                    <p>Your payslip for the month of ${pdfData.month} ${pdfData.year} has been generated</p>
                    <p><a href='${process.env.REACT_APP_API_URL}/login?redirect=/admin/payroll'>Click here to view the payslip<a></p>
                </div>
            </div>
        </body>
        </html>`;

    try {
      let pdfFileName = `Payslip_${pdfData.employee_name}_${pdfData.month}_${pdfData.year}.pdf`;
      let pdfBuffer = await self.generatePayslipPDF(pdfData);
      await emailUtils.sendEmail(
        pdfData.email,
        subject,
        message,
        pdfBuffer,
        pdfFileName
      );
      response["status"] = "success";
      response["message"] = "Payslip generated and sent successfully.";
      response["message"] = "Payslip email sent successfully.";
      response["status"] = "success";
    } catch (error) {
      response["message"] = "failed to send Email";
      response["status"] = "error";
    }
    return response;
  };

  this.fetchImage = async (imageUrl) => {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data, "binary");
    } catch (error) {
      throw new Error("Failed to fetch image");
    }
  };

  this.generatePayslipPDF = async (item) => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40 });
        let buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          let pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Now the function directly processes the `item` object, not an array
        // **Logo**
        if (item.logo_url) {
          const logoBuffer = await self.fetchImage(item.logo_url);
          doc.image(logoBuffer, 50, 20, { width: 100 });
        }

        doc.moveDown(2);

        // Company Name & Address
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(item.company_name, { align: "center" })
          .moveDown(0.5);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(item.Registered_office || item.corporate_office || "", {
            align: "center",
          })
          .moveDown(1);

        // Payslip Header
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text(`Payslip for the Month of ${item.month}, ${item.year}`, {
            align: "center",
          })
          .moveDown(1);

        // **Employee Details Table**
        const tableStartY = doc.y;
        const tableWidth = 500;
        const midX = 300;

        doc.rect(50, tableStartY, tableWidth, 100).stroke();
        doc
          .moveTo(midX, tableStartY)
          .lineTo(midX, tableStartY + 100)
          .stroke();

        const leftX = 60,
          rightX = 320,
          valueX = 200,
          valueRightX = 420;
        let rowY = tableStartY + 10;

        doc.fontSize(10).font("Helvetica");
        doc.text("Name:", leftX, rowY);
        doc.text(item.employee_name || "", valueX - 60, rowY);
        doc.text("Employee ID:", rightX, rowY);
        doc.text(item.employee_id || "", valueRightX, rowY);

        rowY += 20;
        doc.text("Designation:", leftX, rowY);
        doc.text(item.designations || "", valueX - 60, rowY);
        doc.text("Bank Name:", rightX, rowY);
        doc.text(item.bank_name || "", valueRightX, rowY);

        rowY += 20;
        doc.text("Department:", leftX, rowY);
        doc.text(item.department_name || "", valueX - 60, rowY);
        doc.text("Bank Account No:", rightX, rowY);
        doc.text(item.account_number || "", valueRightX, rowY);

        rowY += 20;
        doc.text("Location:", leftX, rowY);
        doc.text(item.work_location || "", valueX - 60, rowY);
        doc.text("PAN No:", rightX, rowY);
        doc.text(item.pan_no || "", valueRightX, rowY);

        doc.moveDown(3); // Add space before the next table

        // **Earnings & Deductions Table**
        const earningsDeductionStartY = doc.y;
        doc.rect(50, earningsDeductionStartY, tableWidth, 175).stroke(); // Increased height
        doc
          .moveTo(midX, earningsDeductionStartY)
          .lineTo(midX, earningsDeductionStartY + 175)
          .stroke();

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Earnings", leftX, earningsDeductionStartY + 10);
        doc.text("Amount (Rs)", valueX, earningsDeductionStartY + 10);
        doc.text("Deductions", rightX, earningsDeductionStartY + 10);
        doc.text("Amount (Rs)", valueRightX, earningsDeductionStartY + 10);

        doc
          .moveTo(50, earningsDeductionStartY + 25)
          .lineTo(550, earningsDeductionStartY + 25)
          .stroke();

        const earningsRows = [
          { label: "Basic", value: item.basic_month || "0.00" },
          { label: "HRA", value: item.hra_month || "0.00" },
          {
            label: "Conveyance Allowance",
            value: item.conveyance_allowance_month || "0.00",
          },
          {
            label: "Special Allowance",
            value: item.special_allowance_month || "0.00",
          },
          { label: "Variable", value: item.variable || "0.00" },
        ];

        earningsRows.forEach((row, rowIndex) => {
          const rowStartY = earningsDeductionStartY + 40 + rowIndex * 25;
          doc.font("Helvetica").text(row.label, leftX, rowStartY); // Regular value
          doc.font("Helvetica").text(row.value, valueX, rowStartY); // Regular value
        });

        const deductionsRows = [
          { label: "Adoc", value: item.adoc_deduction || "0.00" },
        ];

        deductionsRows.forEach((row, rowIndex) => {
          const rowStartY = earningsDeductionStartY + 40 + rowIndex * 25;
          doc.font("Helvetica").text(row.label, rightX, rowStartY); // Regular value
          doc.font("Helvetica").text(row.value, valueRightX, rowStartY); // Regular value
        });

        doc
          .moveTo(50, earningsDeductionStartY + 150)
          .lineTo(550, earningsDeductionStartY + 150)
          .stroke();

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text(`Total Earnings (Rs):`, leftX, earningsDeductionStartY + 160);
        doc.fontSize(10).font("Helvetica");
        doc.text(
          `${item.ctc_per_month}`,
          valueX,
          earningsDeductionStartY + 160
        );

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text(
          `Total Deductions (Rs):`,
          rightX - 10,
          earningsDeductionStartY + 160
        );
        doc.fontSize(10).font("Helvetica");
        doc.text(
          `${item.adoc_deduction}`,
          valueRightX + 10,
          earningsDeductionStartY + 160
        );

        doc
          .moveTo(50, earningsDeductionStartY + 175)
          .lineTo(550, earningsDeductionStartY + 175)
          .stroke();

        doc.text(
          `Net Pay For The Month: ${item.net_pay}`,
          leftX,
          earningsDeductionStartY + 185
        );

        doc.fontSize(10).font("Helvetica");
        doc.text(
          `Rupees ${
            item?.net_pay && !isNaN(item.net_pay)
              ? numberToWords.toWords(item.net_pay)
              : ""
          } Only`,
          leftX,
          earningsDeductionStartY + 215
        );

        doc
          .moveTo(50, earningsDeductionStartY + 235)
          .lineTo(550, earningsDeductionStartY + 235)
          .stroke();

        doc.moveDown(2);
        doc.text(
          "This is a system-generated payslip and does not require a signature.",
          { align: "center" }
        );

        doc.moveDown(2);

        doc.end();
      } catch (error) {
        console.log(error, "error");
        reject(error);
      }
    });
  };

  // PAYOUT END

  this.getPayslipDetails = async (req, res) => {
    let response = {};
    let validationrule = {
      month: "required",
      year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      req.body.users = user_details.user_id;
      let result = await payrollDl.getPayslipDetails(req.body);
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["message"] = "Data received.";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
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

  this.getSalaryStructureDetails = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    let getresults = await payrollDl.getSalaryStructureDetails(user_details);
    if (!_.isEmpty(getresults)) {
      response["status"] = "success";
      response["data"] = getresults;
    } else {
      response["status"] = "error";
      response["message"] = "No Data found";
    }
    return response;
  };

  this.getPayrollOverview = async (req, res) => {
    let response = {};
    let validationrule = {
      month: "required",
      year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        req.body.org_id = user_details.org_id;
        let result = await payrollDl.getPayrollOverview(req.body);
        if (!_.isEmpty(result)) {
          response["status"] = "success";
          response["message"] = "Data received.";
          response["data"] = result;
        } else {
          response["status"] = "error";
          response["message"] = "No data found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.getPayrollLogs = async (req, res) => {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    let validationrule = {
      startDate: "required",
      endDate: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      if (user_details.role_id < 3) {
        let result = await payrollDl.getPayrollDetailsForLogs(req.body, user_details.org_id);
        if (!_.isEmpty(result)) {
          response["status"] = "success";
          response["message"] = "Data fetched";
          response["data"] = result;
        } else {
          response["status"] = "error";
          response["message"] = "No data found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "not authorized";
      }
    } else {
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

  this.fetchUserDetailsForPayrollLogs = async (req, res) => {
    let response = {};
    let validationrule = {
      modulename: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      if(req.body.modulename==='Assign Payroll Structure') {
         let user_details = await payrollDl.fetchMultipleUserDetailsForPayrollLogs(req.body);
         if (!_.isEmpty(user_details)) {
          response["status"] = "success";
          response["message"] = "Data fetched";
          response["data"] = user_details;
        } else {
          response["status"] = "error";
          response["message"] = "No data found";
        }
      }
      else{
      let user_details = await payrollDl.fetchUserDetailsForPayrollLogs(req.body);
      
      if (!_.isEmpty(user_details)) {
        response["status"] = "success";
        response["message"] = "Data fetched";
        response["data"] = user_details;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    }
   } else {
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


   this.fetchUsersForPayslip = async (req, res) => {
    let response = {};
    let validationrule = {
      month: "required",
      year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    console.log(isValid, "isValid");
    let user_details = await authDl.getDecryptToken(req);
    req.body.org_id = user_details.org_id;

    if (isValid) {
      let result = await payrollDl.fetchUsersForPayslip(req.body);
      console.log(result, "result");
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["message"] = "Data fetched";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
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


  
  this.viewPayslipDetails = async (req, res) => {
    let response = {};
    let validationrule = {
      users: "required",
      month: "required",
      year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    let user_details = await authDl.getDecryptToken(req);
    req.body.org_id = user_details.org_id;
    if (isValid) {
      let result = await payrollDl.getPayslipDetails(req.body);
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["message"] = "Data fetched";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
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


  // Final settlement

   this.getFinalSettlement = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id < 3) {
      let result = await payrollDl.getFinalSettlementByOrgId(user_details);
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["message"] = "Data fetched";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not Authorized";
    }
    return response;
  };

  this.createFinalSettlementPayout = async function (req, res) {
    let response = {};
    let validationrule = {
      users: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let result = await payrollDl.createFinalSettlementForCurrentMonth(
          user_details,
          req.body
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Final Settlement Payout details generated successfully";
        } else {
          response["status"] = "error";
          response["message"] = "No data found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  // FINAL SETTLEMENT END


  // FINAL SETTLEMENT PAYOUT START

  this.getFinalSettlementPayoutDetails = async (req, res) => {
    let response = {};
    let validationrule = {
      month: "required",
      year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        req.body.org_id = user_details.org_id;
        let result = await payrollDl.getFinalSettlementPayoutDetails(req.body);
        if (!_.isEmpty(result)) {
          response["status"] = "success";
          response["message"] = "Data received.";
          response["data"] = result;
        } else {
          response["status"] = "error";
          response["message"] = "No data found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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


  this.updateFinalSettlementPayoutDetails = async (req, res) => {
    let response = {};
    let validationrule = {
      row_id: "required",
      status: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        req.body.org_id = user_details.org_id;
        let result = await payrollDl.updateFinalSettlementPayoutDetails(req.body);
        // let is_active_status = await payrollDl.updateIsActiveStatus(user_details)
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Final Settlement payout details updated successfully";
        } else {
          response["status"] = "error";
          response["message"] = "failed to update Final Settlement payout details";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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


  this.deleteFinalSettlementPayoutUsers = async function (req, res) {
    const modulename = "Deleted final settlement Payout users";
    let response = {};
    let validationrule = {
      id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      req.body.org_id = user_details.org_id;
      req.body.user_id = user_details.user_id;
      if (user_details.role_id < 3) {
        let payoutDetails = await payrollDl.getFinalSettlementDetailsForLogs(
          req.params
        );
        let result = await payrollDl.deleteFinalSettlementPayoutUsers(req.params);

        let payrollRes = await payrollDl.insertFSDetailsForLogs(
          modulename,
          payoutDetails[0],
          req.body.user_id,
          "Deleted"
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Final Settlement payout users Deleted Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Delete Final Settlement payout users";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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

  this.generateFinalSettlementPayslip = async (req, res) => {
    let response = {};
    let validationrule = {
      users: "required",
      Month: "required",
      Year: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);

    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        req.body.org_id = user_details.org_id;
        req.body.user_id = user_details.user_id;
        let usersData = await authDl.getFSUsersDataByUserId(req.body);
        let result = await payrollDl.generateFSPayslip(req.body);

        if (result.affectedRows > 0) {
          for (let i = 0; i < usersData.length; i++) {
            let getPayslipDetails = await payrollDl.getFSPayslipDetails(
              req.body,
              usersData[i]
            );

            if (!_.isEmpty(getPayslipDetails)) {
              let payslipData = getPayslipDetails.find(
                (p) => p.personalemail_id === usersData[i].email

              );
              if (payslipData) {
                await self.sendGeneratedFSPayslipAlert(
                  req.body,
                  usersData[i],
                  payslipData
                );
                response["status"] = "success";
                response["message"] = "Final Settlement Payslip generated successfully";
              }
            } else {
              response["status"] = "error";
              response["message"] = "No data found";
            }
          }
        } else {
          response["status"] = "error";
          response["message"] = "Final Settlement Payslip Not generated";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not Authorized";
      }
    } else {
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


  this.sendGeneratedFSPayslipAlert = async function (obj, data, pdfData) {
    let response = {};
    let subject = "Final Settlement Payslip Generated";
    let message = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Payslip Generated</title>
              <style>
                  body {
                      font-family: 'Arial', sans-serif;
                      background-color: #f4f4f4;
                      margin: 0;
                      padding: 0;
                  }
                  .email-container {
                      max-width: 600px;
                      margin: auto;
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                      text-align: center;
                      padding: 10px 0;
                      border-bottom: 1px solid #dddddd;
                  }
                  .header img {
                      max-width: 150px;
                  }
                  .content {
                      padding: 20px;
                      text-align: center;
                  }
                  .content h1 {
                      color: #333333;
                  }
                  .content p {
                      color: #666666;
                      font-size: 16px;
                      line-height: 1.5;
                  }
                  .footer {
                      text-align: center;
                      padding: 20px;
                      border-top: 1px solid #dddddd;
                      color: #999999;
                      font-size: 14px;
                  }
                  .click-link {
                      color: #075dce;
                      text-decoration: none;
                  }
                  .click-link:hover {
                      text-decoration: underline;
                  }
              </style>
          </head>
          <body>
              <div class="email-container">
                  <div class="content">
                      <p>Dear ${pdfData.employee_name},</p>
                      <p>Your Final Settlement payslip has been generated</p>
                      <p><a href='${process.env.REACT_APP_API_URL}/login?redirect=/admin/payroll'>Click here to view the payslip<a></p>
                  </div>
              </div>
          </body>
          </html>`;

    try {
      let pdfFileName = `Final_Settlement_Payslip_${pdfData.employee_name}_${pdfData.Month}_${pdfData.Year}.pdf`;

      let pdfBuffer = await self.generateFSPayslipPDF(pdfData);

      await emailUtils.sendEmail(
        pdfData.personalemail_id,
        subject,
        message,
        pdfBuffer,
        pdfFileName

      );
      response["status"] = "success";
      response["message"] = "Settlement Payslip generated and sent successfully.";
      response["message"] = "Settlement Payslip email sent successfully.";
      response["status"] = "success";
    } catch (error) {
      response["message"] = "failed to send Email";
      response["status"] = "error";
    }
    return response;
  };

  this.convertToIndianRupeeWords = async (amount) => {
    const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const units = ['', 'Thousand', 'Lakh', 'Crore'];

    function getTwoDigitWords(n) {
      if (n < 10) return singleDigits[n];
      if (n < 20) return twoDigits[n - 10];
      return tensMultiple[Math.floor(n / 10)] + (n % 10 ? ' ' + singleDigits[n % 10] : '');
    }

    function getWords(num) {
      if (num === 0) return 'Zero';

      let str = '';
      const numStr = num.toString().padStart(9, '0'); // Up to 99 crore
      const crore = parseInt(numStr.substring(0, 2), 10);
      const lakh = parseInt(numStr.substring(2, 4), 10);
      const thousand = parseInt(numStr.substring(4, 6), 10);
      const hundred = parseInt(numStr.charAt(6), 10);
      const rest = parseInt(numStr.substring(7, 9), 10);

      if (crore) str += getTwoDigitWords(crore) + ' Crore ';
      if (lakh) str += getTwoDigitWords(lakh) + ' Lakh ';
      if (thousand) str += getTwoDigitWords(thousand) + ' Thousand ';
      if (hundred) str += singleDigits[hundred] + ' Hundred ';
      if (rest) {
        if (str !== '') str += 'and ';
        str += getTwoDigitWords(rest);
      }

      return str.trim();
    }

    const [rupees, paise] = amount.toString().split('.');

    let result = `Rupees ${getWords(parseInt(rupees))}`;
    if (paise && parseInt(paise) > 0) {
      result += ` and ${getWords(parseInt(paise))} Paise`;
    }

    return result;
  }

  this.generateFSPayslipPDF = async (item) => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40 });
        let buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          let pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });


        if (item.logo_url) {
          const logoBuffer = await self.fetchImage(item.logo_url);
          const imageWidth = 100;
          const pageWidth = doc.page.width;
          const x = (pageWidth - imageWidth) / 2;
          doc.image(logoBuffer, x, 20, { width: imageWidth });
        }

        doc.moveDown(2);

        // Company Name & Address
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(item.Registered_office || item.corporate_office || "", { align: "center" })
          .moveDown(1);

        // Title
        doc.fontSize(16).font("Helvetica-Bold").text("Final Settlement", { align: "center" });
        doc.moveDown(1);

        // Employee Details Box
        const tableStartY = doc.y;
        const tableWidth = 500;
        const midX = 300;


        doc.lineWidth(2).strokeColor('#000000');
        doc.rect(50, tableStartY, tableWidth, 370).stroke();
        // Reset line style for other normal table lines
        doc.lineWidth(1).strokeColor('black');
        doc.moveTo(midX, tableStartY).lineTo(midX, tableStartY + 105).stroke();

        const leftX = 60, rightX = 320, valueX = 200, valueRightX = 420;
        let rowY = tableStartY + 10;

        doc.fontSize(10).font("Helvetica");
        doc.font("Helvetica-Bold").text("Employee No:", leftX, rowY);
        doc.font("Helvetica").text(item.Employee_id || "", valueX - 20, rowY);
        doc.font("Helvetica-Bold").text("Name:", rightX - 15, rowY);
        doc.font("Helvetica").text(item.employee_name || "", valueRightX, rowY);
        doc.moveTo(50, rowY + 15).lineTo(550, rowY + 15).stroke();

        rowY += 20;
        doc.font("Helvetica-Bold").text("Designation Name:", leftX, rowY);
        doc.font("Helvetica").text(item.Designation_Name || "", valueX - 20, rowY);
        doc.font("Helvetica-Bold").text("Bank Account Number:", rightX - 15, rowY);
        doc.font("Helvetica").text(item.account_number || "", valueRightX, rowY);
        doc.moveTo(50, rowY + 15).lineTo(550, rowY + 15).stroke();

        rowY += 20;
        const dof_date = new Date(item.Date_Of_Joining);
        const dof_day = String(dof_date.getDate()).padStart(2, '0');
        const dof_month = String(dof_date.getMonth() + 1).padStart(2, '0');
        const dof_year = dof_date.getFullYear();
        const Date_Of_Joining = `${dof_day}-${dof_month}-${dof_year}`;

        const lwd_date = new Date(item.Last_Working_Day);
        const lwd_day = String(lwd_date.getDate()).padStart(2, '0');
        const lwd_month = String(lwd_date.getMonth() + 1).padStart(2, '0');
        const lwd_year = dof_date.getFullYear();
        const Last_Working_Day = `${lwd_day}-${lwd_month}-${lwd_year}`;

        doc.font("Helvetica-Bold").text("Date Of Joining:", leftX, rowY);
        doc.font("Helvetica").text(Date_Of_Joining || "", valueX - 20, rowY);
        doc.font("Helvetica-Bold").text("Last Working Day:", rightX - 15, rowY);
        doc.font("Helvetica").text(Last_Working_Day || "", valueRightX, rowY);
        doc.moveTo(50, rowY + 15).lineTo(550, rowY + 15).stroke();

        rowY += 20;
        doc.font("Helvetica-Bold").text("Pay Period:", leftX, rowY);
        doc.font("Helvetica").text(item.Month || "", valueX - 20, rowY);
        doc.font("Helvetica-Bold").text("Paid Days:", rightX - 15, rowY);
        doc.font("Helvetica").text(lwd_day || "", valueRightX, rowY);
        doc.moveTo(50, rowY + 15).lineTo(550, rowY + 15).stroke();

        rowY += 20;
        const today = new Date();

        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const year = today.getFullYear();
        const formattedDate = `${day}-${month}-${year}`
        doc.font("Helvetica-Bold").text("Final Settlement Date:", leftX, rowY);
        doc.font("Helvetica").text(formattedDate || "", valueX - 20, rowY);
        doc.font("Helvetica-Bold").text("LOP Days:", rightX - 15, rowY);
        doc.font("Helvetica").text(item.LOP_Leaves || "0", valueRightX, rowY);
        doc.moveTo(50, rowY + 15).lineTo(550, rowY + 15).stroke();


        doc.moveDown(2.6);

        // horizontal line
        doc.lineWidth(2).strokeColor('#000000');
        doc.moveTo(50, rowY + 35).lineTo(550, rowY + 35).stroke();


        // Earning & Deduction Headers
        const earningsDeductionStartY = doc.y;
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("EARNINGS", leftX + 45, earningsDeductionStartY);
        doc.text("AMOUNT (Rs)", leftX + 170, earningsDeductionStartY);
        doc.text("DEDUCTIONS", rightX + 30, earningsDeductionStartY);
        doc.text("AMOUNT (Rs)", rightX + 160, earningsDeductionStartY);


        // Make the top line under the headers bold and dark
        doc.moveTo(50, earningsDeductionStartY + 15).lineTo(550, earningsDeductionStartY + 15).stroke();

        // Reset line style for other normal table lines
        doc.lineWidth(1).strokeColor('black');

        // Gross Earnings calculations
        const Gross_Earnings = Math.round(parseFloat(item.Month_Basic) + parseFloat(item.Month_HRA) + parseFloat(item.Conveyance_Allowance) + parseFloat(item.variable) + parseFloat(item.EL_Encashment));
        //   Earnings and Deductions Rows
        const rows = [
          { earn: "Basic Pay", earnVal: item.Month_Basic || "0.00", ded: "Adoc", dedVal: item.Adoc_Deduction || "0.00" },
          { earn: "HRA", earnVal: item.Month_HRA || "0.00", ded: "LOP", dedVal: item.lop || "0.00"  },
          { earn: "Conveyence Allowance", earnVal: item.Conveyance_Allowance || "0.00", ded: "", dedVal: "" },
          { earn: "Variable", earnVal: item.variable || "0.00", ded: "", dedVal: "" },
          { earn: "Leave Encashment", earnVal: item.EL_Encashment || "0.00", ded: "", dedVal: "" },
          { earn: "Gross Earning", earnVal: Gross_Earnings || "0.00", ded: "Total Deductions", dedVal: item.Adoc_Deduction || "0.00" },
        ];

        let rowLineY = earningsDeductionStartY + 22;
        doc.font("Helvetica").fontSize(10);

        rows.forEach(row => {
          const isGrossRow = row.earn === "Gross Earning" || row.ded === "Total Deductions";
          doc.font(isGrossRow ? "Helvetica-Bold" : "Helvetica").fontSize(10);

          doc.text(row.earn, leftX, rowLineY);
          doc.text(row.earnVal, leftX + 180, rowLineY);
          doc.text(row.ded, rightX - 15, rowLineY);
          doc.text(row.dedVal, rightX + 180, rowLineY);
          rowLineY += 20;
        });


        // Draw vertical lines between columns
        const verticalLineOffset = 6; // how much higher you want to move it up
        const topY = earningsDeductionStartY - verticalLineOffset;
        const bottomY = earningsDeductionStartY + 25 + (rows.length * 18.5);

        // Vertical lines between: EARNINGS | AMOUNT | DEDUCTIONS | AMOUNT
        doc.moveTo(leftX + 160, topY).lineTo(leftX + 160, bottomY).stroke();     // Between EARNINGS and AMOUNT
        doc.moveTo(midX, topY).lineTo(midX, bottomY).stroke();     // Between AMOUNT and DEDUCTIONS
        doc.moveTo(rightX + 150, topY).lineTo(rightX + 150, bottomY).stroke();   // Between DEDUCTIONS and AMOUNT

        // HORIZONTAL LINES EARNINGS AMOUNT
        addY = 42;
        for (let i = 1; i <= 4; i++) {
          doc.moveTo(50, topY + addY).lineTo(550, topY + addY).stroke();
          addY += 20;
        };

        doc.lineWidth(2).strokeColor('#000000');
        doc.moveTo(50, topY + 122).lineTo(550, topY + 122).stroke();
        doc.moveTo(50, topY + 142).lineTo(550, topY + 142).stroke();

        // Reset line style for other normal table lines
        doc.lineWidth(1).strokeColor('black');


        // NET PAY SECTION
        doc.moveTo(50, topY + 162).lineTo(550, topY + 162).stroke();
        const lastRowY = topY + 42 + (6 * 20); // End of last horizontal line + extra space
        const netPayStartY = lastRowY + 7;   // Space after table

        // NET PAY SECTION
        doc.font("Helvetica-Bold");
        doc.text("NET PAY", 60, netPayStartY);
        doc.text("AMOUNT (Rs)", rightX + 160, netPayStartY);

        const amountX = rightX + 180; // Align all values under "AMOUNT"



        doc.font("Helvetica");
        doc.text("Gross Earning", 60, netPayStartY + 20);
        doc.text(Gross_Earnings || "0.00", amountX, netPayStartY + 20);

        doc.text("Total Deduction", 60, netPayStartY + 40);
        doc.text(item.Adoc_Deduction || "0.00", amountX, netPayStartY + 40);

        const Total_Net_pay = Math.round(Gross_Earnings - parseFloat(item.Adoc_Deduction));
        doc.font("Helvetica-Bold").text("Total Net Payable", 60, netPayStartY + 60);
        doc.text(Total_Net_pay || "0.00", amountX, netPayStartY + 60);


        // NET PAY HORIZONTAL LINES
        doc.lineWidth(2).strokeColor('#000000');
        doc.moveTo(50, lastRowY).lineTo(550, lastRowY).stroke();
        doc.moveTo(50, lastRowY + 20).lineTo(550, lastRowY + 20).stroke();
        // Reset line style for other normal table lines
        doc.lineWidth(1).strokeColor('black');

        doc.moveTo(50, lastRowY + 40).lineTo(550, lastRowY + 40).stroke();

        // NET PAY HORIZONTAL LINES
        doc.lineWidth(2).strokeColor('#000000');
        doc.moveTo(50, lastRowY + 60).lineTo(550, lastRowY + 60).stroke();
        //  doc.moveTo(50, lastRowY + 83 ).lineTo(550, lastRowY + 83  ).stroke();
        // Reset line style for other normal table lines
        doc.lineWidth(1).strokeColor('black');
        // vertical line Net Pay
        const amountColumnX = rightX + 150  // adjust 80 if needed based on text width
        const netPayBottomY = netPayStartY + 75; // height covering the section
        doc.moveTo(amountColumnX, netPayStartY - 6).lineTo(amountColumnX, netPayBottomY).stroke();


        doc.moveDown(1);

        const pageWidth = doc.page.width;
        const margin = 40;
        const usableWidth = pageWidth - margin * 2;

        // Amount in words (centered)


        doc.font("Helvetica").text(
          `${await self.convertToIndianRupeeWords(Total_Net_pay)} Only`,
          margin,
          undefined,
          { align: 'center', width: usableWidth }
        );

        // Draw line across full usable width
        doc
          .moveTo(margin, netPayStartY + 110)
          .lineTo(pageWidth - margin, netPayStartY + 110)
          .stroke();

        // Footer note (centered)
        doc.moveDown(2);
        doc.text(
          "This is a system-generated payslip and does not require a signature.",
          margin,
          undefined,
          { align: "center", width: usableWidth }
        );
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  

}


var self = (module.exports = new Obj());