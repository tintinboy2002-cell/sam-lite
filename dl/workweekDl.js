var mysqlDao = require(__base + "/dao/mysqlDao");

function obj() {
 this.createWorkWeekRule = async function (id, data) {
    let time_stamp = Math.floor(new Date() / 1000);
    const query1 = `INSERT INTO work_week_rule_config (org_id, work_week_rule_name, description, created_at) VALUES(?, ?, ?, ?)`;
    let values1 = [id, data.ruleName, data.description, time_stamp];
    let res1 = await mysqlDao.doQueryParams(query1, values1);
    let workweekconfigId = res1.insertId;

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let query2 =
      "INSERT INTO samlite_rule_calender(day, is_working, work_week_configId, week, created_at) VALUES ";
    let values2 = [];
    let is_working = "fullday";
    let week = 1;
    for (let i = 0; i < 35; i++) {
      let day = daysOfWeek[i % 7];
      values2.push(day, is_working, workweekconfigId, week, time_stamp);
      if ((i + 1) % 7 === 0) {
        week++;
      }
    }
    let placeholders = Array(35).fill("(?, ?, ?, ?, ?)").join(", ");
    query2 += placeholders;
    let res2 = await mysqlDao.doQueryParams(query2, values2);

    return {
      workweekConfig: res1,
      workweekCalendar: res2,
    };
  };

   this.assignWorkWeek = async function (id, data) {
    const query =
      "insert into work_week_mapping (work_week_configId, user_id, org_id, Date) values ?";

    let values = [];
    for (const userId in data.usersID) {
      if (data.usersID.hasOwnProperty(userId)) {
        const ruleID = data.ruleID[0];
        const date = data.date;
        values.push([ruleID, parseInt(userId), id, date]);
      }
    }
    try {
      let res = await mysqlDao.doQueryParams(query, [values]);
      return _.isEmpty(res) ? {} : res;
    } catch (error) {
      throw error;
    }
  };

   this.deleteWorkWeek = async function (id, ruleId) {
    const query1 = "DELETE FROM work_week_rule_config WHERE id=?";
    let values1 = [ruleId];
    let res1 = await mysqlDao.doQueryParams(query1, values1);
    const query2 =
      "DELETE FROM samlite_rule_calender WHERE work_week_configId=?";

    let values2 = [ruleId];
    let res2 = await mysqlDao.doQueryParams(query2, values2);
    if (res1.affectedRows > 0 && res2.affectedRows > 0) {
      return _.isEmpty(res1) && _.isEmpty(res2) && _.isEmpty(res3)
        ? {}
        : { res1, res2 };
    } else {
      return {};
    }
  };

  this.deleteUserRule = async function (data) {
    const query =
      "delete from work_week_mapping where user_id=? AND work_week_configId=?";
    let values = [data.userId, data.work_week_ruleId];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getUsersAndRules = async function (id) {
    const query = `SELECT
    users.id as user_id,
    users.username as Name, 
    users.employee_id as Employee_id, 
    designations.designations,  
    departments.department_name,   
    map.work_week_configId, 
    config.work_week_rule_name
FROM 
    sam_users AS users
LEFT JOIN 
    work_week_mapping AS map
   ON users.id = map.user_id
LEFT JOIN 
    work_week_rule_config AS config
    ON map.work_week_configId = config.id
LEFT JOIN 
    samlite_departments AS departments
    ON users.Department_Id = departments.id  
LEFT JOIN 
    samlite_designations AS designations
    ON users.designation_Id = designations.id  
WHERE 
    users.org_id = ? and users.is_active = 1`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getWorkWeekRules = async function (id) {
    const query = `select id, work_week_rule_name from work_week_rule_config where org_id=?`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

 this.getWorkWeekOrgCalender = async function (id) {
    const query = `select id, day, is_working from samlite_rule_calender where work_week_configId=?`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getUserWorkWeekRule = async function (data) {
    const query = `SELECT 
    wwm.work_week_configId, 
    wwr.id AS work_week_rule_id, 
    wwr.work_week_rule_name, 
    wwr.description, 
    sr.id AS samlite_rule_id, 
    sr.day, 
    sr.is_working, 
    sr.work_week_configId,
    wwm.date 
FROM 
    work_week_mapping wwm
JOIN 
    work_week_rule_config wwr 
    ON wwm.work_week_configId = wwr.id 
JOIN 
    samlite_rule_calender sr 
    ON wwr.id = sr.work_week_configId 
WHERE 
    wwm.user_id = ?;
`;
    let values = [data.user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateRules = async function (data) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      const query =
        "UPDATE samlite_rule_calender SET day = ?, is_working = ? WHERE id = ?";
      const values = [entry.day, entry.is_working, entry.id];
      try {
        const res = await mysqlDao.doQueryParams(query, values);
        result.push(res);
      } catch (err) {
        throw err;
      }
    }

    return _.isEmpty(result) ? {} : result;
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
    where wwc.org_id = ?
GROUP BY 
    wwc.id, 
    wwc.work_week_rule_name `;

    let values = [id, id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

   this.checkUserWorkWeek = async function (id, ruleId) {
    const query =
      "SELECT * FROM work_week_mapping where work_week_configId=? AND org_id=?";
    let values = [ruleId, id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkIfRuleAssigned = async function (data, org_id) {
    const query =
      "SELECT * FROM work_week_mapping WHERE user_id=? AND org_id=?";
    const userIds = Object.keys(data.usersID);
    for (let userId of userIds) {
      let values = [userId, org_id];
      let res = await mysqlDao.doQueryParams(query, values);
      if (!_.isEmpty(res)) {
        return res;
      }
    }
    return {};
  };
}

module.exports = new obj();
