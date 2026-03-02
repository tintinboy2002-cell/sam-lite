var configDl = require(__base + "/dl/configDl.js");
var authDl = require(__base + "/dl/authDl.js");
var validations = require(__base + "/validations/validation.js");

function Obj() {
  this.createRole = async (req, res) => {
    let response = {};
    let validationrule = {
      role_name: "required",
      description: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let isRoleExist = await configDl.isRoleExist(req.body);
        req.body.org_id = user_details.org_id;
        if (_.isEmpty(isRoleExist)) {
          let result = await configDl.createRole(req.body);
          if (result.affectedRows > 0) {
            response["status"] = "success";
            response["message"] = "role created successfully";
          } else {
            response["status"] = "error";
            response["message"] = "Something went wrong";
          }
        } else {
          response["status"] = "error";
          response["message"] = "role already exist";
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

  this.getRoles = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id < 3) {
      let getresults = await configDl.getRoles(user_details.org_id);
      if (!_.isEmpty(getresults)) {
        response["status"] = "success";
        response["data"] = getresults;
      } else {
        response["status"] = "error";
        response["message"] = "no data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not authorized";
    }
    return response;
  };

  this.updateRole = async (req, res) => {
    let response = {};
    let validationrule = {
      role_id: "required",
      role_name: "required",
      description: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let isRoleExist = await configDl.isRoleExist(req.body);
        req.body.org_id = user_details.org_id;
        if (!_.isEmpty(isRoleExist)) {
          let result = await configDl.updateRole(req.body);
          if (result.affectedRows > 0) {
            response["status"] = "success";
            response["message"] = "role updated successfully";
          } else {
            response["status"] = "error";
            response["message"] = "role not found";
          }
        } else {
          response["status"] = "error";
          response["message"] = "role not found";
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


  this.deleteRole = async (req, res) => {
    let response = {};
    let validationrule = {
      role_id: "required"
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let isRoleExist = await configDl.isRoleExist(req.body);
        req.body.org_id = user_details.org_id;
        if (!_.isEmpty(isRoleExist)) {
          let result = await configDl.deleteRole(req.body);
          if (result.affectedRows > 0) {
            response["status"] = "success";
            response["message"] = "role deleted successfully";
          } else {
            response["status"] = "error";
            response["message"] = "role not found";
          }
        } else {
          response["status"] = "error";
          response["message"] = "role not found";
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
}

var self = (module.exports = new Obj());
