var DashBoardDl = require(__base + "/dl/dashboardDl.js");
var authDl = require(__base + "/dl/authDl.js");
var validations = require(__base + "/validations/validation.js");
var emailUtils = require(__base + "/utils/emailUtils.js");
const axios = require("axios");

function Obj() {
  // Today Birthday List
  this.getTodayBirthdayList = async function (req) {
        let response = {};

        try {
            let user_details = await authDl.getDecryptToken(req);
            let org_id = user_details.org_id;

            let todayBirthdays = await DashBoardDl.getEmployeesBirthdayToday(org_id);
            let monthBirthdays = await DashBoardDl.getEmployeesBirthdayThisMonth(org_id);

            let today = new Date();
            let upcomingBirthdays = monthBirthdays.filter(emp => {
                let dob = new Date(emp.dob);
                return dob.getMonth() === today.getMonth() && dob.getDate() > today.getDate();
            });

            response.status = "success";
            response.data = {
                today: todayBirthdays,
                upcoming: upcomingBirthdays
            };

        } catch (err) {
            response.errors = global.errorMessage || {};
            let key = global.errorMessage && Object.keys(global.errorMessage).length > 0
                ? Object.keys(global.errorMessage)[0]
                : null;

            response.message =
                (key && global.errorMessage[key]?.message) ||
                err.message ||
                "Something went wrong";

            response.status = "error";
        }

        return response;
    };

  // Today Work Anniversary List
  this.getTodayWorkAnniversaryList = async function (req) {
    let response = {};

    try {
      let user_details = await authDl.getDecryptToken(req);
      let org_id = user_details.org_id;
      let employees = await DashBoardDl.getEmployeesWorkAnniversaryToday(
        org_id
      );

      if (!_.isEmpty(employees)) {
        response.status = "success";
        response.data = employees;
      } else {
        response.status = "error";
        response.message = "No work anniversaries today.";
      }
    } catch (err) {
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response.message =
        global.errorMessage[key]?.message ||
        err.message ||
        "Something went wrong";
      response.status = "error";
    }

    return response;
  };

  // New Joiners List
  this.getNewJoinersList = async function (req) {
    let response = {};

    try {
      let user_details = await authDl.getDecryptToken(req);
      let org_id = user_details.org_id;
      let employees = await DashBoardDl.getEmployeesNewJoiners(org_id);

      if (!_.isEmpty(employees)) {
        response.status = "success";
        response.data = employees;
      } else {
        response.status = "error";
        response.message = "No new joiners found.";
      }
    } catch (err) {
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response.message =
        global.errorMessage[key]?.message ||
        err.message ||
        "Something went wrong";
      response.status = "error";
    }

    return response;
  };

  // Add Quick Link
  this.addQuickLink = async function (req) {
    let response = {};
    let validationRuleObj = {
      title: "required|string|minLength:2|maxLength:255",
      url: "required|string",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);

      if (user_details.role_id !== 1 && user_details.role_id !== 2) {
        response["status"] = "error";
        response["message"] = "Not Authorized";
        return response;
      }

      const trimmedTitle = req.body.title.trim();
      if (/^\d+$/.test(trimmedTitle)) {
        response["status"] = "error";
        response["message"] = "Title cannot be only numbers.";
        return response;
      }
      let existing = await DashBoardDl.checkQuickLinkTitle(
        user_details.org_id,
        trimmedTitle
      );
      if (!_.isEmpty(existing)) {
        response["status"] = "error";
        response["message"] = "Title already exists in this organization.";
        return response;
      }

      let insertResult = await DashBoardDl.insertQuickLink({
        org_id: user_details.org_id,
        title: trimmedTitle,
        url: req.body.url,
        created_by: user_details.user_id,
      });

      if (insertResult && insertResult.affectedRows > 0) {
        response["status"] = "success";
        response["message"] = "Quick link added successfully.";
      } else {
        response["status"] = "error";
        response["message"] = "Failed to add quick link.";
      }
    } else {
      response["errors"] = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response["message"] =
        global.errorMessage[key]?.message || "Something went wrong";
      response["status"] = "error";
    }
    return response;
  };

  // Edit Quick Link
  this.editQuickLink = async function (req) {
    let response = {};
    let validationRuleObj = {
      id: "required|numeric",
      title: "required|string|minLength:2|maxLength:255",
      url: "required|string",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);

      if (user_details.role_id !== 1 && user_details.role_id !== 2) {
        response["status"] = "error";
        response["message"] = "Not Authorized";
        return response;
      }

      const trimmedTitle = req.body.title.trim();
      if (/^\d+$/.test(trimmedTitle)) {
        response["status"] = "error";
        response["message"] = "Title cannot be only numbers.";
        return response;
      }

      console.log(
        user_details.org_id,
        trimmedTitle,
        "user_details.org_id, trimmedTitle"
      );
      let existing = await DashBoardDl.checkQuickLinkTitle(
        user_details.org_id,
        trimmedTitle
      );
      if (!_.isEmpty(existing) && existing[0].id != req.body.id) {
        response["status"] = "error";
        response["message"] = "Title already exists in this organization.";
        return response;
      }

      let updateResult = await DashBoardDl.updateQuickLink({
        id: req.body.id,
        org_id: user_details.org_id,
        title: trimmedTitle,
        url: req.body.url,
        updated_by: user_details.user_id,
      });

      if (updateResult && updateResult.affectedRows > 0) {
        response["status"] = "success";
        response["message"] = "Quick link updated successfully.";
      } else {
        response["status"] = "error";
        response["message"] = "Failed to update quick link.";
      }
    } else {
      response["errors"] = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response["message"] =
        global.errorMessage[key]?.message || "Something went wrong";
      response["status"] = "error";
    }
    return response;
  };

  // Delete Quick Links
  this.deleteQuickLinks = async function (req) {
    let response = {};
    let validationRuleObj = {
      delete_links_ids: "required|array",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);

      if (user_details.role_id !== 1 && user_details.role_id !== 2) {
        response["status"] = "error";
        response["message"] = "Not Authorized";
        return response;
      }

      let deleteResult = await DashBoardDl.deleteQuickLinks(
        user_details.org_id,
        req.body.delete_links_ids
      );

      if (deleteResult && deleteResult.affectedRows > 0) {
        response["status"] = "success";
        response[
          "message"
        ] = `${deleteResult.affectedRows} quick link(s) deleted successfully.`;
      } else {
        response["status"] = "error";
        response["message"] = "No quick links deleted. Please check IDs.";
      }
    } else {
      response["errors"] = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response["message"] =
        global.errorMessage[key]?.message || "Something went wrong";
      response["status"] = "error";
    }
    return response;
  };

  // Quick Links List
  this.getQuickLinksList = async function (req) {
    let response = {};

    try {
      let user_details = await authDl.getDecryptToken(req);
      let quickLinks = await DashBoardDl.fetchQuickLinks(user_details.org_id);

      if (!_.isEmpty(quickLinks)) {
        response.status = "success";
        response.data = quickLinks;
      } else {
        response.status = "error";
        response.message = "No quick links found.";
      }
    } catch (err) {
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response.message =
        global.errorMessage[key]?.message ||
        err.message ||
        "Something went wrong";
      response.status = "error";
    }

    return response;
  };

  // Widget Panel List
  this.getWidgetPanelList = async function (req) {
    let response = {};

    try {
      let user_details = await authDl.getDecryptToken(req);
      let panels = await DashBoardDl.fetchWidgetPanelList(user_details.org_id);

      if (!_.isEmpty(panels)) {
        response.status = "success";
        response.data = {
          active_panels: panels.filter((p) => p.is_active === 1),
          inactive_panels: panels.filter((p) => p.is_active === 0),
        };
      } else {
        response.status = "error";
        response.message = "No widget panels found.";
      }
    } catch (err) {
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response.message =
        global.errorMessage[key]?.message ||
        err.message ||
        "Failed to fetch widget panels.";
      response.status = "error";
    }

    return response;
  };

  // Toggle Widget Active
  this.toggleWidgetActive = async function (req) {
    let response = {};
    let validationRuleObj = {
      id: "required|numeric",
      is_active: "required|numeric",
    };
    let validationObj = { ...req.body, ...req.params };
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);

      if (user_details.role_id !== 1 && user_details.role_id !== 2) {
        response["status"] = "error";
        response["message"] = "Not Authorized";
        return response;
      }
      let data = {
        id: req.params.id,
        org_id: user_details.org_id,
        is_active: req.body.is_active,
        updated_by: user_details.user_id,
      };

      let updated = await DashBoardDl.updateWidgetActive(data);

      if (updated && updated.affectedRows > 0) {
        response["status"] = "success";
        response["message"] = "Widget status updated successfully";
      } else {
        response["status"] = "error";
        response["message"] = "Widget not found or no changes applied";
      }
    } else {
      response["errors"] = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response["message"] =
        global.errorMessage[key]?.message || "Something went wrong";
      response["status"] = "error";
    }
    return response;
  };

  // Update Widget Order
  this.updateWidgetOrder = async function (req) {
    let response = {};
    let validationRuleObj = {
      widget_order: "required|array",
      "widget_order.*.id": "required|integer",
      "widget_order.*.order": "required|integer",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      try {
        let data = {
          org_id: user_details.org_id,
          user_id: user_details.user_id,
          widget_order: req.body.widget_order,
        };

        await DashBoardDl.updateWidgetOrder(data);

        response["status"] = "success";
        response["message"] = "Widget order updated successfully";
      } catch (err) {
        console.error("Error in updateWidgetOrder:", err);
        response["status"] = "error";
        response["message"] = "Failed to update widget order.";
      }
    } else {
      response["errors"] = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response["message"] =
        global.errorMessage[key]?.message || "Something went wrong";
      response["status"] = "error";
    }
    return response;
  };

  // Upcoming Festivals
  this.getUpcomingFestivals = async function (req) {
    let response = {};

    try {
      let user_details = await authDl.getDecryptToken(req);
      let festivals = await DashBoardDl.getUpcomingFestivalsByOrg(
        user_details.org_id
      );

      if (!_.isEmpty(festivals)) {
        response.status = "success";
        response.data = festivals;
      } else {
        response.status = "error";
        response.message = "No upcoming festivals found.";
      }
    } catch (err) {
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response.message =
        global.errorMessage[key]?.message ||
        err.message ||
        "Something went wrong";
      response.status = "error";
    }

    return response;
  };

  // Send Birthday Mail
  this.sendBirthdayMail = async function (req) {
    let response = {};
    let validationRuleObj = {
      receiver_email: "required|email",
      message: "required|string",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      try {
        let user_details = await authDl.getDecryptToken(req);
        let sender = await DashBoardDl.getUserEmailById(user_details.user_id);

        if (_.isEmpty(sender) || !sender.email) {
          response["status"] = "error";
          response["message"] = "Sender email not found.";
          return response;
        }

        let subject = `🎂 Birthday Wishes from ${sender.username || "Team"}`;
        await emailUtils.sendEmail(
          req.body.receiver_email,
          subject,
          req.body.message
        );

        response["status"] = "success";
        response["message"] = "Birthday email sent successfully.";
      } catch (err) {
        console.error("Error in sendBirthdayMail:", err);
        response["status"] = "error";
        response["message"] = "Failed to send birthday email.";
      }
    } else {
      response["errors"] = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response["message"] =
        global.errorMessage[key]?.message || "Something went wrong";
      response["status"] = "error";
    }
    return response;
  };

  // Today Leave Members
  this.getTodayLeaveMembers = async function (req) {
    let response = {};

    try {
      let user_details = await authDl.getDecryptToken(req);
      let membersOnLeave = await DashBoardDl.getTodayLeaveMembersByOrg(
        user_details.org_id
      );

      if (!_.isEmpty(membersOnLeave)) {
        response.status = "success";
        response.data = membersOnLeave;
      } else {
        response.status = "error";
        response.message = "No members on leave today.";
      }
    } catch (err) {
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response.message =
        global.errorMessage[key]?.message ||
        err.message ||
        "Something went wrong";
      response.status = "error";
    }

    return response;
  };

  this.getDailyThought = async function (req) {
    let response = {};

    try {
      let user_details = await authDl.getDecryptToken(req);

      // Fetch from internet
      let apiRes = await axios.get("https://zenquotes.io/api/today");
      let thought = apiRes.data[0];

      if (thought && thought.q) {
        response.status = "success";
        response.data = {
          thought: thought.q,
          author: thought.a,
          source: "ZenQuotes",
        };
      } else {
        response.status = "error";
        response.message = "No thought available for today.";
      }
    } catch (err) {
      response.errors = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0] || null;
      response.message =
        global.errorMessage[key]?.message ||
        err.message ||
        "Failed to fetch daily thought.";
      response.status = "error";
    }

    return response;
  };
}

var self = (module.exports = new Obj());
