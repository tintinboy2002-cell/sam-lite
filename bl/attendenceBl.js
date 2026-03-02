var attendenceDl = require(__base + "/dl/attendenceDl.js");
var authDl = require(__base + "/dl/authDl.js");
const moment = require("moment");
const cron = require("node-cron");
var validations = require(__base + "/validations/validation.js");

function obj() {
  this.clockIn = async function (req, res) {
    let user_details = authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let user_id = user_details.user_id;
    let response = {};
     let work_week_res=await authDl.checkWorkWeekAssigned(user_id);
    if(!_.isEmpty(work_week_res)){
    let date = moment().format("YYYY-MM-DD");

     const clockin_time = moment().format("dddd HH:mm:ss");
    const epoch_time = moment(clockin_time, "dddd h:mm:ss").unix(); let data = {
      org_id,
      user_id,
       epoch_time,
      date,
      status: "Present",
    };
   
     let is_clockin = await attendenceDl.checkClockin(data);
    if (_.isEmpty(is_clockin)) {
      let result1 = await attendenceDl.monthlyLogs(data);
      let result2 = await attendenceDl.clockInEvent(data);
      if (result1.affectedRows>0 && result2.affectedRows>0) {
        response["status"] = "success";
        response["message"] = "Clocked-In";
      } else {
        response["status"] = "error";
        response["message"] = "Failed to clock-In";
      }
    } else {
      let result1 = await attendenceDl.clockInEvent(data);
      if (result1.affectedRows>0) {
        response["status"] = "success";
        response["message"] = "Clocked-In.";
      } else {
        response["status"] = "error";
        response["message"] = "Failed to clock-In.";
      }
    }
     }else{
    response["status"]='error';
    response["message"]="work week has not been assigned";
  }

    return response;
  };

  this.clockOut = async function (req, res) {
    let user_details = authDl.getDecryptToken(req);
    let response = {};
    const user_id = user_details.user_id;
    let date = moment().format("YYYY-MM-DD");
    let data = { user_id, date };
     const clockout_time = moment().format("dddd HH:mm:ss");
    const epoch_time = moment(clockout_time, "dddd h:mm:ss").unix();
    let get_clockin_time = await attendenceDl.getClockInTime(data);
    console.log(get_clockin_time, "get_clockin_time");
    if (!_.isEmpty(get_clockin_time)) {
      const clockin_epoch = get_clockin_time[0].clock_In;
      const duration = epoch_time - clockin_epoch;
      const total_minutes = Math.floor(duration / 60);
      const formatted_duration = `${total_minutes} m`;
     console.log(
        formatted_duration,
        "formatted_duration",
      );
      let user = await attendenceDl.clockOutevent(
        data,
        epoch_time,
        formatted_duration
      );

      if (!_.isEmpty(user)) {
       
        let get_all_logs = await attendenceDl.getdaylogs(user_id);
        console.log(get_all_logs, "get_all_logs");
        const hours = Math.floor(get_all_logs[0].total_duration / 60);
        const minutes = get_all_logs[0].total_duration % 60;
        const formatted_duration = `${hours} h ${minutes} m`;
        const total_minutes = get_all_logs[0].total_duration;
        let org_id = user_details.org_id;
          let last_clock_out = get_all_logs[0].last_clock_out;
        let work_week_Id = await attendenceDl.getWorkWeekId(user_id);
        let is_working = await attendenceDl.checkIsWorking(date, work_week_Id);
        let is_holiday = await attendenceDl.checkHoliday(org_id, date);
        let is_leave_applied = await attendenceDl.isLeaveApplied(date, user_id);

        let dataToUpdate = {
         last_clock_out,
          total_minutes,
          user_id,
          org_id,
          formatted_duration,
        };

        // Set default status
        let status = "Absent";

        if (hours < 4) {
           if (!_.isEmpty(is_holiday)) {
            status = "Absent";
          } else if (is_working[0].is_working !== "holiday") {
            if (!_.isEmpty(is_leave_applied)) {
              status = "Absent";
            } else {
              status = "on-break";
            }
          } else {
            status = "Absent";
          }
        } else if (hours >= 8) {
            if (!_.isEmpty(is_holiday)) {
            status = "Present";
          } else {
           if (is_working[0].is_working !== "holiday") {
              if (!_.isEmpty(is_leave_applied)) {
                status = "Present";
              } else {
                status = "Present";
              }
            } else {
              status = "Present";
            }
          }
        } else if (hours >= 4 && hours < 8) {
          if (!_.isEmpty(is_holiday)) {
            status = "Present";
          } else {
            if (is_working[0].is_working !== "holiday") {
              if (!_.isEmpty(is_leave_applied)) {
                status = "Present";
              } else {
                status = "on break";
              }
            } else {
              status = "Present";
            }
          }
        }

        dataToUpdate.status = status;
         let update_monthly_logs = await attendenceDl.updateMonthlyLog(     
          dataToUpdate
        );
      if (update_monthly_logs.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Clocked out successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to clock out logs";
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

  // this.orgusersAttendence = async function (req, res) {
  //   let user_details = await getDecryptToken(req);
  //   let org_id = user_details.org_id;
  //   let response = {};
  //   let result = await orgusersAttendence.attendenceDl(org_id);
  //   if (!_.isEmpty(result)) {
  //     response["status"] = "success";
  //     response["data"] = users;
  //   } else {
  //     response["status"] = "error";
  //     response["message"] = "No data found";
  //   }
  //   return response;
  // };

 this.getClockInTime = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    
    let user_id = user_details.user_id;
    let date = moment().format("YYYY-MM-DD");
    let response = {};
    let data = { user_id, date };
    let result = await attendenceDl.getClockInTime(data);
    if (!_.isEmpty(result)) {
      let last_Clock_In = result.sort((a, b) => b.clock_In - a.clock_In)[0];
      response["status"] = "success";
         response["data"] = last_Clock_In.clock_In;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

  this.dailyLogs = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let user_id = user_details.user_id;
    let role_id = user_details.role_id;

    let response = {};
    let date = moment().format("YYYY-MM-DD");
    let data = { org_id, user_id, date };
   let daily_logs_data;

    if (role_id === 2 || role_id === 1) {
     daily_logs_data = await attendenceDl.orgDailyLogs(org_id);
    } else if (role_id === 3) {
     daily_logs_data = await attendenceDl.getDailyLogs(data);
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
      return response;
    }
     if (!_.isEmpty(daily_logs_data)) {
      response["status"] = "success";
       response["data"] = daily_logs_data;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }

    return response;
  };

   this.monthlyLogs = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let user_id = user_details.user_id;
    let role_id = user_details.role_id;
    let response = {};
    let data = { org_id, user_id };
     let get_monthly_logs;

    if (role_id === 2) {
      get_monthly_logs = await attendenceDl.orgMonthlyLogs(org_id, req.body);
    } else if (role_id === 3) {
       get_monthly_logs = await attendenceDl.getMonthlyLogs(data, req.body);
    } else {
      response["status"] = "error";
      response["message"] = "Unauthorized role.";
      return response;
    }
   if (!_.isEmpty(get_monthly_logs)) {
      response["status"] = "Success";
        response["data"] = get_monthly_logs;
    } else {
      response["status"] = "error";
      response["message"] = "Failed to fetch monthly logs.";
    }
    return response;
  };


    this.updateUserAttendanceTime = async function (req, res) {
    let validationRuleObj = {
    formatted_date: "required",
        formatted_clockin:"required",
      formatted_clockout:"required",
      user_id:"required"
    };
    let validationObj = req.body;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      const {  formatted_clockin, formatted_clockout, formatted_date, user_id } =
        req.body;

      const [day, month, year] = formatted_date.split("/");
     const new_date = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;

       const epoch_in_time = moment(formatted_clockin, "dddd HH:mm:ss").unix();
      const epoch_out_time = moment(formatted_clockout, "dddd HH:mm:ss").unix();
      let total_seconds = epoch_out_time - epoch_in_time;
      let minutes = Math.floor(total_seconds / 60);
      let total_hours = Math.floor(total_seconds / 3600);
      let total_minutes = Math.floor((total_seconds % 3600) / 60);
      const formatted_duration = `${total_hours} h ${total_minutes} m`;
      let hours = Math.floor(Math.abs(total_seconds) / 3600);
       let status = "Absent";
      if (hours >= 8) {
        status = "Present";
       } else if (hours >= 4 && hours < 8) {
        status = "Half day";
      }
      data = {
        epoch_in_time,
        epoch_out_time,
        formatted_duration,
        user_id,
        new_date,
        minutes,
        status
      };
     let updateusertime = await attendenceDl.updateUserAttendanceTime(data);
      if (!_.isEmpty(updateusertime)) {
        response["status"] = "success";
        response["message"] = "updated successfully";
      } else {
        response["status"] = "error";
        response["message"] = "Error in updating time";
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

  //daily logs download 
  this.getDownloadById = async function (req) {
    try {
      let user_details = await authDl.getDecryptToken(req);
      let { user_id, org_id, role_id } = user_details; 
      let result;
      if (role_id < 3) {
        result = await attendenceDl.getDownloadByAdmin(org_id);
      }
      else {
        result = await attendenceDl.getDownloadById(user_id);
      }
      if (_.isEmpty(result)) {
        return { status: "error", message: "No records found for today" };
      }
      return {
        status: "success",
        message: "daily logs",
        data: result,
      };
    } catch (err) {
      console.error("Error", err);
      return { status: "error", message: "Something went wrong", error: err.message };
    }
  };
 
  //historical logs download 
  this.getDownloadMonthLog = async function (req, data) {
    try {
      let user_details = await authDl.getDecryptToken(req);
      let user_id = user_details.user_id;
      let org_id = user_details.org_id;
      let role_id = user_details.role_id;
      let result;
      if (role_id < 3) {
        result = await attendenceDl.getDownloadMonthlyByAdmin(org_id, data);
      }
      else {
        result = await attendenceDl.getDownloadMonthlyLog(user_id, data);
      }
      return {
        status: "success",
        message: "Monthly logs",
        data: result,
      };
    } catch (err) {
      console.error("Error in getDownloadById:", err);
      return { status: "error", message: "Something went wrong", error: err.message };
    }
  };


   ////////////////////////////Raise Attendance Approval Issue Module End////////////////////////////////////////
  // //get forget clockout 
  this.getForgotClockRecords = async function (req) {
    let user_details = await authDl.getDecryptToken(req);
    let { org_id, user_id } = user_details;
    let yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
    let records = await attendenceDl.getForgotClockRecords({
      org_id,
      user_id,
      yesterday
    });
    return { status: "success", data: records };
  };


  //raiseeeissueeForAprovall======
  this.raiseIssue = async function (req) {
    let user_details = await authDl.getDecryptToken(req);
    let { user_id, org_id } = user_details;
    let { date, clock_in_time, clock_out_time, reason } = req.body;

    if (!date || !reason) {
      return { status: "error", message: "date and reason are required" };
    }
    if (!clock_in_time || !clock_out_time) {
      return { status: "error", message: "Both clock-in and clock-out times are required" };
    }

    let clockInEpoch = moment(`${date} ${clock_in_time}`, "YYYY-MM-DD HH:mm").unix();
    let clockOutEpoch = moment(`${date} ${clock_out_time}`, "YYYY-MM-DD HH:mm").unix();
    let data = {
      user_id,
      org_id,
      date,
      clock_in_epoch: clockInEpoch,
      clock_out_epoch: clockOutEpoch,
      reason
    };
    await attendenceDl.insertRaiseIssue(data);
    return { status: "success", message: "Request raised successfully" };
  };


  //listapprovals=======
  this.getPendingIssues = async function (req) {
    const user_details = await authDl.getDecryptToken(req);
    const { role_id } = user_details;

    if (role_id !== 1 && role_id !== 2) {
      return { status: "error", message: "Unauthorized: Only admins can view pending issues" };
    }
    const pendingIssues = await attendenceDl.getPendingIssues();
    return { status: "success", data: pendingIssues };
  };


  //approve/reject issue request===========
this.approveOrRejectIssue = async (req) => {
    const { issue_id, action } = req.body;

    if (!issue_id || !action) {
      return { status: "error", message: "issue_id, action are required" };
    }

    // get approver info
    let approver_details = await authDl.getDecryptToken(req);
    let approver_id = approver_details.user_id;

    // fetch issue details
    const issue = await attendenceDl.getIssueById(issue_id);
    if (!issue) {
      return { status: "error", message: "Request not found" };
    }
    console.log(issue);

    if (issue.status !== "PENDING") {
      return { status: "error", message: "Request already processed" };
    }

    if (action === "REJECT") {
      await attendenceDl.updateIssueStatus(issue_id, "REJECTED", approver_id);
      return { status: "success", message: "Request rejected" };
    }

    if (action === "APPROVE") {
      const { user_id, org_id, date, clock_in_epoch, clock_out_epoch } = issue;

      if (!clock_in_epoch || !clock_out_epoch) {
        return { status: "error", message: "Clock in/out times are required for approval" };
      }
      // calculation
      let total_seconds = clock_out_epoch - clock_in_epoch; // use clock_out_epoch here
      let total_minutes = Math.floor(total_seconds / 60);
      let total_hours = Math.floor(total_seconds / 3600);
      let minutes = total_minutes % 60;
      const formatted_duration = `${total_hours} h ${minutes} m`;

      // update attendance
      await attendenceDl.updateMonthlyRecord({
        org_id,
        user_id,
        date,
        clock_in_epoch,
        clock_out_epoch,
        total_minutes,
        total_hours: formatted_duration,
        status: "Present",
      });
      // update issue as approved
      await attendenceDl.updateIssueStatus(issue_id, "APPROVED", approver_id);
      return {
        status: "success",
        message: "Request approved and attendance updated",
        data: {
          org_id,
          user_id,
          date,
          clock_in_epoch,
          clock_out_epoch,
          total_hours,
          total_minutes,
          formatted_duration,
          status: "Present",
        },
      };
    }
    return { status: "error", message: "Invalid action" };
  };

  this.adminmonthlyLogs = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let user_id = user_details.user_id;
    let role_id = user_details.role_id;
    let response = {};
    let data = { org_id, user_id };
    let get_monthly_logs;

    if (role_id === 2) {
      get_monthly_logs = await attendenceDl.getMonthlyLogs(data, req.body);
    } else {
      response["status"] = "error";
      response["message"] = "Unauthorized role.";
      return response;
    }
    if (!_.isEmpty(get_monthly_logs)) {
      response["status"] = "Success";
      response["data"] = get_monthly_logs;
    } else {
      response["status"] = "error";
      response["message"] = "Failed to fetch monthly logs.";
    }
    return response;
  };

   this.getAllattendenceview = async function (req) {
    const user_details = await authDl.getDecryptToken(req);
    const { org_id, role_id } = user_details;
    const { issue_id } = req.query; // issue_id passed from frontend when admin clicks a user
    if (![1, 2].includes(role_id)) {
      return { status: "error", message: "Unauthorized: Only admins can view issues" };
    }

    if (!issue_id) {
      return { status: "error", message: "issue_id is required" };
    }

    const issues = await attendenceDl.getAllAttendancedetails(org_id,issue_id);
    return { status: "success", data: issues };
  };
  /////////////////////Raise Attendance Approval Issue Module End///////////////////////


  //clock-In
  this.clockInlocation = async function (req, res) {
  let user_details = authDl.getDecryptToken(req);
  let org_id = user_details.org_id;
  let user_id = user_details.user_id;
  let response = {};

  let date = moment().format("YYYY-MM-DD");
  const clockin_time = moment().format("HH:mm:ss");
  const epoch_time = moment().unix();

  let { latitude, longitude } = req.body;

  let data = {
    org_id,
    user_id,
    epoch_time,
    date,
    status: "Present",
    latitude: latitude || null,
    longitude: longitude || null
  };

  let is_clockin = await attendenceDl.checkClockin(data);

  if (_.isEmpty(is_clockin)) {
    let result1 = await attendenceDl.monthlyLogs(data);
    let result2 = await attendenceDl.clockInEvent(data);

    if (result1.affectedRows > 0 && result2.affectedRows > 0) {
      response.status = "success";
      response.message = "Clocked in successfully";
    } else {
      response.status = "error";
      response.message = "Failed to clock in";
    }
  } else {
    let result1 = await attendenceDl.clockInEvent(data);

    if (result1.affectedRows > 0) {
      response.status = "success";
      response.message = "Clocked in successfully";
    } else {
      response.status = "error";
      response.message = "Failed to clock in";
    }
  }

  return response;
};


  //Clock-out
  this.clockOutlocation = async function (req, res) {
  let user_details = authDl.getDecryptToken(req);
  let response = {};
  const user_id = user_details.user_id;
  let date = moment().format("YYYY-MM-DD");
  let data = { user_id, date };

  const clockout_time = moment().format("dddd HH:mm:ss");
  const epoch_time = moment(clockout_time, "dddd h:mm:ss").unix();

  let { latitude, longitude } = req.body;

  let get_clockin_time = await attendenceDl.getClockInTime(data);
  console.log(get_clockin_time, "get_clockin_time");

  if (!_.isEmpty(get_clockin_time)) {
    const clockin_epoch = get_clockin_time[0].clock_In;
    const duration = epoch_time - clockin_epoch;
    const total_minutes = Math.floor(duration / 60);
    const formatted_duration = `${total_minutes} m`;
    console.log(formatted_duration, "formatted_duration");

    let user = await attendenceDl.clockOutevent(
      data,
      epoch_time,
      formatted_duration,
      latitude,
      longitude
    );

    if (!_.isEmpty(user)) {
      let get_all_logs = await attendenceDl.getdaylogs(user_id);
      console.log(get_all_logs, "get_all_logs");

      const hours = Math.floor(get_all_logs[0].total_duration / 60);
      const minutes = get_all_logs[0].total_duration % 60;
      const formatted_total_duration = `${hours} h ${minutes} m`;
      const total_minutes = get_all_logs[0].total_duration;

      let org_id = user_details.org_id;
      let last_clock_out = get_all_logs[0].last_clock_out;
      let work_week_Id = await attendenceDl.getWorkWeekId(user_id);
      let is_working = await attendenceDl.checkIsWorking(date, work_week_Id);
      let is_holiday = await attendenceDl.checkHoliday(org_id, date);
      let is_leave_applied = await attendenceDl.isLeaveApplied(date, user_id);

      let dataToUpdate = {
        last_clock_out,
        total_minutes,
        user_id,
        org_id,
        formatted_duration: formatted_total_duration,
      };

      let status = "Absent";

      if (hours < 4) {
        if (!_.isEmpty(is_holiday)) {
          status = "Absent";
        } else if (is_working[0].is_working !== "holiday") {
          if (!_.isEmpty(is_leave_applied)) {
            status = "Absent";
          } else {
            status = "on-break";
          }
        } else {
          status = "Absent";
        }
      } else if (hours >= 8) {
        status = "Present";
      } else if (hours >= 4 && hours < 8) {
        if (!_.isEmpty(is_holiday)) {
          status = "Present";
        } else if (is_working[0].is_working !== "holiday") {
          if (!_.isEmpty(is_leave_applied)) {
            status = "Present";
          } else {
            status = "on break";
          }
        } else {
          status = "Present";
        }
      }

      dataToUpdate.status = status;
      let update_monthly_logs = await attendenceDl.updateMonthlyLog(dataToUpdate);

      if (update_monthly_logs.affectedRows > 0) {
        response["status"] = "success";
        response["message"] = "Clocked out successfully";
      } else {
        response["status"] = "error";
        response["message"] = "Failed to clock out logs";
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



}

var self = (module.exports = new obj());
