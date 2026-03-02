var mysqlDao = require(__base + "/dao/mysqlDao");

function obj() {
  this.getAssignedLeaves = async function (id) {
    const query = `select a.user_id, b.id as rule_id, b.rule_name as leave_type, a.leave_balance from  sam_assigned_leave_details as a 
    inner join  sam_leave_rules as b on a.rule_id = b.id where user_id=?`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.applyLeave = async function (user_details, data, obj) {
    const applied_on = new Date().toISOString().split("T")[0];

    let applied_leaves = obj.applied_leaves;

    if (data.start_day_session === 1 && data.end_day_session === 1) {
      applied_leaves = applied_leaves / 2;
    } else if (data.start_day_session === 1 && data.end_day_session === 2) {
      applied_leaves = applied_leaves;
    } else if (data.start_day_session === 2 && data.end_day_session === 2) {
      applied_leaves = applied_leaves / 2;
    }

    let query =
      "insert into  sam_leave_applications (user_id,leave_type,start_date,start_day_session,end_date,end_day_session,reason,org_id,applied_on,rule_id, applied_leaves, penalty_deduction) values (?,?,?,?,?,?,?,?,?,?,?,?)";
    let values = [
      user_details.user_id,
      data.leave_type,
      data.start_date,
      data.start_day_session,
      data.end_date,
      data.end_day_session,
      data.reason_for_leave,
      user_details.org_id,
      applied_on,
      data.rule_id,
      applied_leaves,
      obj.penalty_deduction,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res;
  };

  this.getEmployeeLogs = async function (user_details) {
    const query = `SELECT 
    a.id,
    b.id as rule_id, 
    b.rule_name as leave_type, 
    a.start_date, 
    a.end_date, 
    a.applied_on, 
    a.status, 
    a.action,
    a.total_leaves
    AS days from  sam_leave_applications as a inner join 
 sam_leave_rules as b on a.rule_id = b.id where a.user_id = ? and a.org_id = ?;
`;
    let values = [user_details.user_id, user_details.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getOrgEmployeeLogs = async function (user_details) {
    const query = `SELECT
    a.id,
    b.id AS rule_id, 
    b.rule_name AS leave_type, 
    a.start_date, 
    a.end_date, 
    a.applied_on, 
    a.status,
    a.updated_by,
    a.action,
    a.total_leaves AS days,
    b.org_id,
     c.username,
    c.employee_id,
    c.org_id
FROM sam_leave_applications AS a 
Left JOIN sam_leave_rules AS b ON a.rule_id = b.id 
left join sam_users as c on c.id = a.user_id 
where c.org_id = b.org_id and b.org_id = ?
`;
    let values = [user_details.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getLeaveDetails = async function (user_details) {
    const query = `select a.user_id, b.id as rule_id, b.rule_name as leave_type, a.credited_leaves, 
   b.leaves_allowed_in_a_year as total_leaves, a.applied_leaves, a.penalty_deduction, a.closing_balance, a.leave_balance, a.carry_forward
    from  sam_assigned_leave_details as a 
    inner join  sam_leave_rules as b on a.rule_id = b.id where a.user_id =?`;
    let values = [user_details.user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateLeaveDetails = async function (obj) {
    const query = `
    UPDATE  sam_assigned_leave_details
    SET 
      credited_leaves = ?,
      applied_leaves = ?,
      carry_forward = ?
    WHERE user_id = ? and rule_id = ?;
  `;
    let values = [
      obj.credited_leaves,
      obj.applied_leaves,
      obj.carry_forwards,
      obj.user_id,
      obj.rule_id,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateWorkWeekLeaveDetails = async function (user_details, obj, data) {
    let applied_leaves = obj.applied_leaves;

    if (data.start_day_session === 1 && data.end_day_session === 1) {
      applied_leaves = applied_leaves / 2;
    } else if (data.start_day_session === 1 && data.end_day_session === 2) {
      applied_leaves = applied_leaves;
    } else if (data.start_day_session === 2 && data.end_day_session === 2) {
      applied_leaves = applied_leaves / 2;
    }

    const query = `
    UPDATE  sam_assigned_leave_details
    SET 
      applied_leaves = applied_leaves + ?,
      penalty_deduction = penalty_deduction + ?
    WHERE user_id = ? and rule_id = ?;
  `;
    let values = [
      applied_leaves,
      obj.penalty_deduction,
      user_details.user_id,
      data.rule_id,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.monthlyAttendance = async function (dataArray) {
    let query = `INSERT INTO sam_monthly_attendance_logs
      (user_id, rule_id, month, year, applied_leaves, penalty_leaves)
      VALUES ?`;

    let values = [];

    for (let i = 0; i < dataArray.monthlyLeaves.length; i++) {
      let obj = dataArray.monthlyLeaves[i];
      let value = [
        obj.user_id,
        obj.rule_id,
        obj.month,
        obj.year,
        obj.applied_leaves,
        obj.penalty_leaves,
      ];

      values.push(value);
    }

    if (values.length > 0) {
      let res = await mysqlDao.doQueryParams(query, [values]);
      return global._.isEmpty(res) ? {} : res;
    } else {
      throw new Error("No data to insert");
    }
  };

  this.getLeaveRules = async function (obj) {
    let query = `SELECT a.id,a.rule_name,
      a.rule_description,
      a.leave_rule_type_id,
      a.leaves_allowed_in_a_year,
      a.weekends_between_leave,
      a.holidays_between_leaves,
      a.is_accrual,
      a.accrual_frequency,
      a.is_leave_encash,
      a.is_all_leave_encashable,
      a.is_carry_forward,
      a.max_carry_forward_leaves,
      a.max_leaves_allowed_in_month,
      a.continuous_leaves_allowed,
      a.max_leaves_encashable,
      a.is_carry_all_remaining_leaves,
      count(b.user_id) as total_employees
      FROM sam_leave_rules as a
      left join sam_assigned_leave_details as b on a.id = b.rule_id
      WHERE a.org_id = ?
      group by a.id,a.rule_name,
      a.rule_description,
      a.leaves_allowed_in_a_year,
      a.weekends_between_leave,
      a.holidays_between_leaves,
      a.is_accrual,
      a.accrual_frequency,
      a.is_leave_encash,
      a.is_all_leave_encashable,
      a.is_carry_forward,
      a.max_carry_forward_leaves,
      a.max_leaves_allowed_in_month,
      a.continuous_leaves_allowed,
      a.max_leaves_encashable,
      a.is_carry_all_remaining_leaves  ;`;
    let value = [obj.org_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.createNewLeaveRule = async function (obj) {
    console.log("obj==", obj);
    let query = `INSERT INTO sam_leave_rules
      (rule_name,
      rule_description,
      leave_rule_type_id,
      leaves_allowed_in_a_year,
      weekends_between_leave,
      holidays_between_leaves,
      is_accrual,
      accrual_frequency,
      is_leave_encash,
      is_all_leave_encashable,
      is_carry_forward,
      max_carry_forward_leaves,
      max_leaves_allowed_in_month,
      continuous_leaves_allowed,
      created_by,
      org_id,
      max_leaves_encashable,
      is_carry_all_remaining_leaves)
      VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
    let value = [
      obj.rule_name,
      obj.rule_description,
      obj.leave_rule_type_id,
      obj.leaves_allowed_in_a_year,
      obj.weekends_between_leave,
      obj.holidays_between_leaves,
      obj.is_accrual,
      obj.accrual_frequency,
      obj.is_leave_encash,
      obj.is_all_leave_encashable,
      obj.is_carry_forward,
      obj.max_carry_forward_leaves,
      obj.max_leaves_allowed_in_month,
      obj.continuous_leaves_allowed,
      obj.user_id,
      obj.org_id,
      obj.max_leaves_encashable,
      obj.is_carry_all_remaining_leaves,
    ];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.updateLeaveRule = async (obj) => {
    let query = `UPDATE sam_leave_rules
      SET 
      rule_name = ?,
      rule_description = ?,
      leave_rule_type_id = ?,
      leaves_allowed_in_a_year = ?,
      weekends_between_leave = ?,
      holidays_between_leaves = ?,
      is_accrual = ?,
      accrual_frequency = ?,
      is_leave_encash = ?,
      is_all_leave_encashable = ?,
      is_carry_forward = ?,
      max_carry_forward_leaves = ?,
      max_leaves_allowed_in_month = ?,
      continuous_leaves_allowed = ?,
      created_by = ?,
      max_leaves_encashable = ?,
      is_carry_all_remaining_leaves = ?
      WHERE id = ?;`;
    let value = [
      obj.rule_name,
      obj.rule_description,
      obj.leave_rule_type_id,
      obj.leaves_allowed_in_a_year,
      obj.weekends_between_leave,
      obj.holidays_between_leaves,
      obj.is_accrual,
      obj.accrual_frequency,
      obj.is_leave_encash,
      obj.is_all_leave_encashable,
      obj.is_carry_forward,
      obj.max_carry_forward_leaves,
      obj.max_leaves_allowed_in_month,
      obj.continuous_leaves_allowed,
      obj.user_id,
      obj.max_leaves_encashable,
      obj.is_carry_all_remaining_leaves,
      obj.id,
    ];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.deleteLeaveRule = async (obj) => {
    let query = `DELETE FROM sam_leave_rules
      WHERE id = ?;`;
    let value = [obj.rule_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.assignNewRulesToMultipleUsers = async (obj) => {
    // Extract rule IDs from leaveRules
    const ruleIds = obj.leaveRules.map((rule) => rule.id);

    // Step 1: Fetch already assigned rules for all users
    const query = `SELECT user_id, rule_id FROM sam_assigned_leave_details WHERE user_id IN (?) AND rule_id IN (?)`;
    const values = [obj.users, ruleIds];
    const assignedRules = await mysqlDao.doQueryParams(query, values);

    // Step 2: Create a map to store assigned rules for each user
    const assignedMap = {};
    assignedRules.forEach((row) => {
      if (!assignedMap[row.user_id]) {
        assignedMap[row.user_id] = new Set();
      }
      assignedMap[row.user_id].add(row.rule_id);
    });

    // Step 3: Filter out rules that are already assigned for each user
    const newDetailedAssignments = [];
    obj.users.forEach((userId) => {
      const alreadyAssignedRules = assignedMap[userId] || new Set(); // Rules already assigned to this user
      obj.leaveRules.forEach((rule) => {
        if (!alreadyAssignedRules.has(rule.id)) {
          newDetailedAssignments.push([
            userId,
            rule.id,
            rule.is_accrual === 0 && rule.leave_rule_type_id === 1
              ? rule.leaves_allowed_in_a_year
              : rule.is_accrual === 1 && rule.leave_rule_type_id === 1
              ? 0
              : rule.leaves_allowed_in_a_year,
            rule.leaves_allowed_in_a_year,
            0,
            0,
            0,
            obj.effectiveDate,
          ]);
        }
      });
    });

    // Step 4: Insert new rules if there are any
    if (newDetailedAssignments.length > 0) {
      const insertValues = newDetailedAssignments.flat();
      const insertQuery = `INSERT INTO sam_assigned_leave_details (user_id,rule_id,credited_leaves,total_leaves,applied_leaves,penalty_deduction,carry_forward,effective_from)
                    VALUES ${newDetailedAssignments
                      .map(() => "(?, ?, ?, ?, ?, ?, ?, ?)")
                      .join(", ")}`;
      const res = await mysqlDao.doQueryParams(insertQuery, insertValues);
      return global._.isEmpty(res) ? {} : res;
    } else {
      return {}; // No new rules to assign
    }
  };

  this.deleteAssignedLeaveRulesToUsers = async (obj) => {
    let query = `DELETE FROM sam_assigned_leave_details
      WHERE user_id = ? and rule_id= ?;`;
    let value = [obj.user_id, obj.rule_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.getAssignedRuleUsers = async function (obj) {
    let query = `SELECT 
    z.*,
    JSON_ARRAYAGG(JSON_OBJECT('rule_id', r.id, 'rule_name', r.rule_name)) AS rules
FROM (
    SELECT 
        us.id as user_id,
        us.employee_id,
        us.username AS full_name,
        de.Designations AS Designation,
        d.department_name AS Department,
        GROUP_CONCAT(ar.rule_id) AS assigned_id
    FROM 
        sam_users us
    LEFT JOIN 
        sam_assigned_leave_details ar ON us.id = ar.user_id
    LEFT JOIN 
        samlite_departments d ON us.department_Id = d.id AND d.org_id = us.org_id
    LEFT JOIN 
        samlite_designations de ON us.designation_Id = de.id AND us.org_id = de.org_id
    WHERE 
        us.org_id = ? and us.is_active = 1
    GROUP BY 
         us.id, us.employee_id, us.username, de.Designations, d.department_name
) AS z
LEFT JOIN 
  sam_leave_rules r ON FIND_IN_SET(r.id, z.assigned_id) > 0
GROUP BY 
  z.user_id, z.employee_id, z.full_name, z.Designation, z.Department;`;
    let values = [obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res;
  };

  this.getorgworkweekrule = async function (id) {
    const query = `SELECT 
    wwc.id, 
    wwc.work_week_rule_name,
    wwc.description, 
    COUNT(wwm.user_id) AS user_count
FROM 
    work_week_rule_config wwc
LEFT JOIN 
    work_week_mapping wwm 
    ON wwc.id = wwm.work_week_configId AND wwm.org_id =?
GROUP BY 
    wwc.id, 
    wwc.work_week_rule_name `;

    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getWorkweekCalender = async function (user_details) {
    const query = `SELECT a.id, a.day, a.is_working, a.created_at, b.user_id, a.work_week_configId, a.week, a.day_number FROM  samlite_rule_calender as a
     inner join  work_week_mapping as b on a.work_week_configId = b.work_week_configId
     where b.user_id =?`;
    let values = [user_details.user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getWeekendsBetweenLeaves = async function (rule_id) {
    const query = `SELECT weekends_between_leave, holidays_between_leaves FROM  sam_leave_rules where
      id = ?`;
    let values = [rule_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getHolidayCalender = async function (user_details) {
    const query = `SELECT holiday_description, Date FROM  holiday_calender where org_id=?`;
    let values = [user_details.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getHolidayCalenderValidation = async function (user_details, data) {
    const query = `SELECT holiday_description, Date FROM  holiday_calender where Date=? and Date=? and org_id=?`;
    let values = [data.start_date, data.end_date, user_details.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getLeaveApplyValidation = async function (user_details, data) {
    const query = `SELECT start_date, end_date, leave_type 
    FROM sam_leave_applications 
    WHERE 
        user_id = ? 
        AND status NOT IN ('Rejected', 'Deleted') 
        AND (
            (? BETWEEN start_date AND end_date)
            -- Check if the applied end_date overlaps an existing range
            OR (? BETWEEN start_date AND end_date)
            -- Check if the new range completely overlaps an existing range
            OR (start_date BETWEEN ? AND ? OR end_date BETWEEN ? AND ?)
        )
        AND (start_day_session = ? 
        OR end_day_session = ?);
    `;
    let values = [
      user_details.user_id, 
      data.start_date, 
      data.end_date, 
      data.start_date, 
      data.end_date, 
      data.start_date, 
      data.end_date, 
      data.start_day_session, 
      data.end_day_session, 
    ];

    let res = await mysqlDao.doQueryParams(query, values);
    console.log(values, "values")
    return _.isEmpty(res) ? {} : res;
  };

  this.approveLeaveApplication = async (obj, username) => {
    let query = `UPDATE sam_leave_applications
      SET status = 'Approved', updated_by = ?
      WHERE id=?`;
    let value = [username, obj.leave_application_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.rejectLeaveApplication = async (obj, username) => {
    let leaveApplicationQuery =
      "SELECT * FROM sam_leave_applications WHERE id=?";
    let ids = [obj.leave_application_id];
    let leaveApplications = await mysqlDao.doQueryParams(
      leaveApplicationQuery,
      ids
    );

    if (leaveApplications.length > 0) {
      let updateLeaveDetailsQuery = `UPDATE sam_assigned_leave_details
      SET applied_leaves = applied_leaves - ?,
      penalty_deduction = penalty_deduction - ?
      WHERE user_id = ? and rule_id = ?;`;
      let updateLeaveValues = [
        leaveApplications[0].applied_leaves,
        leaveApplications[0].penalty_deduction,
        leaveApplications[0].user_id,
        leaveApplications[0].rule_id,
      ];
      await mysqlDao.doQueryParams(updateLeaveDetailsQuery, updateLeaveValues);

      let query = `UPDATE sam_leave_applications
SET status = 'Rejected', updated_by = ?
WHERE id = ?;`;
      let value = [username, obj.leave_application_id];
      let res = await mysqlDao.doQueryParams(query, value);
      return global._.isEmpty(res) ? {} : res;
    } else {
      return {};
    }
  };

  this.deactivateLeaveApplication = async (obj) => {
    let leaveApplicationQuery =
      "SELECT * FROM sam_leave_applications WHERE id=?";
    let ids = [obj.leave_application_id];
    let leaveApplications = await mysqlDao.doQueryParams(
      leaveApplicationQuery,
      ids
    );

    if (leaveApplications.length > 0) {
      let updateLeaveDetailsQuery = `UPDATE sam_assigned_leave_details
      SET applied_leaves = applied_leaves - ?,
      penalty_deduction = penalty_deduction - ?
      WHERE user_id = ? and rule_id = ?;`;
      let updateLeaveValues = [
        leaveApplications[0].applied_leaves,
        leaveApplications[0].penalty_deduction,
        leaveApplications[0].user_id,
        leaveApplications[0].rule_id,
      ];
      await mysqlDao.doQueryParams(updateLeaveDetailsQuery, updateLeaveValues);

      let query = `UPDATE sam_leave_applications
        SET status = 'Deleted'
        WHERE id = ?`;
      let value = [obj.leave_application_id];
      let res = await mysqlDao.doQueryParams(query, value);
      return global._.isEmpty(res) ? {} : res;
    } else {
      return {};
    }
  };

  this.getAccrualHistory = async function (obj) {
    let query = `SELECT *,LEFT(MONTHNAME(date), 3) AS month FROM  sam_lite_leave_accrual_history WHERE rule_id = ? and user_id = ? and year = year(curdate());`;
    let value = [obj.rule_id, obj.user_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.getLeaveViewDetails = async function (user_details, row_id) {
    const query = `SELECT 
      a.id,
      c.employee_id,
	  c.username,
      d.designations,
      dc.department_name,
     a.reason,
    b.id as rule_id, 
    b.rule_name as leave_type, 
    a.start_date, 
    a.end_date, 
    a.applied_on, 
    a.status,  
    c.org_id,
    a.action,
    a.total_leaves,
    CASE 
        WHEN a.start_day_session = 1 AND a.end_day_session = 1 THEN 
            DATEDIFF(end_date, start_date) + 0.5
        WHEN a.start_day_session = 2 AND a.end_day_session = 2 THEN 
            DATEDIFF(end_date, start_date) + 0.5
        WHEN a.start_day_session = 1 AND a.end_day_session = 2 THEN 
            DATEDIFF(end_date, start_date) + 1
        ELSE 
            DATEDIFF(end_date, start_date) + 1 
    END AS days from  sam_leave_applications as a inner join 
 sam_leave_rules as b on a.rule_id = b.id 
inner join  sam_users as c on c.id = a.user_id
left join  samlite_designations as d on d.id = c.designation_Id
left join  samlite_departments as dc on dc.id = c.department_Id
  where c.id = ? and a.id = ?;
`;
    let values = [user_details.user_id, row_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getLeaveViewDetailsForAdmin = async function (user_details, row_id) {
    const query = `SELECT 
    a.id,
      c.employee_id,
          c.username,
    d.designations,
      dc.department_name,
     a.reason,
    b.id as rule_id, 
    b.rule_name as leave_type, 
    a.start_date, 
    a.end_date, 
    a.applied_on, 
    a.status,  
    c.org_id,
    a.action,
    a.updated_by,
    a.total_leaves,
    CASE 
        WHEN a.start_day_session = 1 AND a.end_day_session = 1 THEN 
            DATEDIFF(end_date, start_date) + 0.5
        WHEN a.start_day_session = 2 AND a.end_day_session = 2 THEN 
            DATEDIFF(end_date, start_date) + 0.5
        WHEN a.start_day_session = 1 AND a.end_day_session = 2 THEN 
            DATEDIFF(end_date, start_date) + 1
        ELSE 
            DATEDIFF(end_date, start_date) + 1 
    END AS days from  sam_leave_applications as a inner join 
 sam_leave_rules as b on a.rule_id = b.id 
inner join  sam_users as c on c.id = a.user_id
left join  samlite_designations as d on d.id = c.designation_Id
left join  samlite_departments as dc on dc.id = c.department_Id
  where a.id = ?;
`;
    let values = [row_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getAdminData = async function (id) {
    console.log(id, "id");
    const query = 
          `SELECT b.username, b.email FROM sam_personal_details as a
          left join sam_users as b on b.id = a.user_id
          WHERE b.role_id = 2 AND b.org_id = ? AND b.is_active=1`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    console.log(res, "responmse");
    return _.isEmpty(res) ? {} : res;
  };

  this.getUserData = async function (org_id, user_id) {
    const query = `select u.username as Name, p.official_email_id, o.org_name, o.address as Address from sam_users as u 
    left join sam_personal_details as p on p.user_id = u.id
    left join sam_organizations as o on o.id = u.org_id
    where u.org_id = ? and p.user_id = ?`;
    let values = [org_id, user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    console.log(res, "res[ponse");
    return _.isEmpty(res) ? {} : res;
  };

  this.getleaveData = async function (data) {
    const query = `select * from  sam_leave_applications where id=?`;
    let values = [data.leave_application_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };




this.bulkApproveLeaveApplication = async (obj, username) => {
    
  let query = `UPDATE sam_leave_applications
      SET status = 'Approved', updated_by = ?
      WHERE id IN (?)`;
  let value = [username, obj.leave_application_id]; // Ensure this is an array
  let res = await mysqlDao.doQueryParams(query, value);
  return global._.isEmpty(res) ? {} : res;
}


  this.bulkRejectLeaveApplication = async (obj, username) => {
    let res;
    for (const leaveApplicationId of obj.leave_application_id) {
        let leaveApplicationQuery =
            "SELECT * FROM sam_leave_applications WHERE id=?";
        let ids = [leaveApplicationId];
        let leaveApplications = await mysqlDao.doQueryParams(
            leaveApplicationQuery,
            ids
        );
 
        if (leaveApplications.length > 0) {
            let updateLeaveDetailsQuery = `UPDATE sam_assigned_leave_details
                SET applied_leaves = applied_leaves - ?,
                penalty_deduction = penalty_deduction - ?
                WHERE user_id = ? and rule_id = ?;`;
 
            let updateLeaveValues = [
                leaveApplications[0].applied_leaves,
                leaveApplications[0].penalty_deduction,
                leaveApplications[0].user_id,
                leaveApplications[0].rule_id,
            ];
 
            await mysqlDao.doQueryParams(updateLeaveDetailsQuery, updateLeaveValues);
 
            let query = `UPDATE sam_leave_applications
                SET status = 'Rejected', updated_by = ?
                WHERE id = ?`;
            let value = [username, leaveApplicationId];
            res = await mysqlDao.doQueryParams(query, value);
        }
    }
    return global._.isEmpty(res) ? {} : res; // Return a success message or result
};

// LeaveBalanceReport All Leaves
  this.getAllUsersLeaveDetails = async function (org_id) {
    const query = `
    SELECT 
  a.user_id,
  u.employee_id,
  CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
  b.id AS rule_id,
  b.rule_name AS leave_type,
  a.credited_leaves,
  b.leaves_allowed_in_a_year AS allowed_leaves,
  (a.credited_leaves + a.carry_forward) AS total_leaves,
  a.applied_leaves,
  a.penalty_deduction,
  a.closing_balance,
  a.leave_balance,
  a.carry_forward
FROM sam_assigned_leave_details AS a
INNER JOIN sam_leave_rules AS b ON a.rule_id = b.id
INNER JOIN sam_users u ON u.id = a.user_id
WHERE u.org_id = ? and u.is_active = 1`;
    const values = [org_id];
    console.log("org_id passed to getAllUsersLeaveDetails:", org_id);
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? [] : res;
  };

}

module.exports = new obj();
