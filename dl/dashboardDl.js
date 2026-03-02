var mysqlDao = require(__base + "/dao/mysqlDao");
const moment = require("moment");

function Obj() {
  // Birthday Employees
  this.getEmployeesBirthdayToday = async function (org_id) {
    const query = `
       SELECT 
            u.id AS user_id,
            u.username,
            DATE_FORMAT(pd.dob, '%Y-%m-%d') AS dob,
            u.email,
            u.employee_id,
            u.org_id,
            u.department_Id,
            sd.department_name,
            pd.image_url
        FROM sam_users u
        INNER JOIN sam_personal_details pd 
            ON u.id = pd.user_id
		INNER JOIN samlite_departments sd
			ON sd.id = u.department_Id
        WHERE u.org_id = ?
          AND u.is_active = 1
          AND pd.dob IS NOT NULL
          AND DATE_FORMAT(pd.dob, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
        ORDER BY u.first_name, u.last_name
    `;

    let value = org_id;
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.getEmployeesBirthdayThisMonth = async function (org_id) {
    const query = `
            SELECT 
                    u.id AS user_id,
                    u.username,
                    DATE_FORMAT(pd.dob, '%Y-%m-%d') AS dob,
                    u.email,
                    u.employee_id,
                    u.org_id,
                    u.department_Id,
                    sd.department_name,
                    pd.image_url
                FROM sam_users u
                INNER JOIN sam_personal_details pd 
                    ON u.id = pd.user_id
                INNER JOIN samlite_departments sd
                    ON sd.id = u.department_Id
                WHERE u.org_id = ?
                AND u.is_active = 1
                AND pd.dob IS NOT NULL
                AND MONTH(pd.dob) = MONTH(CURDATE()) AND day(pd.dob)>day(current_date())
                ORDER BY DAY(pd.dob), u.first_name, u.last_name
        `;

    let value = org_id;
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? [] : res;
  };

  // Work Anniversary Employees
  this.getEmployeesWorkAnniversaryToday = async function (org_id) {
    const query = `
        SELECT 
            u.id AS user_id,
            u.username,
            u.email,
            u.employee_id,
            u.org_id,
            DATE_FORMAT(pd.date_of_joining, '%Y-%m-%d') AS date_of_joining,
            TIMESTAMPDIFF(YEAR, pd.date_of_joining, CURDATE()) AS completed_years,
            u.department_Id,
            sd.department_name,
            pd.image_url
        FROM sam_users u
        INNER JOIN sam_personal_details pd 
            ON u.id = pd.user_id
        INNER JOIN samlite_departments AS sd
            ON sd.id = u.department_Id
        WHERE u.org_id = ?
          AND u.is_active = 1
          AND pd.date_of_joining IS NOT NULL
          AND DATE_FORMAT(pd.date_of_joining, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
          AND TIMESTAMPDIFF(YEAR, pd.date_of_joining, CURDATE()) > 0 
        ORDER BY u.first_name, u.last_name
    `;

    let value = org_id;
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  // New Joiners
  this.getEmployeesNewJoiners = async function (org_id) {
    const query = `
        SELECT 
            u.id AS user_id,
            u.username,
            u.email,
            u.employee_id,
            u.org_id,
            u.department_Id,
            sd.department_name,
            u.designation_Id,
            sdes.designations AS designation_name,
            DATE_FORMAT(pd.date_of_joining, '%Y-%m-%d') AS date_of_joining,
            pd.image_url
        FROM sam_users u
        INNER JOIN sam_personal_details pd 
            ON u.id = pd.user_id
        INNER JOIN samlite_departments sd
            ON sd.id = u.department_Id
        INNER JOIN samlite_designations sdes
            ON sdes.id = u.designation_Id
        WHERE u.org_id = ?
          AND u.is_active = 1
          AND pd.date_of_joining IS NOT NULL
          AND pd.date_of_joining BETWEEN DATE_SUB(CURDATE(), INTERVAL 9 DAY) AND CURDATE()
        ORDER BY pd.date_of_joining DESC, u.first_name, u.last_name
    `;

    let value = org_id;
    console.log(value, "org_id");
    let res = await mysqlDao.doQueryParams(query, value);
    console.log(res, "res--");
    return global._.isEmpty(res) ? {} : res;
  };

  // Insert Quick Link
  this.insertQuickLink = async function (obj) {
    const query = `
        INSERT INTO sam_quick_links 
            (org_id, title, url, link_order, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ? )
    `;

    let value = [
      obj.org_id,
      obj.title,
      obj.url,
      obj.link_order || null,
      obj.created_by,
      obj.updated_by || null,
    ];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  // Check Quick Link Title
  this.checkQuickLinkTitle = async function (org_id, title) {
    const query = `
        SELECT id 
        FROM sam_quick_links 
        WHERE org_id = ? AND title = ?
        LIMIT 1
    `;
    let value = [org_id, title];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  // Update Quick Link
  this.updateQuickLink = async function (obj) {
    const query = `
        UPDATE sam_quick_links 
        SET title = ?, url = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ? AND org_id = ?
    `;

    let value = [obj.title, obj.url, obj.updated_by, obj.id, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  // Delete Quick Links
  this.deleteQuickLinks = async function (org_id, delete_links_ids) {
    const placeholders = delete_links_ids.map(() => "?").join(",");
    const query = `
        DELETE FROM sam_quick_links
        WHERE org_id = ? AND id IN (${placeholders})
    `;

    let value = [org_id, ...delete_links_ids];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  // Fetch Quick Links
  this.fetchQuickLinks = async function (org_id) {
    const query = `
        SELECT 
            ql.id,
            ql.title,
            ql.url,
            ql.link_order,
            ql.created_at,
            ql.updated_at,
            cu.username AS created_by,
            uu.username AS updated_by
        FROM sam_quick_links ql
        LEFT JOIN sam_users cu ON ql.created_by = cu.id
        LEFT JOIN sam_users uu ON ql.updated_by = uu.id
        WHERE ql.org_id = ?
        ORDER BY ql.link_order ASC
    `;

    let value = org_id;
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  // Fetch Widget Panel List
  this.fetchWidgetPanelList = async function (org_id) {
    const query = `
        SELECT 
            wp.id,
            wp.widget_name,
            wp.widget_order,
            wp.is_active,
            wp.created_at,
            wp.updated_at,
            cu.username AS created_by,
            uu.username AS updated_by
        FROM sam_widget_panel wp
        LEFT JOIN sam_users cu ON wp.created_by = cu.id
        LEFT JOIN sam_users uu ON wp.updated_by = uu.id
        WHERE wp.org_id = ? 
        ORDER BY 
            CASE WHEN wp.widget_order IS NULL THEN 1 ELSE 0 END,
            wp.widget_order ASC
    `;

    let value = org_id;
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  // Update Widget Active
  this.updateWidgetActive = async function (obj) {
    const query = `
        UPDATE sam_widget_panel
        SET is_active = ?, updated_by = ?
        WHERE id = ? AND org_id = ?
    `;

    let value = [obj.is_active, obj.updated_by, obj.id, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  // Update Widget Order
  this.updateWidgetOrder = async function (obj) {
    const queries = [];

    for (const w of obj.widget_order) {
      queries.push(
        mysqlDao.doQueryParams(
          `UPDATE sam_widget_panel 
                 SET widget_order = ?, updated_by = ?, updated_at = NOW()
                 WHERE id = ? AND org_id = ?`,
          [w.order, obj.user_id, w.id, obj.org_id]
        )
      );
    }

    let res = await Promise.all(queries);
    return global._.isEmpty(res) ? {} : res;
  };

  // Upcoming Festivals
  this.getUpcomingFestivalsByOrg = async function (org_id) {
    const query = `
        SELECT 
            hc.org_id,
            hc.holiday_description,
            DATE_FORMAT(hc.date, '%Y-%m-%d') AS date,
            hc.image as image_url
        FROM holiday_calender hc
        WHERE hc.org_id = ? and year(date) = year(curdate())
          AND hc.date >= CURDATE()
        ORDER BY hc.date ASC
    `;
    let res = await mysqlDao.doQueryParams(query, org_id);
    return global._.isEmpty(res) ? [] : res;
  };

  // Get User Email
  this.getUserEmailById = async function (user_id) {
    const query = `
        SELECT id, username, email
        FROM sam_users
        WHERE id = ? AND is_active = 1
        LIMIT 1
    `;

    let value = user_id;
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res[0];
  };

  // Today Leave Members
  this.getTodayLeaveMembersByOrg = async function (org_id) {
    const query = `
        SELECT 
            sla.id AS leave_id,
            sla.user_id,
            sla.leave_type,
            DATE_FORMAT(sla.start_date, '%Y-%m-%d') AS start_date,
            sla.start_day_session,
            DATE_FORMAT(sla.end_date, '%Y-%m-%d') AS end_date,
            sla.end_day_session,
            sla.reason,
            sla.status,
            su.username,
            sd.department_name,
            sm.first_clock_in
        FROM sam_leave_applications sla
        INNER JOIN sam_users su ON sla.user_id = su.id
        LEFT JOIN samlite_departments sd ON su.department_id = sd.id
        left join samlitemonthly_records as sm on sla.user_id= sm.user_id and sm.date = current_date()
        WHERE sla.org_id = ?
          AND sla.status IN ('approved','Pending')
          AND CURDATE() BETWEEN sla.start_date AND sla.end_date
          AND ((sla.start_day_session = 1 and sla.end_day_session = 1 and sm.first_clock_in is null) or
          (sla.start_day_session = 2 and sla.end_day_session = 2 and sm.first_clock_in is not null and sm.last_clock_out is not null) or 
           (
           sla.start_day_session = 1 and sla.end_day_session = 2 and sm.first_clock_in is null and sm.last_clock_out is null
          )
          )
    `;

    let value = org_id;
    let res = await mysqlDao.doQueryParams(query, value);

    if (global._.isEmpty(res)) return {};

    const today = new Date().toISOString().slice(0, 10);

    return res.map((row) => {
      const startSession = Number(row.start_day_session);
      const endSession = Number(row.end_day_session);

      let leave_type_today = "Full Day";

      if (row.start_date === today && row.end_date === today) {
        if (startSession === 1 && endSession === 2) {
          leave_type_today = "Full Day";
        } else if (startSession === 1 && endSession === 1) {
          leave_type_today = "Half Day (Morning)";
        } else if (startSession === 2 && endSession === 2) {
          leave_type_today = "Half Day (Afternoon)";
        }
      } else if (row.start_date === today) {
        leave_type_today =
          startSession === 2 ? "Half Day (Afternoon)" : "Full Day";
      } else if (row.end_date === today) {
        leave_type_today = endSession === 1 ? "Half Day (Morning)" : "Full Day";
      }

      return {
        leave_id: row.leave_id,
        user_id: row.user_id,
        name: row.username,
        department: row.department_name,
        leave_type: row.leave_type,
        leave_status: row.status,
        reason: row.reason,
        leave_for_today: leave_type_today,
      };
    });
  };
}

var self = (module.exports = new Obj());
