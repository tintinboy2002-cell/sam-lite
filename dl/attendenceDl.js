var mysqlDao = require(__base + "/dao/mysqlDao.js");
const moment = require("moment");

function obj() {
  // this.clockInEvent = async function (data) {
  //   console.log(data, "data");
  //   let query = `
  //       INSERT INTO sam_liteclockevents (user_id, org_id, clock_In, date)
  //       VALUES (?,?,?,?);`;
  //   let values = [data.user_id, data.org_id, data.epoch_time, data.date];
  //   let res = await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res) ? {} : res;
  // };

  this.clockInEvent = async function (data) {
    console.log(data)
    let query = `
    INSERT INTO sam_liteclockevents 
    (user_id, org_id, clock_in, date, clock_in_latitude, clock_in_longitude, clock_in_source)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      clock_in = VALUES(clock_in),
      clock_in_latitude = VALUES(clock_in_latitude),
      clock_in_longitude = VALUES(clock_in_longitude),
      clock_in_source = VALUES(clock_in_source)
  `;
    return await mysqlDao.doQueryParams(query, [
      data.user_id,
      data.org_id,
      data.epoch_time,
      data.date,
      data.latitude,
      data.longitude,
      data.clock_in_source
    ]);
  };

  this.getClockInTime = async function (data) {
    console.log("data in getclockInTime", data);
    let query = `
    SELECT * 
    FROM sam_liteclockevents 
    WHERE user_id = ?
    AND date = ?
    AND clock_out IS NULL;
`;

    let values = [data.user_id, data.date];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // this.clockOutevent = async function (data, time, duration) {
  //   let query = `
  //   UPDATE sam_liteclockevents
  //   SET clock_out =?, duration= ?
  //   WHERE user_id =? AND date =? AND duration IS NULL;`;

  //   let values = [time, duration, data.user_id, data.date];
  //   let res = await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res) ? {} : res;
  // };

  this.clockOutevent = async function (data, epoch_time, formatted_duration, latitude, longitude, clock_out_source) {
    let query = `
    UPDATE sam_liteclockevents
    SET clock_out = ?, duration = ?, 
        clock_out_latitude = ?, clock_out_longitude = ?, 
        clock_out_source = ?
    WHERE user_id = ? AND date = ?
  `;
    return await mysqlDao.doQueryParams(query, [
      epoch_time,
      formatted_duration,
      latitude,
      longitude,
      clock_out_source,
      data.user_id,
      data.date
    ]);
  };

  this.checkClockin = async function (data) {
    const query = ` SELECT *
    FROM sam_liteclockevents
    WHERE user_id = ? AND org_id = ? AND DATE(date) = ?
    ORDER BY clock_In ASC
    LIMIT 1;`;
    let values = [data.user_id, data.org_id, data.date];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getDailyLogs = async function (obj) {
    const query = `SELECT *
    FROM sam_liteclockevents
    WHERE user_id = ? AND org_id = ? AND DATE(date) = ?
    ORDER BY clock_In ASC;`;
    let values = [obj.user_id, obj.org_id, obj.date];
    let res = await mysqlDao.doQueryParams(query, values);

    return _.isEmpty(res) ? {} : res;
  };

  this.monthlyLogs = async function (obj) {
    const query = ` INSERT INTO samlitemonthly_records (user_id, org_id, date, first_clock_in, status)
        VALUES (?,?,?,?,?);`;
    let values = [
      obj.user_id,
      obj.org_id,
      obj.date,
      obj.epoch_time,
      obj.status,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getdaylogs = async function (id) {
    const query = `SELECT 
    SUM(duration) AS total_duration, 
    MAX(clock_out) AS last_clock_out
    FROM 
    sam_liteclockevents
    WHERE 
    user_id = ? 
    AND date = CURDATE()
    HAVING 
    MAX(clock_out) > MAX(clock_in);
;`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };


  this.getMonthlyLogs = async function (obj, data) {
    const query1 = `
    SELECT 
      m.id,
      m.user_id,
      m.org_id,
      m.date,
      m.first_clock_in AS firstclockin,
      m.last_clock_out AS lastclockout,
      m.total_hours AS totalhours,
      COALESCE(i.status, '---') AS approval_status,   -- safely shows blank if no record
      m.status,
      m.total_minutes AS totalminutes
    FROM samlitemonthly_records m
    LEFT JOIN samlite_attendance_issues i 
      ON m.user_id = i.user_id 
      AND m.org_id = i.org_id 
      AND DATE_FORMAT(m.date, '%Y-%m-%d') = DATE_FORMAT(i.date, '%Y-%m-%d')
    WHERE m.user_id = ?
      AND m.org_id = ?
      AND DATE(m.date) BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE();
  `;

    const query2 = `
    SELECT 
      m.id,
      m.user_id,
      m.org_id,
      m.date,
      m.first_clock_in AS firstclockin,
      m.last_clock_out AS lastclockout,
      m.total_hours AS totalhours,
      COALESCE(i.status, '---') AS approval_status,
      m.status,
      m.total_minutes AS totalminutes
    FROM samlitemonthly_records m
    LEFT JOIN samlite_attendance_issues i 
      ON m.user_id = i.user_id 
      AND m.org_id = i.org_id 
      AND DATE_FORMAT(m.date, '%Y-%m-%d') = DATE_FORMAT(i.date, '%Y-%m-%d')
    WHERE m.user_id = ?
      AND m.org_id = ?
      AND DATE(m.date) BETWEEN ? AND ?;
  `;

    let query;
    let values;

    if (data.fromDate && data.toDate) {
      query = query2;
      values = [obj.user_id, obj.org_id, data.fromDate, data.toDate];
    } else {
      query = query1;
      values = [obj.user_id, obj.org_id];
    }

    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  
  this.updateMonthlyLog = async function (obj) {
    const query = `UPDATE samlitemonthly_records
    SET 
       last_clock_out =?, 
        total_hours = ?,
        status=?,
        total_minutes=?
    WHERE user_id = ? 
      AND org_id = ? 
      AND DATE(date) = CURDATE()`;
    let values = [
      obj.last_clock_out,
      obj.formatted_duration,
      obj.status,
      obj.total_minutes,
      obj.user_id,
      obj.org_id,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

//   this.orgDailyLogs = async function (id) {
//     const query = `select a.employee_id, a.username, c.clock_In, c.clock_out, 
// coalesce(c.date, current_date) as date from sam_users as a
// left join sam_personal_details as b on a.id = b.user_id
// left join sam_liteclockevents as c on c.user_id = a.id 
// and c.date = current_date where c.org_id = ?
// order by c.clock_In ASC`;
//     let values = [id];
//     let res = await mysqlDao.doQueryParams(query, values);
//     return _.isEmpty(res) ? {} : res;
//   };

this.orgDailyLogs = async function (id) {
    const query = `select a.employee_id, a.id as user_id, a.username, c.clock_In, c.clock_out, c.clock_in_latitude,
    c.clock_in_longitude, c.clock_out_latitude, c.clock_out_longitude,
coalesce(c.date, current_date) as date from sam_users as a
left join sam_personal_details as b on a.id = b.user_id
left join sam_liteclockevents as c on c.user_id = a.id 
and c.date = current_date where c.org_id = ?
order by c.clock_In ASC`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

//   this.orgMonthlyLogs = async function (id, data) {
//     const query = `select c.employee_id as Employee_id, c.username as Name, b.first_clock_in as firstclockin , b.last_clock_out as lastclockout , b.date , b.user_id, b.total_hours as totalhours, 
// b.status, b.id from sam_personal_details as a 
// left join samlitemonthly_records as b on a.user_id = b.user_id
// left join sam_users as c on a.user_id = c.id
// where b.date between ? and ? and b.org_id = ?`;
//     let values = [data.fromDate, data.toDate, id];
//     let res = await mysqlDao.doQueryParams(query, values);
//     return _.isEmpty(res) ? {} : res;
//   };


this.orgMonthlyLogs = async function (id, data) {
    const query = `
    SELECT distinct
      c.employee_id AS employee_id, 
      c.username AS name, 
      s.clock_in_latitude,
      s.clock_in_longitude, 
      s.clock_out_latitude, 
      s.clock_out_longitude,
      b.first_clock_in AS firstclockin,
      b.last_clock_out AS lastclockout,
      b.date,
      b.user_id,
      b.total_hours AS totalhours,
      b.status,
      i.status AS approval_status,
      b.id
    FROM sam_personal_details AS a
    LEFT JOIN samlitemonthly_records AS b ON a.user_id = b.user_id
    LEFT JOIN sam_users AS c ON a.user_id = c.id
    LEFT JOIN samlite_attendance_issues AS i ON i.user_id = b.user_id AND i.date = b.date
    left join sam_liteclockevents as s on s.user_id = a.id 
    WHERE b.date BETWEEN ? AND ? AND b.org_id = ?;
  `;

    let values = [data.fromDate, data.toDate, id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  
  // this.updateUsertime = async function (obj) {
  //   if (isNaN(obj.OutEpochtime)) {
  //     obj.OutEpochtime = null;
  //   }

  //   if (obj.formattedDuration === "NaN h NaN m") {
  //     obj.formattedDuration = "0h 0m";
  //   } else {
  //     obj.formattedDuration = obj.formattedDuration.replace(/-/g, "");
  //   }

  //   const query = ` UPDATE samlitemonthly_records
  //   SET
  //     firstclockin = ?,
  //     lastclockout = ?,
  //     totalhours = ?,
  //     totalminutes=?,
  //     status = status
  //   WHERE user_id = ?
  //     AND date = ?;
  // `;

  //   let values = [
  //     obj.InEpochtime,
  //     obj.OutEpochtime,
  //     obj.formattedDuration,
  //     obj.Minutes,
  //     obj.user_id,
  //     obj.newDate,
  //   ];
  //   let res = await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res) ? {} : res;
  // };

  this.updateUserAttendanceTime = async function (obj) {
    if (isNaN(obj.epoch_out_time)) {
      obj.epoch_out_time = null;
    }
    if (isNaN(obj.epoch_in_time)) {
      obj.epoch_in_time = null;
    }
    if (obj.formatted_duration === "NaN h NaN m") {
      obj.formatted_duration = "0h 0m";
    } else {
      obj.formatted_duration = obj.formatted_duration.replace(/-/g, "");
    }
    if (isNaN(obj.minutes)) {
      obj.minutes = 0;
    } else {
      obj.minutes = Math.abs(obj.minutes);
    }
    const query = ` 
      UPDATE samlitemonthly_records
      SET 
        first_clock_in = ?,
        last_clock_out = ?,
        total_hours = ?,
        total_minutes = ?,
        status = ?
      WHERE user_id = ? 
        AND date = ?;
    `;

    let values = [
      obj.epoch_in_time,
      obj.epoch_out_time,
      obj.formatted_duration,
      obj.minutes,
      obj.status,
      obj.user_id,
      obj.new_date,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateHours = async function (obj) {
    const query = `update samlitemonthly_records SET total_hours=?, where user_id=? and date= ?`;
    let values = [obj.totalhours, obj.user_id, obj.date];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getWorkWeekId = async function (user_id) {
    const query = `select work_week_configId from work_week_mapping where user_id=?`;
    let values = [user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getDayAndWeek = function (dateString) {
    const date = new Date(dateString);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const firstDayOfMonth = startOfMonth.getDay();
    const weekNumberOfMonth = Math.ceil((dayOfMonth + firstDayOfMonth) / 7);

    return {
      dayOfWeek: dayOfWeek,
      weekNumberOfMonth: weekNumberOfMonth,
    };
  };

  this.checkIsWorking = async function (date, workweekId) {
    const result = await self.getDayAndWeek(date);
    const query = `select is_working from samlite_rule_calender where day=? AND  week=? AND work_week_configId=? `;
    let values = [
      result.dayOfWeek,
      result.weekNumberOfMonth,
      workweekId[0].work_week_configId,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkHoliday = async function (org_id, date) {
    const query = `select* from holiday_calender where org_id=? AND date=?`;
    let values = [org_id, date];
    let res = await mysqlDao.doQueryParams(query, values);
    console.log(res, "responseeee");
    return _.isEmpty(res) ? {} : res;
  };

  this.isLeaveApplied = async function (user_id, date) {
    const query = `select *from sam_leave_applications where user_id=? AND  start_date>=? AND end_date<=?`;
    let values = [user_id, date, date];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // this.getcompoffId=async function(id){
  //   const query=`select id, rule_name from sam_leave_rules where org_id=?`;
  //   let values=[id];
  //   let res=await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res)?{}:res;
  // }

  // this.getcompoffdetails=async function(obj){
  //   const query=`select*from sam_assigned_leave_details where user_id=? AND rule_id=?; `;
  //   let values=[obj.user_id, obj.compoffId];
  //   let res=await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res)?{}:res;

  // }
  // this.addCompoff= async function(obj){
  //   let getcompoffdetails=await self.getcompoffdetails(obj)
  //   console.log(getcompoffdetails, "getdetails")
  //   let creditedleaves=getcompoffdetails[0].credited_leaves;
  //   console.log(creditedleaves, "creditedleaves")
  //   let totalcreditedLeaves=creditedleaves + parseFloat(obj.compoff);
  //   const query=`update sam_assigned_leave_details SET credited_leaves=? where user_id=? AND rule_id=? `
  //   console.log(query, "quiery")
  //   let values=[totalcreditedLeaves, obj.user_id, obj.compoffId];
  //   console.log(values, 'values')
  //   let res= await mysqlDao.doQueryParams(query, values)
  //   return _.isEmpty(res)?{}:res;
  // }

  //download function for daily attendance

  this.getDownloadById = async function (user_id) {
    const query = `
      SELECT s.employee_id as EMPLOYEE_ID, s.username as NAME, a.date as date , a.clock_In  as CLOCK_IN, a.clock_out as CLOCK_OUT
        FROM sam_liteclockevents as a
        left join sam_users as s on s.id = a.user_id
        WHERE a.user_id = ?
        AND a.date = CURRENT_DATE();
          `;
    const values = [user_id];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  //admin
  this.getDownloadByAdmin = async function (org_id) {
    const query = `
          select ROW_NUMBER() OVER (ORDER BY c.date, a.employee_id) AS SI_No, a.employee_id as EMPLOYEE_ID, a.username as NAME, c.clock_In as CLOCK_IN, c.clock_out as CLOCK_OUT, 
        coalesce(c.date, current_date) as date from sam_users as a
        left join sam_personal_details as b on a.id = b.user_id
        left join sam_liteclockevents as c on c.user_id = a.id 
        and c.date = current_date where c.org_id = ?
        order by c.clock_In ASC;
          `;
    const values = [org_id];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  //download function for Historical attendance
  this.getDownloadMonthlyLog = async function (user_id, data) {
    const query = `SELECT s.employee_id as EMPLOYEE_ID, s.username as NAME, a.date as date , a.first_clock_in  as CLOCK_IN, a.last_clock_out as CLOCK_OUT, a.status as STATUS, a.total_hours as TOTAL_HOURS
      FROM samlitemonthly_records as a
      left join sam_users as s on s.id = a.user_id
      WHERE user_id= ? AND date BETWEEN ? AND ?;`;
    const startDate = moment(data.start).format("YYYY-MM-DD");
    const endDate = moment(data.end).format("YYYY-MM-DD");
    const values = [user_id, startDate, endDate];
    const res = await mysqlDao.doQueryParams(query, values);
    return res;
  };

  this.getDownloadMonthlyByAdmin = async function (org_id, data) {
    const query = `select b.date as date, c.employee_id as EMPLOYEE_ID, c.username as NAME, b.first_clock_in as CLOCK_IN, b.last_clock_out as CLOCK_OUT, b.status as STATUS, b.total_hours as TOTAL_HOURS 
    from sam_personal_details as a 
    left join samlitemonthly_records as b on a.user_id = b.user_id
    left join sam_users as c on a.user_id = c.id
    where b.org_id = ? and b.date between ? AND ?;`;
    const startDate = moment(data.start).format("YYYY-MM-DD");
    const endDate = moment(data.end).format("YYYY-MM-DD");
    const values = [org_id, startDate, endDate];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  ////////////////////////////raise attendance request Start////////////////////////////////////////
  //get forget clockout
  this.getForgotClockRecords = async function ({ org_id, user_id, yesterday }) {
    const query = `
    SELECT 
      r.id,
      r.user_id,
      r.org_id,
      u.employee_id,  
      u.username,
      r.date,
      r.first_clock_in,
      r.last_clock_out,
      r.status,
      r.total_hours,
      r.total_minutes
    FROM samlitemonthly_records r
    JOIN sam_users u ON r.user_id = u.id
    WHERE r.org_id = ?
      AND r.user_id = ?
      AND r.date = ?
      AND r.status NOT IN ('holiday', 'weekend')
      AND (
            r.status = 'absent'
         OR (r.first_clock_in IS NULL AND r.last_clock_out IS NULL)
         OR (r.first_clock_in IS NOT NULL AND r.last_clock_out IS NULL)
      )
  `;
    return mysqlDao.doQueryParams(query, [org_id, user_id, yesterday]);
  };

  //InsertRaiseeeeIssue
  this.insertRaiseIssue = async function (data) {
    const query = `
    INSERT INTO samlite_attendance_issues
      (user_id, org_id, date, clock_in_epoch, clock_out_epoch, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    const params = [
      data.user_id,
      data.org_id,
      data.date,
      data.clock_in_epoch,
      data.clock_out_epoch,
      data.reason,
    ];
    return mysqlDao.doQueryParams(query, params);
  };

  //listapprovalss
  this.getPendingIssues = async function () {
    const query = `
    SELECT u.username, u.employee_id,b.*
    FROM samlite_attendance_issues b
     JOIN sam_users u ON b.user_id = u.id
    ORDER BY date DESC, created_at DESC
  `;
    return await mysqlDao.doQuery(query);
  };
  //approvalAcceptt
  // get issue by ID
  this.getIssueById = async function (issue_id) {
    let query = `
    SELECT * FROM samlite_attendance_issues
    WHERE id = ? LIMIT 1
  `;
    let result = await mysqlDao.doQueryParams(query, [issue_id]);
    return result[0];
  };

  // update issue status
  this.updateIssueStatus = async function (issue_id, status, approver_id) {
    let query = `
      UPDATE samlite_attendance_issues
      SET status = ?, approver_id = ?, updated_at = NOW()
      WHERE id = ?
    `;
    return await mysqlDao.doQueryParams(query, [status, approver_id, issue_id]);
  };

  // update monthly records
  this.updateMonthlyRecord = async function (data) {
    let {
      user_id,
      org_id,
      date,
      clock_in_epoch,
      clock_out_epoch,
      total_hours,
      total_minutes,
    } = data;
    let query = `
    UPDATE samlitemonthly_records
    SET first_clock_in = ?, last_clock_out = ?, total_hours = ?, total_minutes = ?, status = 'Present'
    WHERE user_id = ? AND org_id = ? AND date = ?
  `;
    return await mysqlDao.doQueryParams(query, [
      clock_in_epoch,
      clock_out_epoch,
      total_hours,
      total_minutes,
      user_id,
      org_id,
      date,
    ]);
  };


this.getAllAttendancedetails = async function (org_id, issue_id) {
    const query = `
    SELECT 
      i.id AS issue_id,
      i.user_id,
      u.employee_id,
      u.username,
      u.email,
      d.department_name,
      des.designations AS designation_name,
      i.org_id,
      i.date,
      FROM_UNIXTIME(i.clock_in_epoch) AS clock_in_time,
      FROM_UNIXTIME(i.clock_out_epoch) AS clock_out_time,
      i.reason,
      i.status,
      i.created_at,
      i.updated_at,
      a.username AS approver_name,
      a.employee_id AS approver_employee_id
    FROM samlite_attendance_issues i
    JOIN sam_users u 
      ON i.user_id = u.id AND i.org_id = u.org_id
    LEFT JOIN sam_users a 
      ON i.approver_id = a.id AND i.org_id = a.org_id
    LEFT JOIN samlite_departments d 
      ON u.department_Id = d.id AND u.org_id = d.org_id
    LEFT JOIN samlite_designations des 
      ON u.designation_id = des.id AND u.org_id = des.org_id
    WHERE i.org_id = ?
      AND i.id = ?
    ORDER BY i.created_at DESC
  `;
    return await mysqlDao.doQueryParams(query, [org_id, issue_id]);
  };

  ////////////////////////////raise attendance request End////////////////////////////////////////
}

var self = (module.exports = new obj());
