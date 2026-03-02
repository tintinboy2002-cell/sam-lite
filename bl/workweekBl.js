var workweekDl = require(__base + "/dl/workweekDl.js");
var authDl = require(__base + "/dl/authDl.js");
var emailUtils = require(__base + "/utils/emailUtils.js");
var validations = require(__base + "/validations/validation.js");

function Obj() {
  this.createWorkWeekRule = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let response = {};
    let validationRuleObj = {
      ruleName: "required|maxLength:25",
      description: "required|string|maxLength:25",
    };
    let validationObj = req.body;

    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let org_id = user_details.org_id;
      if (user_details.role_id < 3) {
        let workrule = await workweekDl.createWorkWeekRule(org_id, req.body);
        if (!_.isEmpty(workrule)) {
          response["status"] = "success";
          response["message"] = "work rule has been created";
        } else {
          response["status"] = "error";
          response["message"] = "Error in creating work rule ";
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

  this.assignWorkWeek = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      usersID: "required",
      ruleID: "required",
      date: "required",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let org_id = user_details.org_id;
        let admin_user_id = user_details.user_id;
        let rule_assigned_status = await workweekDl.checkIfRuleAssigned(
          req.body,
          org_id
        );
        if (_.isEmpty(rule_assigned_status)) {
          let rule_assigned = await workweekDl.assignWorkWeek(org_id, req.body);
          if (!_.isEmpty(rule_assigned)) {
            let admin_data = await authDl.getAdminData(org_id, admin_user_id);
            let user_data = await authDl.getUserdata(org_id, req.body);
            let emailResults = [];
            for (let i = 0; i < user_data.length; i++) {
              let user = user_data[i];
              let send_Email = await self.workWeekEmail(user, admin_data);
              emailResults.push(send_Email);
            }
            let allEmailsSent = emailResults.every(
              (result) => result.status === "success"
            );

            if (allEmailsSent) {
              response["status"] = "success";
              response["message"] =
                "Workweek rule assigned and emails sent successfully.";
            } else {
              response["status"] = "error";
              response["message"] =
                "Error in sending emails after rule assignment.";
            }
          } else {
            response["status"] = "error";
            response["message"] =
              "Something went wrong while assigning the rule.";
          }
        } else {
          response["status"] = "error";
          response["message"] =
            "Rule has already been assigned to user Delete the exisiting rule ";
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

  this.deleteWorkWeek = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      ruleId: "required",
    };
    let validationObj = req.query;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let org_id = user_details.org_id;
        let ruleId = req.query.ruleId;
        let intRuleId = parseInt(ruleId, 10);
        let check_rule_assigned = await workweekDl.checkUserWorkWeek(
          org_id,
          ruleId
        );
        if (_.isEmpty(check_rule_assigned)) {
          let delete_work_week = await workweekDl.deleteWorkWeek(
            org_id,
            intRuleId
          );
          if (!_.isEmpty(delete_work_week)) {
            response["status"] = "success";
            response["message"] = "Successfully deleted";
          } else {
            response["status"] = "error";
            response["message"] = " failed to delete rule";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Not authorized";
        }
      } else {
        response["status"] = "error";
        response["message"] =
          "This rule has been assigned to user Unassigned before deleting it";
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

  this.deleteUserRule = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      userId: "required",
      work_week_rule_id: "required",
    };
    let validationObj = req.query;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let org_id = user_details.org_id;
        let userId = req.query.userId;
        let work_week_ruleId = req.query.work_week_rule_id;
        let data = { org_id, userId, work_week_ruleId };
        let results = await workweekDl.deleteUserRule(data);
        if (!_.isEmpty(results) && results.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Work week rule removed successsfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to remove the rule";
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

  this.updateRules = async function (req, res) {
    let response = {};

    let validationRuleObj = {};
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let results = await workweekDl.updateRules(req.body);
        if (!_.isEmpty(results)) {
          response["status"] = "success";
          response["message"] = "Rules updated successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Error while updating rules";
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

this.getUsersAndRules = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let getresults = await workweekDl.getUsersAndRules(org_id);
    if (!_.isEmpty(getresults)) {
      response["status"] = "success";
      response["data"] = getresults;
    } else {
      response["status"] = "error";
      response["message"] = "No data found ";
    }
    return response;
  };

   this.getWorkWeekRules = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let getresults = await workweekDl.getWorkWeekRules(org_id);
    if (!_.isEmpty(getresults)) {
      response["status"] = "success";
      response["data"] = getresults;
    } else {
      response["status"] = "error";
      response["message"] = "No Data found";
    }
    return response;
  };

  this.getUserWorkWeekRule = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let response = {};
     let validationRuleObj = {
      user_id:"required"
    };
    let validationObj = req.params;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
    let org_id = user_details.org_id;
    let user_id = req.params.user_id;
    let data = { org_id, user_id };
    let results = await workweekDl.getUserWorkWeekRule(data);
    if (!_.isEmpty(results)) {
      response["status"] = "success";
      response["data"] = results;
    } else {
      response["status"] = "error";
      response["message"] = "No data Found";
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

  this.workWeekEmail = async function (obj, data) {
    let response = {};
    let subject = "Workweek Assigned";
    let message = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Workweek Assigned</title>
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
                    <h1>${obj[0].username},</h1>
                    <p>Workweek has been assigned to you by ${data[0].username}.</p>
                    <p><a href="https://sam.nubaxdatalabs.com//login" class="click-link">Click</a> here to view details.</p>
                    <p>If you have any questions, please feel free to reach out.</p>
                </div>
                <div class="footer">
                    ${obj[0].org_name}. All rights reserved.<br>
                    ${obj[0].Address}
                </div>
            </div>
        </body>
        </html>`;

    try {
      await emailUtils.sendEmail(obj[0].email, subject, message);
      response["message"] = "Workweek assignment email sent successfully.";
      response["status"] = "success";
    } catch (error) {
      response["message"] = "failed to send Email";
      respone["status"] = "error";
    }

    return response;
  };

  this.getWorkWeekOrgCalender = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let response = {};
     let validationRuleObj = {
      id:"required"
    };
    let validationObj = req.params;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      if(user_details.role_id<3){
    let configId = req.params.id;
   let configdata = await workweekDl.getWorkWeekOrgCalender(configId);
    if (!_.isEmpty(configdata)) {
      response["status"] = "success";
      response["data"] = configdata;
    } else {
      response["status"] = "error";
      response["message"] = "rule has not being created";
    }
    }else{
    response["status"]="error";
    response["message"]="Not authorized";
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

  this.getorgworkweekrule = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let response = {};
    let org_id = user_details.org_id;
    if(user_details.role_id<3){
    let getworkweekrule = await workweekDl.getorgworkweekrule(org_id);
    if (!_.isEmpty(getworkweekrule)) {
      response["status"] = "success";
      response["data"] = getworkweekrule;
    } else {
      response["status"] = "error";
      response["message"] = "Error in fetching data";
    }
    }else{
    response["status"]="error";
    response["message"]="Not authorized";
  }
    return response;
  };
  
}
var self = (module.exports = new Obj());
