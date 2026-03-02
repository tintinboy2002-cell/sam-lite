var leaveManagementDl = require(__base + "/dl/leaveManagementDl.js");
var authDl = require(__base + "/dl/authDl.js");
var validations = require(__base + "/validations/validation.js");
var emailUtils = require(__base + "/utils/emailUtils.js");
const moment = require("moment");

function Obj() {
  this.getAssignedLeaves = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    let user_id = user_details.user_id;
    let get_results = await leaveManagementDl.getAssignedLeaves(user_id);
    if (!_.isEmpty(get_results)) {
      response["status"] = "success";
      response["data"] = get_results;
    } else {
      response["status"] = "error";
      response["message"] = "No Data found";
    }
    return response;
  };

  this.applyLeave = async function (req, res) {
    let validationRuleObj = {
      start_date: "required",
      start_day_session: "required",
      end_date: "required",
      end_day_session: "required",
      reason_for_leave: "required",
      rule_id: "required",
    };
    let validationObj = req.body;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      let getHolidayCalender =
        await leaveManagementDl.getHolidayCalenderValidation(
          user_details,
          req.body
        );
      let getPersonalDetails = await leaveManagementDl.getUserData(
        user_details.org_id,
        user_details.user_id
      );
      if (!_.isEmpty(getPersonalDetails)) {
        if (_.isEmpty(getHolidayCalender)) {
          let getLeaveApplication =
            await leaveManagementDl.getLeaveApplyValidation(
              user_details,
              req.body
            );

          if (_.isEmpty(getLeaveApplication)) {
            let getWorkweekCalender =
              await leaveManagementDl.getWorkweekCalender(
                user_details,
                req.body
              );
            if (!_.isEmpty(getWorkweekCalender)) {
              let updateWorkWeekLeaveDetails =
                await self.countHolidayAndFullDays(
                  req.body,
                  getWorkweekCalender,
                  user_details,
                  req.body.rule_id
                );
              if (!_.isEmpty(updateWorkWeekLeaveDetails)) {
                let workweekresult =
                  await leaveManagementDl.updateWorkWeekLeaveDetails(
                    user_details,
                    updateWorkWeekLeaveDetails,
                    req.body
                  );
                let monthlyattendance =
                  await leaveManagementDl.monthlyAttendance(
                    updateWorkWeekLeaveDetails
                  );
                let results = await leaveManagementDl.applyLeave(
                  user_details,
                  req.body,
                  updateWorkWeekLeaveDetails
                );
                if (
                  !_.isEmpty(results) &&
                  !_.isEmpty(workweekresult) &&
                  !_.isEmpty(monthlyattendance)
                ) {
                  let sendmail = await self.Leaveapproval(
                    req.body,
                    user_details
                  );

                  response["status"] = "success";
                  response["message"] =
                    "Leave application submitted successfully.";
                } else {
                  response["status"] = "error";
                  response["message"] = "Leave application not submitted";
                }
              } else {
                response["status"] = "error";
                response["message"] = "Workweek Not Assigned.";
              }
            } else {
              response["status"] = "error";
              response["message"] = "Workweek Not Assigned.";
            }
          } else {
            response["status"] = "error";
            response["message"] = "You had already applied for this leave.";
          }
        } else {
          response["status"] = "error";
          response["message"] =
            "Leave cannot be applied as the selected dates fall on a holiday.";
        }
      } else {
        response["message"] = "You have not added personal information";
        response["status"] = "error";
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

  this.getEmployeeLogs = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    req.body.role_id = user_details.role_id;
    if (user_details.role_id < 3) {
      let getresults = await leaveManagementDl.getOrgEmployeeLogs(user_details);
      if (!_.isEmpty(getresults)) {
        response["status"] = "success";
        response["data"] = getresults;
      } else {
        response["status"] = "error";
        response["message"] = "No Data found";
      }
    } else {
      let getresults = await leaveManagementDl.getEmployeeLogs(user_details);
      if (!_.isEmpty(getresults)) {
        response["status"] = "success";
        response["data"] = getresults;
      } else {
        response["status"] = "error";
        response["message"] = "No Data found";
      }
    }
    return response;
  };

  this.getLeaveDetails = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    let getresults = await leaveManagementDl.getLeaveDetails(user_details);

    if (!_.isEmpty(getresults)) {
      const formattedData = getresults.map((row) => ({
        rule_id: row.rule_id,
        leave_type: row.leave_type,
        details: [
          { label: "Credited Leaves", value: row.credited_leaves },
          { label: "Total Leaves", value: row.total_leaves },
          { label: "Applied Leaves", value: row.applied_leaves },
          { label: "Penalty Deduction", value: row.penalty_deduction },
          { label: "Carry Forwards", value: row.carry_forward },
        ],
        balance: row.leave_balance,
      }));

      response["status"] = "success";
      response["data"] = formattedData;
    } else {
      response["status"] = "error";
      response["message"] = "No Data found";
    }

    return response;
  };

  this.updateLeaveDetails = async function (req, res) {
    let validationRuleObj = {
      credited_leaves: "required",
      applied_leaves: "required",
      carry_forwards: "required",
      rule_id: "required",
      user_id: "required",
    };
    let validationObj = req.body;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let results = await leaveManagementDl.updateLeaveDetails(req.body);
        if (!_.isEmpty(results)) {
          response["status"] = "success";
          response["message"] = "updated successfully.";
        } else {
          response["status"] = "error";
          response["message"] = "not updated";
        }
      } else {
        response["error"] = "error";
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

  this.getLeaveRules = async function (req, res) {
    let response = {};
    let user_details = authDl.getDecryptToken(req);
    req.body.org_id = user_details.org_id;
    let result = await leaveManagementDl.getLeaveRules(req.body);
    if (!_.isEmpty(result)) {
      response["status"] = "success";
      response["data"] = result;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

  this.createNewLeaveRule = async function (req, res) {
    let response = {};
    let validationrule = {
      rule_name: "required",
      rule_description: "required",
      leave_rule_type_id: "required",
      leaves_allowed_in_a_year: "required",
      weekends_between_leave: "required",
      holidays_between_leaves: "required",
      is_accrual: "required",
      accrual_frequency: "required",
      is_leave_encash: "required",
      is_all_leave_encashable: "required",
      is_carry_forward: "required",
      max_carry_forward_leaves: "required",
      max_leaves_allowed_in_month: "required",
      continuous_leaves_allowed: "required",
      max_leaves_encashable: "required",
      is_carry_all_remaining_leaves: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      req.body.user_id = user_details.user_id;
      req.body.org_id = user_details.org_id;
      if (user_details.role_id < 3) {
        let result = await leaveManagementDl.createNewLeaveRule(req.body);
        if (!_.isEmpty(result)) {
          response["status"] = "success";
          response["message"] = "Rule Created Successfully ";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Create New Rule ";
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

  this.updateLeaveRule = async function (req, res) {
    let response = {};
    let validationrule = {
      id: "required",
      rule_name: "required",
      rule_description: "required",
      leaves_allowed_in_a_year: "required",
      weekends_between_leave: "required",
      holidays_between_leaves: "required",
      is_accrual: "required",
      accrual_frequency: "required",
      is_leave_encash: "required",
      is_all_leave_encashable: "required",
      is_carry_forward: "required",
      max_carry_forward_leaves: "required",
      max_leaves_allowed_in_month: "required",
      continuous_leaves_allowed: "required",
      max_leaves_encashable: "required",
      is_carry_all_remaining_leaves: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      req.body.user_id = user_details.user_id;
      req.body.org_id = user_details.org_id;
      if (user_details.role_id < 3) {
        let result = await leaveManagementDl.updateLeaveRule(req.body);
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Rule Updates Successfully ";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Update New Rule ";
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

  this.deleteLeaveRule = async function (req, res) {
    let response = {};
    let validationrule = {
      rule_id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      req.body.user_id = user_details.user_id;
      req.body.org_id = user_details.org_id;
      const leaveRules = await leaveManagementDl.getLeaveRules(req.body);
      if (!_.isEmpty(leaveRules)) {
        if (user_details.role_id < 3) {
          let result = await leaveManagementDl.deleteLeaveRule(req.params);
          if (result.affectedRows > 0) {
            response["status"] = "success";
            response["message"] = "Rule Deleted Successfully ";
          } else {
            response["status"] = "error";
            response["message"] = "Failed to Delete New Rule ";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Not authorized";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Leave rule not exist";
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

  this.assignLeaveRulesToUsers = async function (req, res) {
    let response = {};
    let validationrule = {
      leaveRules: "required",
      users: "required",
      effectiveDate: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      req.body.user_id = user_details.user_id;
      req.body.org_id = user_details.org_id;
      if (user_details.role_id < 3) {
        let result = await leaveManagementDl.assignNewRulesToMultipleUsers(
          req.body
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Rules Assigned Successfully ";
        } else {
          response["status"] = "error";
          response["message"] = "Rules Already Exist";
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

  this.deleteAssignedLeaveRulesToUsers = async function (req, res) {
    let response = {};
    let validationrule = {
      user_id: "required",
      rule_id: "required",
    };
    let validationobj = req.query;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let result = await leaveManagementDl.deleteAssignedLeaveRulesToUsers(
          req.query
        );
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Removed Assigned Rule Successfully ";
        } else {
          response["status"] = "error";
          response["message"] = "Rules Not found";
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

  this.getAssignedRuleUsers = async function (req, res) {
    let response = {};
    let user_details = authDl.getDecryptToken(req);
    req.body.org_id = user_details.org_id;
    let result = await leaveManagementDl.getAssignedRuleUsers(req.body);
    if (!_.isEmpty(result)) {
      response["status"] = "success";
      response["data"] = result;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

  this.updateLeaveApplication = async function (req, res) {
    let response = {};
    let validationrule = {
      leave_application_id: "required",
      status: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let result;
        if (req.body.status === 0) {
          result =
            req.body.bulk === true
              ? await leaveManagementDl.bulkRejectLeaveApplication(
                  req.body,
                  user_details.user_name
                )
              : await leaveManagementDl.rejectLeaveApplication(
                  req.body,
                  user_details.user_name
                );

          let allEmailsSuccessful = true; // Track the status of all email updates

          for (const ids of req.body.leave_application_id) {
            let emailResult = await self.leaveUpdatemail(
              { leave_application_id: ids, status: 0 },
              user_details
            );
            if (emailResult.status !== "success") {
              allEmailsSuccessful = false;
            }
          }

          if (result.affectedRows > 0 && allEmailsSuccessful) {
            response["status"] = "success";
            response["message"] = "Rejected Leave Application";
          } else {
            response["status"] = "error";
            response["message"] =
              "Leave Application Not Found or Email Sending Failed";
          }
        } else {
          result =
            req.body.bulk === true
              ? await leaveManagementDl.bulkApproveLeaveApplication(
                  req.body,
                  user_details.user_name
                )
              : await leaveManagementDl.approveLeaveApplication(
                  req.body,
                  user_details.user_name
                );

          let allEmailsSuccessful = true; // Track the status of all email updates

          for (const ids of req.body.leave_application_id) {
            let emailResult = await self.leaveUpdatemail(
              { leave_application_id: ids, status: req.body.status },
              user_details
            );
            if (emailResult.status !== "success") {
              allEmailsSuccessful = false;
            }
          }

          if (result.affectedRows > 0 && allEmailsSuccessful) {
            response["status"] = "success";
            response["message"] = "Approved Leave Application";
          } else {
            response["status"] = "error";
            response["message"] =
              "Leave Application Not Found or Email Sending Failed";
          }
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

  this.countHolidayAndFullDays = async function (
    req,
    data,
    user_details,
    rule_id
  ) {
    const startDate = new Date(req.start_date);
    const endDate = new Date(req.end_date);

    let applied_leaves = 0;
    let penalty_deduction = 0;

    // Helper function to get all dates between startDate and endDate
    function getAllDates(startDate, endDate) {
      const dates = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate)); // Add the date
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }
      return dates;
    }

    // Helper function to get the week number of the month for a given date
    function getWeekNumber(date) {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const dayOfMonth = date.getDate();
      const dayOfWeek = firstDayOfMonth.getDay();
      return Math.ceil((dayOfMonth + dayOfWeek) / 7);
    }

    // Get all dates between the start and end dates
    const allDates = getAllDates(startDate, endDate);

    // Fetch weekend and holiday information
    let getWeekendsBetweenLeaves =
      await leaveManagementDl.getWeekendsBetweenLeaves(rule_id);
    let getHolidayCalender = await leaveManagementDl.getHolidayCalender(
      user_details
    );

    const weekendInfo = getWeekendsBetweenLeaves[0] || {};
    const { weekends_between_leave, holidays_between_leaves } = weekendInfo;

    // Extract holiday dates from the calendar
    const holidayDates = Array.isArray(getHolidayCalender)
      ? getHolidayCalender?.map(
          (holiday) => new Date(holiday.Date).toISOString().split("T")[0]
        )
      : [];

    // Iterate through each date
    allDates.forEach((date) => {
      const formattedDate = date.toISOString().split("T")[0]; // Format date as "YYYY-MM-DD"

      // Check if the current date is in the holiday calendar
      const isHolidayInCalendar = holidayDates.includes(formattedDate);

      // Get the day of the week for the current date (e.g., "Monday")
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

      // Get the week number of the month for the current date
      const weekNumber = getWeekNumber(date);

      // Find the corresponding row in the data
      const row = data?.find(
        (entry) => entry.day === dayOfWeek && entry.week == weekNumber
      );

      if (isHolidayInCalendar) {
        if (holidays_between_leaves === 0) {
          // Reduce applied_leaves and penalty_deduction for holidays in the calendar
          if (row?.is_working === "fullday" || row?.is_working === "holiday") {
            return;
          }
        } else if (holidays_between_leaves === 1) {
          penalty_deduction++; // Add penalty only
        }
        return; // Skip further processing for this date
      }

      if (row) {
        // If the entry is a "fullday", count it as an applied leave
        if (row.is_working === "fullday") {
          applied_leaves++;
        }

        // If the entry is a "holiday", count it as a penalty
        if (row.is_working === "holiday") {
          if (weekends_between_leave === 1) {
            penalty_deduction++;
          }
        }
      }
    });

    const monthlyLeaves = await self.splitMonthlyLeaves(
      req,
      applied_leaves,
      penalty_deduction,
      rule_id,
      user_details.user_id
    );
    return { applied_leaves, penalty_deduction, monthlyLeaves };
  };

  this.splitMonthlyLeaves = async function (
    req,
    applied_leaves,
    penalty_deduction,
    rule_id,
    user_id
  ) {
    const startDate = new Date(req.start_date);
    const endDate = new Date(req.end_date);

    // Extract month and year from startDate and endDate
    const startMonth = startDate.getMonth() + 1; // Months are 0-indexed in JS, so add 1
    const startYear = startDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const endYear = endDate.getFullYear();

    let monthlyLeaves = [];

    let remainingLeaves = applied_leaves;
    let remainingPenalties = penalty_deduction;

    let currentMonth = startMonth;
    let currentYear = startYear;

    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
      let daysInMonth;

      if (currentMonth === startMonth && currentYear === startYear) {
        // Start month: Only consider days from the start date
        daysInMonth =
          new Date(currentYear, currentMonth, 0).getDate() -
          startDate.getDate() +
          1;
      } else if (currentMonth === endMonth && currentYear === endYear) {
        // End month: Only consider days up to the end date
        daysInMonth = endDate.getDate();
      } else {
        // Full month in between
        daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      }

      // Allocate proportional leaves and penalties
      const monthLeaves = Math.min(remainingLeaves, Math.ceil(daysInMonth));
      const monthPenalties = Math.min(
        remainingPenalties,
        Math.ceil(daysInMonth)
      );

      monthlyLeaves.push({
        month: currentMonth,
        year: currentYear,
        applied_leaves: monthLeaves,
        penalty_leaves: monthPenalties,
        rule_id: rule_id,
        user_id: user_id,
      });

      // Deduct allocated values
      remainingLeaves -= monthLeaves;
      remainingPenalties -= monthPenalties;

      // Increment month and adjust year if needed
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    // Return the monthly split of leaves
    return monthlyLeaves;
  };

  this.getAccrualHistory = async function (req, res) {
    let response = {};
    let validationrule = {
      rule_id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      req.params.org_id = user_details.org_id;
      req.params.user_id = user_details.user_id;
      let result = await leaveManagementDl.getAccrualHistory(req.params);
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["message"] = "Accrual History Fetched";
        response["data"] = result;
      } else {
        response["status"] = "error";
        response["message"] = "Accrual History Not Found";
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

  this.getLeaveViewDetails = async function (req, res) {
    let response = {};
    let validationrule = {
      row_id: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      let result = await leaveManagementDl.getLeaveViewDetailsForAdmin(
        user_details,
        req.body.row_id
      );
      if (!_.isEmpty(result)) {
        response["status"] = "success";
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

  this.getLeaveDetailsByUserId = async function (req, res) {
    let response = {};
    let validationrule = {
      user_id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let result = await leaveManagementDl.getLeaveDetails(req.params);
        if (!_.isEmpty(result)) {
          const formattedData = result.map((row) => ({
            rule_id: row.rule_id,
            leave_type: row.leave_type,
            details: [
              { label: "Credited Leaves", value: row.credited_leaves },
              { label: "Total Leaves", value: row.total_leaves },
              { label: "Applied Leaves", value: row.applied_leaves },
              { label: "Penalty Deduction", value: row.penalty_deduction },
              { label: "Carry Forwards", value: row.carry_forward },
            ],
            balance: row.leave_balance,
          }));

          response["status"] = "success";
          response["data"] = formattedData;
        } else {
          response["status"] = "error";
          response["message"] = "No Data found";
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

  this.getAssignedLeavesByUserId = async function (req, res) {
    let response = {};
    let validationrule = {
      user_id: "required",
    };
    let validationobj = req.params;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let getresults = await leaveManagementDl.getAssignedLeaves(
          req.params.user_id
        );
        if (!_.isEmpty(getresults)) {
          response["status"] = "success";
          response["data"] = getresults;
        } else {
          response["status"] = "error";
          response["message"] = "No Data found";
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

  // LeaveBalanceReport  All Leaves
  this.getOrgLeaveSummary = async function (req) {
    let response = {};
    const user_details = await authDl.getDecryptToken(req);
    const org_id = user_details.org_id;

    const results = await leaveManagementDl.getAllUsersLeaveDetails(org_id);
    console.log("Leave records fetched:", results);

    if (!_.isEmpty(results)) {
      // Group data by user
      const grouped = _.groupBy(results, "user_id");

      const formattedData = Object.keys(grouped).map((user_id) => {
        const userRecords = grouped[user_id];
        return {
          user_id: userRecords[0].user_id,
          employee_id: userRecords[0].employee_id,
          employee_name: userRecords[0].employee_name,
          leaves: userRecords.map((row) => ({
            rule_id: row.rule_id,
            leave_type: row.leave_type,
            details: [
              { label: "Credited Leaves", value: row.credited_leaves },
              { label: "Total Leaves", value: row.total_leaves },
              { label: "Applied Leaves", value: row.applied_leaves },
              { label: "Penalty Deduction", value: row.penalty_deduction },
              { label: "Carry Forwards", value: row.carry_forward },
            ],
            balance: row.leave_balance,
          })),
        };
      });

      response["status"] = "success";
      response["data"] = formattedData;
    } else {
      response["status"] = "error";
      response["message"] = "No leave records found.";
    }

    return response;
  };

  this.deactivateLeaveApplication = async function (req, res) {
    let response = {};
    let validationrule = {
      leave_application_id: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let result = await leaveManagementDl.deactivateLeaveApplication(req.body);
      if (!_.isEmpty(result)) {
        response["status"] = "success";
        response["message"] = "Your leave has been deleted successfully.";
      } else {
        response["status"] = "error";
        response["message"] = "No leave record found to delete";
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

  this.Leaveapproval = async function (data, user_details) {
    const org_id = user_details.org_id;
    const user_id = user_details.user_id;
    let admin_data = await leaveManagementDl.getAdminData(org_id);
    let user_data = await leaveManagementDl.getUserData(org_id, user_id);
    let response = {};
    let subject = `Leave Application-${user_data[0].Name}`;
    let message = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Leave Application Pending Approval</title>
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
                  <div class="header">
                      <h2>Leave Application Pending Approval</h2>
                  </div>
                  <div class="content">
                      <h1>Hey {{adminName}},</h1>
                     <p>${user_data[0].Name} has applied for leave.</p>
                      <p><strong>Leave Type:</strong> ${data.leave_type}</p>
                      <p><strong>Leave Dates:</strong> ${data.start_date} to ${data.end_date}</p>
                      <p><strong>Reason for Leave:</strong> ${data.reason_for_leave}</p>
                      <p>Please click the link below to approve or reject the leave application:</p>
                     <p>
    <a href='${process.env.REACT_APP_API_URL}/login?redirect=/admin/leaves' class="click-link">Approve/Reject Leave</a>
</p>
                  
                  </div>
                  <div class="footer">
                      ${user_data[0].org_name}. All rights reserved.<br>
                      ${user_data[0].address}
                  </div>
              </div>
          </body>
          </html>
      `;

    try {
      for (let admin of admin_data) {
        console.log(admin, "admin");
        const admin_Email = admin.email;
        console.log(admin_Email, "admin_Email");
        const admin_Name = admin.username;
        let personalized_Message = message.replace("{{adminName}}", admin_Name);
        await emailUtils.sendEmail(admin_Email, subject, personalized_Message);
      }

      response["message"] =
        "Leave approval email sent successfully to all admins.";
      response["status"] = "success";
    } catch (error) {
      response["message"] = "Failed to send leave approval email.";
      response["status"] = "error";
    }

    return response;
  };

  this.leaveUpdatemail = async function (data, obj) {
    const response = {};

    try {
      const admin_data = await leaveManagementDl.getUserData(
        obj.org_id,
        obj.user_id
      );
      const getleaveData = await leaveManagementDl.getleaveData(data);
      const user_data = await leaveManagementDl.getUserData(
        obj.org_id,
        getleaveData[0].user_id
      );
      console.log(user_data, "user_data");
      console.log(admin_data, "admindata");
      // console.log(getleaveData, "getleaveData");
      const startDateLocal = moment(getleaveData[0].start_date)
        .utcOffset(330)
        .format("DD/MM/YYYY");
      const endDateLocal = moment(getleaveData[0].end_date)
        .utcOffset(330)
        .format("DD/MM/YYYY");
      const subject = `Leave Request Update`;
      const message = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Leave Application Status</title>
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
            margin: 5px 0;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        border-top: 1px solid #dddddd;
                        color: #999999;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h2>Leave Request Status</h2>
                    </div>
                    <div class="content">
                        <h1>Dear ${user_data[0].Name},</h1>
                        <p>Your leave request has been ${
                          data.status === 1 ? "Approved" : "Rejected"
                        } by ${admin_data[0].Name}.</p>
                        <p><strong>Leave Type:</strong> ${
                          getleaveData[0].leave_type
                        }</p>
                        <p><strong>Leave Dates:</strong> ${startDateLocal} to ${endDateLocal}</p>
                        <p><strong>No of Days:</strong> ${
                          getleaveData[0].total_leaves
                        } Days</p>
                        <p><strong>Reason for Leave:</strong> ${
                          getleaveData[0].reason
                        }</p>
                        <p><strong>Reason for Rejection:</strong> ${
                          getleaveData[0].status === "Rejected"
                            ? "None"
                            : "None"
                        }</p>
                        <p>Regards,</p>
                        <p><strong>${admin_data[0].org_name}</strong></p>
                        <p>${admin_data[0].Address}</p>
                    </div>
                    <div class="footer">
                        ${admin_data[0].org_name}. All rights reserved.<br>
                        ${admin_data[0].Address}
                    </div>
                </div>
            </body>
            </html>
        `;

      console.log(user_data[0].official_email_id, "user_data email");
      console.log(subject, "subject");
      console.log(message, "message");
      await emailUtils.sendEmail(
        user_data[0].official_email_id,
        subject,
        message
      );
      response["message"] = "Leave update email sent successfully.";
      response["status"] = "success";
    } catch (error) {
      response["message"] = "Failed to send leave update email.";
      response["status"] = "error";
    }

    return response;
  };
}

var self = (module.exports = new Obj());
