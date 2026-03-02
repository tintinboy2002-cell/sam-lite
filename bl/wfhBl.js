const { stat } = require("fs");
const _ = require("lodash");
var validations = require(__base + "/validations/validation.js");
var wfhDl = require(__base + "/dl/wfhDl.js");
var authDl = require(__base + "/dl/authDl.js");

function obj() {
  this.addWfhRequest = async function (req) {
    let response = {};

    let validationRuleObj = {
      request_type: "required|string",
      start_date: "required|date",
      end_date: "required|date",
      reason: "required|string",
    };

    let data = req.body;
    let isValid = await validations.validate(data, validationRuleObj);

    if (!isValid) {
      response.status = "error";
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0];
      response.message =
        global.errorMessage[key]?.message || "validation failed";
      return response;
    }

    //get logged-in user info
    let loggedInUser = authDl.getDecryptToken(req);
    if (!loggedInUser) {
      return { status: "error", message: "Unauthorized user" };
    }
    let user_id = loggedInUser.user_id;
    let org_id = loggedInUser.org_id;

    //calculate days difference 
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    //validation for date
    if (isNaN(startDate) || isNaN(endDate)) {
      return {
        status: "error",
        message: "Invalid date format",
      };
    }
    if (endDate < startDate) {
      return {
        status: "error",
        message: "End date cannot be before start date",
      };
    }
    const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    //prepare object for DL
    const wfhObj = {
      user_id,
      org_id,
      request_type: data.request_type,
      start_date: startDate,
      end_date: endDate,
      days,
      status: "Pending",
      reason: data.reason,
      created_by: user_id,
      updated_by: user_id,
    };

    //call DL to insert into DB
    const wfhRequest = await wfhDl.addWfhRequest(wfhObj);

    if (!_.isEmpty(wfhRequest)) {
      response.status = "success";
      response.message = "WFH Request submitted successfully";
      response.data = wfhRequest;
    } else {
      response.status = "error";
      response.message = "Failed to submit WFH Request";
    }
    return response;
  };

  //get api
  this.getWfhRequest = async function (req) {
    let response = {};

    let loggedInUser = authDl.getDecryptToken(req);
    let user_id = loggedInUser.user_id;
    let role_id = loggedInUser.role_id;

    if (role_id === 2 || role_id === 1) {
      const result = await wfhDl.getAdminWfhRequest();
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
      const result1 = await wfhDl.getWfhRequest(user_id);
      if (!_.isEmpty(result1)) {
        response["status"] = "success";
        response["data"] = result1;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    }

    return response;
  };

  //update(put edit)
  this.editWfhRequest = async function (req) {
    let response = {};

    let loggedInUser = authDl.getDecryptToken(req);
    
    let validationRuleObj = {
      id: "required",
      start_date: "required|date",
      end_date: "required|date",
      reason: "required|string",
    };

    let data = req.body;
    let isValid = await validations.validate(data, validationRuleObj);

    if (!isValid) {
      response.status = "error";
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0];
      response.message =
        global.errorMessage[key]?.message || "validation failed";
      return response;
    }
    const result = await wfhDl.editWfhRequest(data);
    if (!_.isEmpty(result)) {
      response["status"] = "success";
      response["data"] = result;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }

    return response;
  };

  //delete api
  this.removeWfhRequest = async function (req) {
    let response = {};

    let loggedInUser = authDl.getDecryptToken(req);
    //validations rules
    let validationRuleObj = {
      id: "required",
    };

    let data = {
      id: req.params.id,
    };
    let isValid = await validations.validate(data, validationRuleObj);

    if (!isValid) {
      response.status = "error";
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0];
      response.message =
        global.errorMessage[key]?.message || "validation failed";
      return response;
    }
    const result = await wfhDl.removeWfhRequest(data);
    if (!_.isEmpty(result)) {
      response["status"] = "success";
      response["data"] = result;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }

    return response;
  };
}

module.exports = new obj();
