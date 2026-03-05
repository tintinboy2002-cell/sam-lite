var mysqlDao = require(__base + "/dao/mysqlDao");
global._ = require("lodash");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const cron = require("node-cron");

function obj() {
  this.getDecryptToken = (req, res, next) => {
    let data = {};
    const tokenSecret = "samlite";
    var token = req.headers["tokenid"];
    jwt.verify(token, tokenSecret, (err, value) => {
      data = value ? value.data : {};
    });
    return data;
  };

  this.usersDetails = async function (email) {
    let query = `
    SELECT * FROM sam_users WHERE email = ?;
`;
    let values = [email];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res[0];
  };

  this.checkIsActive = async function (id, attempt) {
    let query = "update sam_users set attempt=? where id= ?";
    let value = [attempt, id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.organizationExist = async function (obj) {
    let orgQuery = `
   SELECT * FROM sam_organizations 
    WHERE org_name = ?;
  `;
    let orgValues = [obj.companyname || obj.company_name];
    let orgCheck = await mysqlDao.doQueryParams(orgQuery, orgValues);

    if (!_.isEmpty(orgCheck)) {
      return orgCheck;
    }

    let companyDomain = obj.email.split("@")[1];
    let emailQuery = `
   SELECT * FROM sam_organizations 
    WHERE email LIKE ?;
  `;
    let emailCheck = await mysqlDao.doQueryParams(emailQuery, [
      `%${companyDomain}%`,
    ]);
    return _.isEmpty(emailCheck) ? {} : emailCheck;
  };

  this.organizationRegisterWithGoogle = async function (obj) {
    let query1 = `
     INSERT INTO sam_organizations (email, org_name)
      VALUES (?, ?);
    `;
    let query2 = `
      INSERT INTO samlite_company_details (org_id)
      VALUES (?);
    `;

    let values1 = [obj.email, obj.company_name];
    try {
      let res1 = await mysqlDao.doQueryParams(query1, values1);
      let orgId = res1.insertId;
      let values2 = [orgId];
      let res2 = await mysqlDao.doQueryParams(query2, values2);
      return _.isEmpty(res1) && _.isEmpty(res2) ? {} : { res1, res2 };
    } catch (error) {
      return { error };
    }
  };

  this.registerWithGoogle = async function (data) {
    let query = `
      INSERT INTO sam_users (
        first_name,
        last_name,
        employee_id,
        username,
        email,
        org_id,
        role_id
      ) VALUES (
        ?, ?, ?,  CONCAT('${data.first_name}', ' ', '${data.last_name}'), ?, ?, ?
      );
    `;
    let values = [
      data.first_name,
      data.last_name || "",
      data.employee_id,
      data.email,
      data.org_id,
      data.role_id,
    ];

    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res;
  };

  this.organizationRegister = async function (obj) {
    let query1 = `
     INSERT INTO sam_organizations (org_name, company_website, email, address, country)
      VALUES (?,?,?,?,?);
    `;
    let query2 = `
      INSERT INTO samlite_company_details (org_id, company_name, website)
      VALUES (?, ?, ?);
    `;

    let values1 = [
      obj.company_name,
      obj.website,
      obj.email,
      obj.Address,
      obj.country,
    ];
    try {
      let res1 = await mysqlDao.doQueryParams(query1, values1);
      let orgId = res1.insertId;
      let values2 = [orgId, obj.company_name, obj.website];
      let res2 = await mysqlDao.doQueryParams(query2, values2);
      return _.isEmpty(res1) && _.isEmpty(res2) ? {} : { res1, res2 };
    } catch (error) {
      return { error };
    }
  };

  this.register = async function (data) {
    console.log(data, "data in register");
    const username = `${data.first_name} ${data.last_name}`;

    let query1 = `
    INSERT INTO sam_users (
      first_name,
      last_name,
      designation_Id, 
      department_Id,
      subdepartment_Id,
      employee_id,
      username,
      email,
      password,
      salt,
      org_id,
      role_id,
      website,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
    let values1 = [
      data.first_name,
      data.last_name,
      data.designationId,
      data.departmentId,
      data.subdepartmentId,
      data.employee_id,
      username,
      data.email,
      data.password,
      data.salt,
      data.org_id,
      data.role_id,
      data.website,
      "1",
    ];

    let res1 = await mysqlDao.doQueryParams(query1, values1);
    const user_id = res1.insertId;

    let query2 = `
    INSERT INTO sam_personal_details (
      official_email_id,
      user_id,
      org_id,
      role_id,
      date_of_joining
    ) VALUES (?, ?, ?, ?, ?);
  `;

    let values2 = [
      data.email,
      user_id,
      data.org_id,
      data.role_id,
      data.date_of_joining || null,
    ];

    let res2 = await mysqlDao.doQueryParams(query2, values2);

    return {
      res1,
      res2,
    };
  };

  this.getLastOtpEntry = async function (email) {
    let query = `select * from sam_lite_user_verify where email=?
       and is_used=0 order by id desc`;
    let values = [email];
    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res[0];
  };

  // old fn
  // this.generateOtp = async function (email, otp) {
  //   console.log(otp, "otpoppp");
  //   let current_time = Math.floor(new Date() / 1000);
  //   let query =
  //     "insert into sam_lite_user_verify (email,otp,timestamp) values (?,?,?)";
  //   let values = [email, otp, current_time];
  //   let res = await mysqlDao.doQueryParams(query, values);
  //   return global._.isEmpty(res) ? {} : res;
  // };

  this.generateOtp = async function (email, otp) {
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);
    let current_time = Math.floor(new Date() / 1000);
    let query =
      "insert into sam_lite_user_verify (email, otp, time_stamp) values (?, ?, ?)";
    let values = [email, hashedOtp, current_time];
    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res;
  };

  // old fn
  // this.verifyOtp = async function (email, otp) {
  //   let current_time = Math.floor(new Date() / 1000);
  //   let time_stamp = current_time - 3600;
  //   let query = `select id , timestamp from sam_lite_user_verify where email=?
  //     and otp=?
  //      and is_used=0 and timestamp > ?;`;
  //   let values = [email, otp, time_stamp];
  //   let res = await mysqlDao.doQueryParams(query, values);

  //   return global._.isEmpty(res) ? {} : res[0];
  // };

  this.verifyOtp = async function (email, otp) {
    const current_time = Math.floor(Date.now() / 1000);
    const expiry_time = current_time - 600; // 10 minutes (600 sec)

    // Get the most recent unused OTP that hasn't expired
    let query = `
      SELECT id, otp FROM sam_lite_user_verify
      WHERE email = ? AND is_used = 0 AND time_stamp > ?
      ORDER BY id DESC LIMIT 1
    `;
    let values = [email, expiry_time];
    let res = await mysqlDao.doQueryParams(query, values);

    if (res.length === 0) {
      return {};
    }

    let hashedOtp = res[0].otp;
    const match = await bcrypt.compare(String(otp).trim(), hashedOtp);

    if (match) {
      return { id: res[0].id }; // Return OTP row id for marking as used
    } else {
      return {};
    }
  };

  this.updateAsUsed = async function (id) {
    let query = "update sam_lite_user_verify set is_used=1 where id= ?";
    let value = [id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.updateUserPassword = async function (encryptedPassword, id, salt = "") {
    let query = "";
    if (salt != "") {
      query =
        "update orion_db.user_master set password = '" +
        encryptedPassword +
        "', salt='" +
        salt +
        "' where id = " +
        id;
    } else {
      query =
        "update orion_db.user_master set password = '" +
        encryptedPassword +
        "' where id = " +
        id;
    }
    let res = await mysqlDao.doQuery(query);
    return global._.isEmpty(res) ? {} : res;
  };

  this.updateAttempCount = async function (id) {
    let query = "update sam_lite_user_verify set attempt=attempt+1 where id=?";
    let value = [id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.updatePassword = async function (encryptedPassword, id, salt = "") {
    let query = "";
    if (salt != "") {
      query =
        "update sam_users set password = '" +
        encryptedPassword +
        "', salt='" +
        salt +
        "'where id = " +
        id;
    } else {
      query =
        "update sam_users set password = '" +
        encryptedPassword +
        "' where id = " +
        id;
    }
    let res = await mysqlDao.doQuery(query);

    return global._.isEmpty(res) ? {} : res;
  };

  this.getAccessModule = async (role_id) => {
    let query = "SELECT * FROM sam_role_rights WHERE id= ?";
    let value = [role_id];
    let res = await mysqlDao.doQueryParams(query, value);
    console.log(res, "response");
    return _.isEmpty(res) ? {} : res[0];
  };

  this.listorganizationUsers = async function (obj) {
    const query = `
        select a.id as user_id, a.username, a.employee_id as Employee_id, a.is_active as IsActive, a.org_id,
        b.designations as Designation, c.department_name as Department, d.image_url, e.role 
        from sam_users as a 
        left join samlite_designations as b on a.designation_Id = b.id
        left join samlite_departments as c on a.department_Id = c.id
        left join sam_personal_details as d on d.user_id = a.id 
        left join sam_role_rights as e on a.role_Id = e.id
        where a.org_id = ?`;

    let value = [obj.org_id];
    let res = await mysqlDao.doQueryParams(query, value);

    return global._.isEmpty(res) ? {} : res;
  };

  this.getorganizationDataById = async function (obj) {
    console.log(obj);
    let query = "SELECT * FROM sam_organizations where id=?";
    let value = [obj.org_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };

  this.getProfileDetails = async function (id) {
    const query = `select a.username, a.employee_id, a.designation_Id,
a.department_Id, a.subdepartment_Id, b.department_name, c.designations, d.subdepartment, e.* from sam_users as a 
left join samlite_departments as b on b.id = a.department_Id
left join samlite_designations as c on c.id = a.designation_Id
left join samliteorg_subdepartments as d on a.subdepartment_Id = d.id
left join sam_personal_details as e on e.user_id = a.id
where a.id = ?`;
    let value = [id];
    let res = await mysqlDao.doQueryParams(query, value);
    return _.isEmpty(res) ? {} : res;
  };

  this.getUserData = async function (obj) {
    let query = `SELECT a.*, b.* FROM sam_personal_details as a
left join sam_users as b on a.user_id = b.id
WHERE b.id = ? AND b.org_id = ?`;
    let values = [obj.user_id, obj.org_id];
    let res = await mysqlDao.doQuery(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.imageUpload = async function (data) {
    let query = `insert into samlite_images(org_id, user_id ,imagename, imagebuffer) values(?,?,?,?)`;
    let values = [data.org_id, data.user_id, data.imagename, data.imagebuffer];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateUserData = async function (Obj, data) {
    const user_id = data.user_id || Obj.id;
    const { org_id } = data;

    // Define which fields belong to which table
    const userTableFields = [
      "username",
      "email",
      "employee_id",
      "designation_Id",
      "department_Id",
      "subdepartment_Id",
    ];
    const personalTableFields = [
      "date_of_joining",
      "probation_period",
      "employee_type",
      "dob",
      "gender",
      "blood_group",
      "marital_status",
      "official_email_id",
      "personal_email_id",
      "phone_number",
      "alternate_phone_number",
      "current_address",
      "permanent_address",
      "work_location",
    ];

    // Arrays to store update parts and values
    const userUpdateFields = [];
    const userValues = [];
    const personalUpdateFields = [];
    const personalValues = [];

    // Separate Obj fields for each table
    for (let key in Obj) {
      console.log(key, "key");
      if (Obj[key] === undefined) continue;

      const value =
        typeof Obj[key] === "object" && Obj[key] !== null
          ? JSON.stringify(Obj[key])
          : Obj[key];

      if (userTableFields.includes(key)) {
        userUpdateFields.push(`${key} = ?`);
        userValues.push(value);
      } else if (personalTableFields.includes(key)) {
        personalUpdateFields.push(`${key} = ?`);
        personalValues.push(value);
      }
    }

    let res1 = null,
      res2 = null;

    // Update sam_users
    if (userUpdateFields.length > 0) {
      console.log(userUpdateFields, "userUpdateFields");
      const query1 = `
      UPDATE sam_users
      SET ${userUpdateFields.join(", ")}
      WHERE id = ? AND org_id = ?
    `;
      console.log("query1--", query1);
      userValues.push(user_id, org_id);
      res1 = await mysqlDao.doQueryParams(query1, userValues);
    } else {
      res1 = { affectedRows: 0 };
    }

    // Update sam_personal_details
    if (personalUpdateFields.length > 0) {
      console.log(personalUpdateFields, "personalUpdateFields");
      const query2 = `
      UPDATE sam_personal_details
      SET ${personalUpdateFields.join(", ")}
      WHERE user_id = ? AND org_id = ?
    `;
      console.log("query2--", query2);
      personalValues.push(user_id, org_id);
      console.log("value2--", personalValues);
      res2 = await mysqlDao.doQueryParams(query2, personalValues);
    } else {
      res2 = { affectedRows: 0 };
    }

    console.log("res 1- ", res1);
    console.log("res 2- ", res2);
    return { res1, res2 };
  };

  this.getUserProfileExistingData = async function (user_id, org_id) {
    const query = `
    SELECT a.username, a.email, a.employee_id, a.designation_Id, a.department_Id, a.subdepartment_Id,
           b.date_of_joining, b.probation_period, b.employee_type, b.dob, b.gender, b.blood_group,
           b.marital_status, b.official_email_id, b.personal_email_id, b.phone_number,
           b.alternate_phone_number, b.current_address, b.permanent_address, b.work_location
    FROM sam_users a
    JOIN sam_personal_details b ON a.id = b.user_id
    WHERE a.id = ? AND a.org_id = ?
  `;

    const [data] = await mysqlDao.doQueryParams(query, [user_id, org_id]);
    return data;
  };

  this.updateProfileAuditLogs = async function (
    oldData,
    newData,
    data,
    user_details,
    insert
  ) {
    console.log(oldData, "oldData");
    console.log(newData, "newData");
    console.log(data, "data");
    console.log(user_details, "user_details");
    const changedFields = [];
    const oldValues = {};
    const newValues = {};

     oldData = oldData || {};

    for (let key in newData) {
      if (
        newData[key] !== undefined &&
        oldData[key] != newData[key] &&
        key !== "user_id" &&
        key !== "org_id"
      ) {
        changedFields.push(key);
        oldValues[key] = oldData[key] || null;
        newValues[key] = newData[key];
      }
    }

    if (changedFields.length === 0) return; // Nothing changed

    // Insert into audit log table
    const queryInsert = `
    INSERT INTO sam_profile_audit_logs 
      (org_id, user_id, action, changed_fields, old_data, new_data, changed_by, changed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

    const values = [
      data.org_id,
      data.user_id,
      insert ? insert : "UPDATE",
      JSON.stringify(changedFields),
      JSON.stringify(oldValues),
      JSON.stringify(newValues),
      user_details.user_id, // who made the change
    ];

    await mysqlDao.doQueryParams(queryInsert, values);
  };

  this.imageUpdate = async function (data) {
    let query = `UPDATE sam_personal_details 
    SET image_url = ?
     WHERE user_id = ?`;
    let values = [data.image_url, data.user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // this.uploadDocuments = async function (data) {
  //   let query = `insert into samlite_documents(org_id, user_id ,file_name, file_buffer, file_type, document_Id, uploaded_by) values(?,?,?,?,?,?,?)`;
  //   let values = [
  //     data.org_id,
  //     data.user_id,
  //     data.Docname,
  //     data.Docbuffer,
  //     data.filetype,
  //     data.ID,
  //     data.uploadedId,
  //   ];
  //   let res = await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res) ? {} : res;
  // };

  // this.getDocuments = async function (id) {
  //   let query = "select *from samlite_documents where user_id=?";
  //   let values = [id];
  //   let res = await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res) ? {} : res;
  // };

  this.uploadDocuments = async function (data) {
    const query = `
    INSERT INTO sam_documents (
      org_id, user_id, file_name, path, file_type, document_Id, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    const values = [
      data.org_id,
      data.user_id,
      data.Docname,
      data.fileUrl,
      data.filetype,
      data.ID,
      data.uploadedId,
    ];

    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getDocuments = async function (id) {
    let query = "select * from sam_documents where user_id=?";
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getDocumentById = async function (id) {
    let query = "select * from sam_documents where id=?";
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getNextEmployeeIdWithPrefix = async function (id, companyPrefix) {
    let query = `
       SELECT employee_id
       FROM sam_users
       WHERE org_id = ?
       ORDER BY CAST(SUBSTRING(employee_id, 4) AS UNSIGNED) DESC
       LIMIT 1;
      `;

    let values = [id];
    const resultsRaw = await mysqlDao.doQueryParams(query, values);
    const results =
      Array.isArray(resultsRaw) && resultsRaw.length > 0 ? resultsRaw : [];

    if (results.length === 0) {
      return `${companyPrefix}001`;
    }

    const lastEmployeeId = results[0]?.employee_id;
    if (!lastEmployeeId) {
      return `${companyPrefix}001`;
    }
    const lastEmployeeIdStr = String(lastEmployeeId);
    const match = lastEmployeeIdStr.match(/(\d+)$/);

    if (!match) {
      return `${companyPrefix}001`;
    }
    const nextNumber = parseInt(match[0], 10) + 1;
    const formattedNumber = nextNumber.toString().padStart(3, "0");
    return `${companyPrefix}${formattedNumber}`;
  };

  this.getImage = async function (id) {
    const query =
      "select imagename, imagebuffer from samlite_images where user_id=?";
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // this.deleteDocuments = async function (obj) {
  //   const query = "delete from samlite_documents where id=? AND org_id=?;";
  //   let values = [obj.document_Id, obj.org_id];
  //   let res = await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res) ? {} : res;
  // };

  this.deleteDocuments = async function (obj) {
    const query = "delete from sam_documents where id=? AND org_id=?;";
    let values = [obj.document_Id, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.uploadUsersIp = async function (ip, userId) {
    const checkQuery = `SELECT * FROM sam_user_ip_log WHERE user_id = ?`;
    const existing = await mysqlDao.doQueryParams(checkQuery, [userId]);

    if (_.isEmpty(existing)) {
      // First-time login - insert IP
      const insertQuery = `INSERT INTO sam_user_ip_log(user_id, ip_address) VALUES (?, ?)`;
      await mysqlDao.doQueryParams(insertQuery, [userId, ip]);
      return { new: true, ip };
    } else {
      const existingIp = existing[0].ip_address;

      if (existingIp !== ip) {
        // IP changed – delete old IP and insert new one
        const deleteQuery = `DELETE FROM sam_user_ip_log WHERE user_id = ?`;
        await mysqlDao.doQueryParams(deleteQuery, [userId]);

        const insertQuery = `INSERT INTO sam_user_ip_log(user_id, ip_address) VALUES (?, ?)`;
        await mysqlDao.doQueryParams(insertQuery, [userId, ip]);

        return { new: true, ip }; // trigger email alert
      } else {
        // Same IP, no alert
        return { new: false, ip };
      }
    }
  };

  this.getUserdata = async function (id, data) {
    const userDataResults = [];
    for (let userId in data.usersID) {
      if (data.usersID[userId]) {
        const query = `SELECT u.username, u.email, o.org_name, o.address as Address 
                          FROM sam_users u
                          INNER JOIN sam_lite.sam_organizations o ON u.org_id = o.id
                          WHERE u.id = ? AND org_id = ?;`;

        let values = [userId, id];
        let res = await mysqlDao.doQueryParams(query, values);
        if (!_.isEmpty(res)) {
          userDataResults.push(res);
        }
      }
    }
    return userDataResults.length > 0 ? userDataResults : [];
  };

  this.getAdminData = async function (org_id, user_id) {
    let query = `select username from sam_users where id=? AND org_id=?`;
    let values = [user_id, org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getUsersDataByUserId = async function (obj) {
    let query = `SELECT u.username, u.email, o.org_name, o.address as Address
    FROM sam_users u
    INNER JOIN sam_organizations o ON u.org_id = o.id
    WHERE u.id in (?) AND u.org_id = ?;`;
    let values = [obj.users, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkEmployeeId = async function (data, id) {
    let query = `select * from sam_personal_details as a
   left join sam_users as b on a.user_id = b.id  
   WHERE BINARY b.employee_id=? AND b.org_id=?`;
    let values = [data.employeeId, id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.listOrganization = async function () {
    let query = `SELECT o.id, o.org_name, COUNT(u.org_id) AS employee_count
   FROM sam_lite.sam_organizations o
   LEFT JOIN sam_users u ON o.id = u.org_id
   GROUP BY o.id, o.org_name;
`;
    let res = await mysqlDao.doQuery(query);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateOrganization = async function (data) {
    let query1 = `update sam_organizations SET org_name=? where id=?`;
    let values1 = [data.updatedOrgName, data.id];
    let query2 = `update samlite_company_details SET company_name=? where org_id=?`;
    let values2 = [data.updatedOrgName, data.id];
    let res1 = await mysqlDao.doQueryParams(query1, values1);
    let res2 = await mysqlDao.doQueryParams(query2, values2);
    // console.log(res, "response")
    return _.isEmpty(res1) && _.isEmpty(res2) ? {} : { res1, res2 };
  };

  this.deleteOrganization = async function (Id) {
    // Id is already a single value, no need to convert it to an array
    const queries = [
      `DELETE FROM sam_organizations WHERE id=?`,
      `DELETE FROM holiday_calender WHERE org_id=?`,
      `DELETE FROM sam_assigned_leave_details WHERE org_id=?`,
      `DELETE FROM sam_leave_applications WHERE org_id=?`,
      `DELETE FROM sam_leave_rules WHERE org_id=?`,
      `DELETE FROM sam_leave_types WHERE org_id=?`,
      `DELETE FROM sam_users WHERE org_id=?`,
      `DELETE FROM samlite_departments WHERE org_id=?`,
      `DELETE FROM samlite_designations WHERE org_id=?`,
      `DELETE FROM samlite_documents WHERE org_id=?`,
      `DELETE FROM samlite_images WHERE org_id=?`,
      `DELETE FROM samlite_resignations WHERE org_id=?`,
      `DELETE FROM samlitemonthly_records WHERE org_id=?`,
      `DELETE FROM samliteorg_subdepartments WHERE org_id=?`,
      `DELETE FROM sam_personal_details  WHERE org_id=?`,
      `DELETE FROM work_week_mapping WHERE org_id=?`,
      `DELETE FROM work_week_rule_config WHERE org_id=?`,
    ];

    let res = {}; // To store results of deletions
    try {
      // Loop through each delete query
      for (let query of queries) {
        let result = await mysqlDao.doQueryParams(query, [Id]); // Run query with org_id as parameter
        if (result.affectedRows > 0) {
          res[query] = result; // If deletion was successful, store result
        }
      }
      // Return results of deletions, or an empty object if no rows were deleted
      return _.isEmpty(res) ? {} : res;
    } catch (error) {
      throw error; // Catch and throw any error that happens
    }
  };

  // this.verifyDocument = async function (body) {
  //   let query = ` UPDATE samlite_documents SET verification = ? where id=? AND user_id=?`;
  //   let values = ["verified", body.docid, body.id];
  //   let res = await mysqlDao.doQueryParams(query, values);
  //   return _.isEmpty(res) ? {} : res;
  // };

  this.verifyDocument = async function (body) {
    let query = ` UPDATE sam_documents SET verification = ? where id=? AND user_id=?`;
    let values = ["verified", body.docid, body.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkWorkWeekAssigned = async function (id) {
    const query = `select work_week_configId from sam_lite.work_week_mapping where user_id=?`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getFSUsersDataByUserId = async function (obj) {
    let query = `SELECT u.username, sr.personal_email_id AS email, o.org_name, o.Address 
  FROM sam_users u
  INNER JOIN sam_organizations o ON u.org_id = o.id
  INNER JOIN samlite_resignations sr ON u.id = sr.user_id
  WHERE u.org_id = ? AND  u.id in (?)`;
    let values = [obj.org_id, obj.users];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateUserStatus = async function (obj) {
    let query = `
    UPDATE sam_users 
    SET is_active = ? 
    WHERE id = ? AND org_id = ?;
  `;
    let values = [obj.Is_Active, obj.user_id, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkIsActiveUser = async function (email) {
    let query = `
    SELECT is_active 
    FROM sam_users 
    WHERE email = ?;
  `;
    let values = [email];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // Delete users
  this.deleteUser = async function (data) {
    const userIds = Array.isArray(data.userIds)
      ? data.userIds
      : typeof data.userIds === "string"
        ? data.userIds.split(",")
        : [];

    if (userIds.length === 0 || userIds.some((id) => !id.toString().trim())) {
      throw new Error("Invalid user IDs provided.");
    }

    const queries = [
      `DELETE FROM sam_users WHERE id=?`,
      `DELETE FROM sam_personal_details WHERE user_id=?`,
      `DELETE FROM work_week_mapping WHERE user_id=?`,
      `DELETE FROM samlitemonthly_records WHERE user_id=?`,
      `DELETE FROM samlite_documents WHERE user_id=?`,
      `DELETE FROM sam_liteclockevents WHERE user_id=?`,
      `DELETE FROM sam_leave_applications WHERE user_id=?`,
      `DELETE FROM sam_applied_leaves WHERE user_id=?`,
      `DELETE FROM sam_assigned_leave_details WHERE user_id=?`,
      `DELETE FROM sam_lite_leave_accrual_history WHERE user_id=?`,
    ];

    let res = { affectedRows: 0 };

    try {
      for (let userId of userIds) {
        let userRes = { success: [], failed: [] };

        for (let query of queries) {
          try {
            let result = await mysqlDao.doQueryParams(query, [userId]);
            if (result.affectedRows > 0) {
              userRes.success.push(query);
            } else {
              userRes.failed.push(query);
            }
          } catch (queryError) {
            userRes.failed.push({ query, error: queryError.message });
          }
        }

        if (userRes.success.length > 0) {
          res.affectedRows = res.affectedRows + 1;
        }
      }
      return Object.keys(res).length ? res : {};
    } catch (error) {
      console.error("Delete User Error:", error);
      throw new Error(
        "Failed to delete user records. Please check logs for details.",
      );
    }
  };

  this.getOrganizationUserDetailsById = async function (obj) {
    const query = `
    select a.id as user_id, a.first_name, a.last_name, a.email, a.is_active as IsActive, a.org_id,
           c.department_name as Department, f.subdepartment as SubDepartment, b.designations as Designation, d.image_url, e.role 
    from sam_users as a 
    left join samlite_designations as b on a.designation_Id = b.id
    left join samlite_departments as c on a.department_Id = c.id
    left join sam_personal_details as d on d.user_id = a.id 
    left join sam_role_rights as e on a.role_Id = e.id
    left join samliteorg_subdepartments as f on a.org_id = f.org_id AND a.subdepartment_Id = f.id
    where a.org_id = ? and a.id = ?`;
    let values = [obj.org_id, obj.user_Id];
    let res = await mysqlDao.doQueryParams(query, values);

    return global._.isEmpty(res) ? {} : res[0];
  };

  // Get user by ID
//   this.getUserById = async function (id, org_id) {
//   const query = `
//     SELECT *
//     FROM sam_users
//     WHERE id = ?
//     AND org_id = ? AND is_active = 1
//   `;
//   const res = await mysqlDao.doQueryParams(query, [id, org_id]);
//   return res.length ? res[0] : null;
// };

this.updateusersManagers = async function (user_id, manager1, manager2) {
  const query = `
    UPDATE sam_users
    SET reporting_manager_id1 = ?,
        reporting_manager_id2 = ?
    WHERE id = ?
  `;

  return await mysqlDao.doQueryParams(query, [
    manager1,
    manager2,
    user_id
  ]);
};

  // Update user in sam_users
  this.updateUserDetails = async function (data, id) {
    let username = `${data.first_name} ${data.last_name}`;
    let query = `
    UPDATE sam_users 
    SET first_name = ?, 
        last_name = ?, 
        email = ?, 
        role_id = ?, 
        designation_Id = ?, 
        department_Id = ?, 
        subdepartment_Id = ?, 
        username = ?
    WHERE id = ?;
  `;
    let values = [
      data.first_name,
      data.last_name,
      data.email,
      data.role_id,
      data.designationId,
      data.departmentId,
      data.subdepartmentId,
      username,
      id,
    ];
    return await mysqlDao.doQueryParams(query, values);
  };

  // Update personal details in sam_personal_details
  this.updatePersonalDetails = async function (data, userId, orgId) {
    let query = `
    UPDATE sam_personal_details 
    SET official_email_id = ?, 
        role_Id = ? 
    WHERE user_id = ? AND org_id = ?;
  `;
    let values = [data.email, data.role_id, userId, orgId];
    return await mysqlDao.doQueryParams(query, values);
  };

  // Check if users are assigned to projects
  this.getAssignedUsers = async function (userIds) {
    let placeholders = userIds.map(() => "?").join(",");
    let query = `
    SELECT DISTINCT u.id, u.first_name, u.last_name
    FROM sam_users u
    INNER JOIN sam_project_user_roles pur ON pur.user_id = u.id
    WHERE u.id IN (${placeholders})
  `;
    let values = userIds;
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? [] : res;
  };

  this.listActiveDirectoryUsers = async function (obj) {
    const query = `
      select a.id as user_id, a.username, a.employee_id as Employee_id, a.is_active as IsActive, a.org_id,
      b.designations as Designation, c.department_name as Department, d.image_url, e.role 
      from sam_users as a 
      left join samlite_designations as b on a.designation_Id = b.id
      left join samlite_departments as c on a.department_Id = c.id
      left join sam_personal_details as d on d.user_id = a.id 
      left join sam_role_rights as e on a.role_Id = e.id
      where a.org_id = ? and a.is_active = 1`;

    let value = [obj.org_id];
    let res = await mysqlDao.doQueryParams(query, value);

    return global._.isEmpty(res) ? {} : res;
  };

  this.getFeatures = async function () {
    let query = `SELECT feature_id, feature_name, description FROM sam_features order by feature_id desc`;
    let res = await mysqlDao.doQueryParams(query);
    return global._.isEmpty(res) ? {} : res;
  };

  this.addFeature = async function (data) {
    const query = `insert into sam_features(feature_name, description) values(?,?) `;
    let values = [data.feature_name, data.feature_site, data.description];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getExistingFeatures = async function (data) {
    let query = `SELECT feature_id, org_id FROM sam_assigned_features where feature_id in (?) and org_id in (?)`;
    let values = [data.features, data.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res;
  };

  this.assignFeature = async (obj) => {
    const query = `
    INSERT INTO sam_assigned_features (feature_id, org_id)
    VALUES (?, ?)
  `;

    const results = [];

    const features = Array.isArray(obj.features)
      ? obj.features
      : [obj.features];

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];

      const values = [feature, obj.org_id];
      const res = await mysqlDao.doQueryParams(query, values);
      results.push(res);
    }

    return _.isEmpty(results) ? {} : results[0];
  };

  this.getAssignedFeatureOrg = async function () {
    let query = `select a.feature_id, b.id, b.org_name from sam_assigned_features as a
    inner join sam_organizations as b on a.org_id = b.id`;
    let res = await mysqlDao.doQueryParams(query);
    return global._.isEmpty(res) ? {} : res;
  };

  this.deleteFeature = async (obj) => {
    let query1 = `
    DELETE FROM sam_features
    WHERE feature_id = ?;
  `;

    let query2 = `
    DELETE FROM sam_assigned_features
    WHERE feature_id in (?);
  `;

    let value = [obj.feature_id];

    let res1 = await mysqlDao.doQueryParams(query1, value);
    let res2 = await mysqlDao.doQueryParams(query2, value);

    return {
      details_deleted: global._.isEmpty(res1) ? {} : { ...res1 },
      feature_deleted: global._.isEmpty(res2) ? {} : { ...res2 },
    };
  };

  this.deleteAssignedFeature = async function (obj) {
    const query = `DELETE FROM sam_assigned_features WHERE org_id = ? AND feature_id = ?`;
    const values = [obj.org_id, obj.feature_id];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.featuresAccess = async function (data, org_id) {
    let query = `select * from sam_assigned_features 
    where feature_id = ? and org_id = ?`;
    let values = [1, org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res;
  };

  // Refresh Token api Start
  this.saveRefreshToken = async function (user_id, refresh_token, expires_at) {
    const sql = `
    INSERT INTO sam_user_refresh_tokens (user_id, refresh_token, expires_at)
    VALUES (?, ?, ?)
  `;
    const values = [user_id, refresh_token, expires_at];
    return await mysqlDao.doQueryParams(sql, values);
  };

  this.getRefreshToken = async function (refresh_token) {
    const sql = `SELECT * FROM sam_user_refresh_tokens WHERE refresh_token = ?`;
    const values = [refresh_token];
    const res = await mysqlDao.doQueryParams(sql, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res[0];
  };

  this.deleteRefreshToken = async function (refresh_token) {
    const sql = `DELETE FROM sam_user_refresh_tokens WHERE refresh_token = ?`;
    const values = [refresh_token];
    return await mysqlDao.doQueryParams(sql, values);
  };

  this.usersDetailsById = async function (id) {
    const sql = `SELECT * FROM sam_users WHERE id = ?`;
    const values = [id];
    const res = await mysqlDao.doQueryParams(sql, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res[0];
  };

  this.deleteAllUserRefreshTokens = async function (user_id) {
    let query = `
    DELETE FROM sam_user_refresh_tokens
    WHERE user_id = ?;
  `;
    let values = [user_id];
    return await mysqlDao.doQueryParams(query, values);
  };
  // Refresh Token api End

  //insert or adding eduction
  this.addEduction = async function (user_id, obj) {
    const query = `
    INSERT INTO sam_users_education (user_id, education_level, degree_name, field_of_study, institute, university_name, 
    start_date, end_date, grade, country, mode_of_study, status, remarks, docname, attachment_url) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
        `;
    let values = [
      user_id,
      obj.education_level,
      obj.degree_name,
      obj.field_of_study,
      obj.institute,
      obj.university_name,
      obj.start_date,
      obj.end_date,
      obj.grade || null,
      obj.country || null,
      obj.mode_of_study || null,
      obj.status || null,
      obj.remarks || null,
      obj.Docname || null,
      obj.attachment_url || null,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res;
  };

  // get or view eduction by id
  this.getEductionById = async function (user_id) {
    // let query = `select * from sam_users_education where user_id=? ;`;
    let query = `select education_id,user_id,education_level,degree_name,field_of_study,institute,
                university_name, DATE_FORMAT(start_date, '%Y') as start_date, DATE_FORMAT(end_date, '%Y') as end_date, 
                grade, country, docname, mode_of_study, status, remarks from sam_users_education  where user_id=?;
                `;
    let values = [user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res;
  };

  // get  eduction by education_id for downloading
  this.downloadEductionAttachment = async function (education_id) {
    let query = `select education_id,user_id, docname, attachment_url from sam_users_education  where education_id=? ;
                `;
    let values = [education_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res[0];
  };

  //check the eduction
  this.checkDocument = async function (obj) {
    let query = `select attachment_url from sam_users_education where education_id=? ;`;
    let values = [obj.education_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res[0];
  };

  // delete eduction by user_id with eduction id
  this.deleteEductionById = async function (obj) {
    let query = `delete from sam_users_education where education_id=? ;`;
    let values = [obj.education_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res;
  };

  this.getExistingEducationData = async function (user) {
    const query = `
    SELECT * from sam_users_education
    WHERE user_id = ?
  `;
    const [data] = await mysqlDao.doQueryParams(query, [
      user.user_id
    ]);
    return data;
  };

  //updated eduction details
  this.updateEducationData = async function (Obj, data) {
    const { user_id, education_id } = data;
    const educationFields = [];
    const values = [];

    for (const key in Obj) {
      if (Obj[key] !== undefined) {
        if (Obj[key] !== null && typeof Obj[key] === "object") {
          educationFields.push(`${key} = ?`);
          values.push(JSON.stringify(Obj[key]));
        } else {
          educationFields.push(`${key} = ?`);
          values.push(Obj[key]);
        }
      }
    }

    if (educationFields.length === 0) return { affectedRows: 0 };

    const query = `
    UPDATE sam_users_education
    SET ${educationFields.join(", ")}
    WHERE user_id = ? AND education_id = ?
  `;
    values.push(user_id, education_id);

    const res = await mysqlDao.doQueryParams(query, values);
    return res;
  };

  //checking number is same or not
  this.checkNumber = async function (user_id) {
    const query = `
      SELECT user_id, phone_number, personal_email_id FROM sam_personal_details
      WHERE user_id = ?;
    `;
    const res = await mysqlDao.doQueryParams(query, [user_id]);
    if (!res || res.length === 0) {
      return {};
    }
    return res[0];
  };

  this.checkName = async function (user_id) {
    const query = `
      SELECT full_name, primary_contact_number FROM sam_users_emergency_contact where user_id=?;
    `;
    const res = await mysqlDao.doQueryParams(query, [user_id]);
    if (!res || res.length === 0) {
      return {};
    }
    return res[0];
  };

  //insert or adding Family Emergency Contact
  this.addEmergencyContact = async function (user_id, obj) {
    const query = `
    INSERT INTO sam_users_emergency_contact (
    user_id, full_name, relationship_with_employee, primary_contact_number, address,
    alternate_contact_number, email_address, priority_level, remarks ) 
    VALUES (?,?,?,?,?,?,?,?,?);
        `;
    let values = [
      user_id,
      obj.full_name,
      obj.relationship_with_employee,
      obj.primary_contact_number,
      obj.address,
      obj.alternate_contact_number,
      obj.email_address,
      obj.priority_level,
      obj.remarks,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return global._.isEmpty(res) ? {} : res;
  };

  //get or view Family Emergency Contact
  this.getEmergencyContactById = async function (user_id) {
    let query = `select * from sam_users_emergency_contact where user_id=? ;`;
    let values = [user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res;
  };

  //delete Family Emergency Contact
  this.deleteEmergencyContactById = async function (obj) {
    let query = `delete from sam_users_emergency_contact where pri_contact_id=? ;`;
    let value = [obj.pri_contact_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res;
  };

  this.getExistingEmergencyData = async function (user) {
    const query = `
    SELECT * from sam_users_emergency_contact
    WHERE user_id = ?
  `;
    const [data] = await mysqlDao.doQueryParams(query, [
      user.user_id
    ]);
    return data;
  };

  //updated Family Emergency Contact
  this.updateEmergencyContact = async function (Obj, data) {
    const { user_id, pri_contact_id } = data;
    const updateFields = [];
    const values = [];

    for (let key in Obj) {
      if (Obj[key] === undefined) continue;

      // If the value is an object or array, stringify it
      if (typeof Obj[key] === "object" && Obj[key] !== null) {
        updateFields.push(`${key} = ?`);
        values.push(JSON.stringify(Obj[key]));
      } else {
        updateFields.push(`${key} = ?`);
        values.push(Obj[key]);
      }
    }

    if (updateFields.length === 0) return { affectedRows: 0 };

    const query = `
    UPDATE sam_users_emergency_contact
    SET ${updateFields.join(", ")}
    WHERE user_id = ? AND pri_contact_id = ?
  `;

    values.push(user_id, pri_contact_id);

    const res = await mysqlDao.doQueryParams(query, values);
    return res;
  };

  //save device token (FCM Token)
  this.saveFcmToken = async function (userId, obj) {
    const updateQuery = `
        UPDATE sam_users_device_tokens
        SET fcm_token = ?, created_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND device_type = ?`;

    const updateValues = [obj.fcm_token, userId, obj.device_type];
    const res1 = await mysqlDao.doQueryParams(updateQuery, updateValues);

    // If no rows were affected, insert the new record
    if (res1.affectedRows === 0) {
      const insertQuery = `
            INSERT INTO sam_users_device_tokens (user_id, fcm_token, device_type)
            VALUES (?, ?, ?)`;

      const insertValues = [userId, obj.fcm_token, obj.device_type];
      const res2 = await mysqlDao.doQueryParams(insertQuery, insertValues);
      return res2;
    }
    return res1;
  };

  this.getOrgProfileAuditLogs = async function (user) {
    const query = `
    SELECT 
    b.*, 
    a.username,
    a.employee_id,
    CASE 
        WHEN b.changed_by IS NOT NULL THEN
            (SELECT username FROM sam_users WHERE id = b.changed_by)
        ELSE NULL
    END AS changed_by_name
FROM sam_users AS a
INNER JOIN sam_profile_audit_logs AS b
    ON a.id = b.user_id
WHERE a.org_id = ?
  `;
    let res = await mysqlDao.doQueryParams(query, user.org_id);
    return global._.isEmpty(res) ? {} : res;
  };

  this.getProfileAuditLogs = async function (user) {
    const query = `
    SELECT 
    b.*, 
    a.username,
    a.employee_id,
    CASE 
        WHEN b.changed_by IS NOT NULL THEN
            (SELECT username FROM sam_users WHERE id = b.changed_by)
        ELSE NULL
    END AS changed_by_name
FROM sam_users AS a
INNER JOIN sam_profile_audit_logs AS b
    ON a.id = b.user_id
WHERE a.id = ?
  `;
    let res = await mysqlDao.doQueryParams(query, user.user_id);
    return global._.isEmpty(res) ? {} : res;
  };

//////////////////////////////////////ReportingAuthority/////////////////////////////////////
//AddReportingManager
// get manager by user id
this.getManagerByUserId = async function (user_id) {
  let query = `
    SELECT *
    FROM sam_reporting_manager
    WHERE user_id = ?
  `;
  return await mysqlDao.doQueryParams(query, [user_id]);
};


// add reporting manager
this.addReportingManager = async function (
  user_id,
  department_id,
  org_id,
  manager_name,
  is_active = 1
) {
  let query = `
    INSERT INTO sam_reporting_manager 
    (user_id, department_id, org_id, manager_name, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;
  return await mysqlDao.doQueryParams(query, [
    user_id,
    department_id,
    org_id,
    manager_name,
    is_active
  ]);
};

this.getUserById = async function (user_id, org_id) {
  const query = `
    SELECT id
    FROM sam_users
    WHERE id = ?
    AND org_id = ?
    AND is_active = 1
  `;

  return await mysqlDao.doQueryParams(query, [user_id, org_id]);

};

this.getReportingManagerRecord = async function (manager_id, org_id) {
  const query = `
    SELECT id
    FROM sam_reporting_manager
    WHERE id = ?
    AND org_id = ?
  `;
  return await mysqlDao.doQueryParams(query, [
    manager_id,
    org_id
  ]);

};

this.getReportingManagersByIds = async function (manager_ids) {
  const query = `
    SELECT id, user_id
    FROM sam_reporting_manager
    WHERE id IN (?)
      AND is_active = 1
  `;
  return await mysqlDao.doQueryParams(query, [manager_ids]);
};

this.checkIfManagerAlreadyAssigned = async function (
  userId,
  managerId
) {
  const query = `
    SELECT id
    FROM sam_users
    WHERE id = ?
    AND reporting_manager_id = ?
  `;

  return mysqlDao.doQueryParams(query, [
    userId,
    managerId
  ]);
};

this.getAssignedManagerCount = async function (userId) {
  const query = `
    SELECT COUNT(*) as count
    FROM sam_reporting_manager
    WHERE id = ?
    AND is_active = 1
  `;

  return mysqlDao.doQueryParams(query, [userId]);
};

this.updateReportingManager = async function (userId, value, orgId) {
  const query = `
    UPDATE sam_users
    SET reporting_manager_id = ?
    WHERE id = ?
    AND org_id = ?
  `;

  return mysqlDao.doQueryParams(query, [value, userId, orgId]);
};


this.getManagersList = async function (org_id) {
  const query = `
    SELECT
      rm.id AS reporting_manager_record_id,
      rm.user_id AS manager_user_id,
      rm.manager_name,
      u.email,
      u.employee_id,
      u.designation_Id,
      u.department_Id
    FROM sam_reporting_manager rm
    JOIN sam_users u
      ON u.id = rm.user_id
    WHERE rm.org_id = ?
      AND u.is_active = 1
    ORDER BY manager_name ASC
  `;
  return await mysqlDao.doQueryParams(query, [org_id]);
};


this.getUsersReportingList = async function (org_id) {
  const query = `
    SELECT
      u.id AS user_id,
      u.username,
      u.department_Id AS department_id,
      d.department_name AS department_name,
      des.designations AS designation_name,

      rm1.manager_name AS reporting_manager1_name,
      rm1.id AS reporting_manager1_record_id,

      rm2.manager_name AS reporting_manager2_name,
      rm2.id AS reporting_manager2_record_id,
      r.role

    FROM sam_users u

    LEFT JOIN samlite_departments d
      ON d.id = u.department_Id

    LEFT JOIN samlite_designations des
      ON des.id = u.designation_Id

    -- First Manager
    LEFT JOIN sam_reporting_manager rm1
      ON rm1.id = u.reporting_manager_id1
      AND rm1.is_active = 1

    -- Second Manager
    LEFT JOIN sam_reporting_manager rm2
      ON rm2.id = u.reporting_manager_id2
      AND rm2.is_active = 1

    LEFT JOIN sam_role_rights r
      ON r.id = u.role_id

    WHERE u.org_id = ?
      AND u.is_active = 1

    ORDER BY u.first_name ASC
  `;

  return await mysqlDao.doQueryParams(query, [org_id]);
};

this.getReportingManagerById = async function (managerId, orgId) {
  const query = `
    SELECT id 
    FROM sam_reporting_manager
    WHERE id = ?
    AND org_id = ?
  `;
  return mysqlDao.doQueryParams(query, [managerId, orgId]);
};


this.checkUsersUnderManager = async function (managerId) {
  const query = `
    SELECT id 
    FROM sam_users
    WHERE reporting_manager_id = ?
  `;
  return mysqlDao.doQueryParams(query, [managerId]);
};


this.DeleteReportingManager = async function (managerId) {
  const query = `
    DELETE FROM sam_reporting_manager
    WHERE id = ?
  `;
  return mysqlDao.doQueryParams(query, [managerId]);
};


this.updateUserManager = async function (userId, managerId) {
  const query = `
    UPDATE sam_users
    SET reporting_manager_id = ?
    WHERE id = ?
  `;
  return mysqlDao.doQueryParams(query, [managerId, userId]);
};


this.removeUserManager = async function (
  userId,
  removeManager1,
  removeManager2
) {
  let fields = [];

  if (removeManager1) {
    fields.push("reporting_manager_id1 = NULL");
  }

  if (removeManager2) {
    fields.push("reporting_manager_id2 = NULL");
  }

  const query = `
    UPDATE sam_users
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  return mysqlDao.doQueryParams(query, [userId]);
};

this.getAssignedManagersByUserId = async function (user_id, orgId) {
  const query = `
    SELECT
      u.id AS user_id,
      u.username,

      -- Manager 1
      mu1.id AS reporting_manager1_user_id,
      mu1.username AS reporting_manager1_username,
      d1.department_name AS reporting_manager1_department,
      des1.designations AS reporting_manager1_designation,
      rm1.is_active AS reporting_manager1_status,

      -- Manager 2
      mu2.id AS reporting_manager2_user_id,
      mu2.username AS reporting_manager2_username,
      d2.department_name AS reporting_manager2_department,
      des2.designations AS reporting_manager2_designation,
      rm2.is_active AS reporting_manager2_status

    FROM sam_users u

    LEFT JOIN sam_reporting_manager rm1
      ON rm1.id = u.reporting_manager_id1
      AND rm1.org_id = u.org_id

    LEFT JOIN sam_users mu1
      ON mu1.id = rm1.user_id

    LEFT JOIN samlite_departments d1
      ON d1.id = mu1.department_Id

    LEFT JOIN samlite_designations des1
      ON des1.id = mu1.designation_Id

    LEFT JOIN sam_reporting_manager rm2
      ON rm2.id = u.reporting_manager_id2
      AND rm2.org_id = u.org_id

    LEFT JOIN sam_users mu2
      ON mu2.id = rm2.user_id

    LEFT JOIN samlite_departments d2
      ON d2.id = mu2.department_Id

    LEFT JOIN samlite_designations des2
      ON des2.id = mu2.designation_Id

    WHERE u.id = ?
      AND u.org_id = ?
      AND u.is_active = 1;
  `;

  return await mysqlDao.doQueryParams(query, [
    user_id,
    orgId
  ]);
};


}

module.exports = new obj();
