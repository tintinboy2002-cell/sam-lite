const uploadToGCP = require("../utils/uploadToGCP");

var authDl = require(__base + "/dl/authDl.js");
var holidayDl = require(__base + "/dl/holidayDl.js");
var validations = require(__base + "/validations/validation.js");

function Obj() {
  this.addHoliday = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      holiday_date: "required",
      holiday_description: "required",
      holiday_subject: "required",
      body_description: "required"
    };
    let validationObj = req.body;

    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      let org_id = user_details.org_id;
      let check_holiday = await holidayDl.checkHoliday(org_id, req.body);

      if (_.isEmpty(check_holiday)) {
        const imageUrl = await uploadToGCP(req.file);
        req.body.image = imageUrl;
        let results = await holidayDl.addHoliday(org_id, req.body);
        if (!_.isEmpty(results)) {
          response["status"] = "success";
          response["message"] = "Holiday has been added";
        } else {
          response["status"] = "error";
          response["message"] = "error in adding data";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Holiday for this date already exist ";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not authorized";
    }

    if (!isValid) {
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

  this.updateHoliday = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      id: "required",
      holiday_date: "required",
      holiday_description: "required",
      holiday_subject: "required",
      body_description: "required"
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        if (req.file) {
          const imageUrl = await uploadToGCP(req.file);
          req.body.image = imageUrl;
        }
        let org_id = user_details.org_id;
        let results = await holidayDl.updateHoliday(org_id, req.body);
        if (!_.isEmpty(results)) {
          response["status"] = "success";
          response["message"] = "Holiday Updated Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "error while updating holiday";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not authorized";
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

  this.getHolidays = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let get_Holidays = await holidayDl.getHolidays(org_id);
    if (!_.isEmpty(get_Holidays)) {
      response["status"] = "success";
      response["data"] = get_Holidays;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

  this.deleteHolidays = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      id: "required",
    };
    let validationObj = req.query;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let org_id = user_details.org_id;
        let holiday_Id = parseInt(req.query.id, 10);
        let data = { org_id, holiday_Id };
        let results = await holidayDl.deleteHolidays(data);
        if (!_.isEmpty(results)) {
          response["status"] = "success";
          response["message"] = "Deleted successfully";
        } else {
          response["status"] = "error";
          response["messasge"] = "Error occured";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not authorized";
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
}
var self = (module.exports = new Obj());
