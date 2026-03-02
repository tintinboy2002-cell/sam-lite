var mysqlDao = require(__base + "/dao/mysqlDao");
const { encrypt } = require('../utils/encryption');
const { decrypt } = require("../utils/encryption");

function obj() {
  this.getPayrollStructure = async function (org_id) {
    const query = `SELECT p.id, p.name,
        p.description,
        p.basic_formula,
        p.hra_formula,
        p.conveyance_allowance_formula,
        p.special_allowance_formula,
        p.overtime,count(ap.user_id) as no_of_employees FROM sam_payroll_structure as p
        left join sam_assigned_payroll_details as ap on p.id = ap.payroll_structure_id
        left join sam_users as u on u.id = p.updated_by
        where org_id = ?
        group by
        p.id,
        p.name,
        p.description,
        p.basic_formula,
        p.hra_formula,
        p.conveyance_allowance_formula,
        p.special_allowance_formula,
        p.overtime;`;
    let values = [org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.createPayrollStructure = async (obj) => {
    const query = `INSERT INTO sam_payroll_structure
        (name,
        description,
        basic_formula,
        hra_formula,
        conveyance_allowance_formula,
        special_allowance_formula,
        overtime,
        updated_by) 
        VALUES
        (?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?);
        `;

    let values = [
      obj.name,
      obj.description,
      obj.basic_formula,
      obj.hra_formula,
      obj.conveyance_allowance_formula,
      obj.special_allowance_formula,
      obj.overtime,
      obj.user_id,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updatePayrollStructure = async (obj) => {
    const query = `	UPDATE sam_payroll_structure
	SET
	name = ?,
	description = ?,
	basic_formula = ?,
	hra_formula = ?,
	conveyance_allowance_formula = ?,
	special_allowance_formula = ?,
	overtime = ?,
    updated_by = ?
	WHERE id = ?;`;

    let values = [
      obj.name,
      obj.description,
      obj.basic_formula,
      obj.hra_formula,
      obj.conveyance_allowance_formula,
      obj.special_allowance_formula,
      obj.overtime,
      obj.user_id,
      obj.id,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.fetchOldPayrollStructureDataForLogs = async (obj) => {
    const query = `SELECT * FROM sam_payroll_structure WHERE id = ?`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getPayrollDetailsForLogss = async (obj) => {
    const query = `SELECT * FROM sam_assigned_payroll_details WHERE id = ?;`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getPayrollStructureDetailsForLogs = async (obj) => {
    const query = `SELECT * FROM sam_payroll_structure WHERE id = ?`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deletePayrollStructure = async (obj) => {
    const query = `DELETE FROM sam_payroll_structure
	WHERE id = ?;`;

    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.assignPayrollToMultipleUsers = async (obj) => {
    // Extract payroll IDs from sam_assigned_payroll_details
    const payroll_structure_id = obj.payroll_structure.map(
      (payroll) => payroll.id
    );

    // Step 1: Fetch already assigned payrolls for all users
    const query = `SELECT user_id, payroll_structure_id FROM sam_assigned_payroll_details WHERE user_id IN (?)`;
    const values = [obj.users];
    const assignedPayrollStructure = await mysqlDao.doQueryParams(
      query,
      values
    );

    // Step 2: Create a map to store assigned payroll for each user
    const assignedMap = {};
    assignedPayrollStructure.forEach((row) => {
      assignedMap[row.user_id] = row.payroll_structure_id;
    });

    // Step 3: Prepare insert and update queries
    const newAssignments = [];
    const updateAssignments = [];

    obj.users.forEach((userId) => {
      const newPayrollId = payroll_structure_id[0]; // Ensuring only one payroll per user
      if (assignedMap[userId]) {
        // If user already has a payroll structure, update it
        updateAssignments.push([
          newPayrollId,
          obj.user_id,
          obj.effective_date,
          userId,
        ]);
      } else {
        // If user doesn't have a payroll, insert a new one
        newAssignments.push([
          userId,
          newPayrollId,
          0,
          obj.user_id,
          obj.effective_date,
        ]);
      }
    });

    let updateCount = 0;
    // Step 4: Execute updates
    if (updateAssignments.length > 0) {
      const updateQuery = `UPDATE sam_assigned_payroll_details 
                             SET payroll_structure_id = ?, created_by = ?, effective_from = ? 
                             WHERE user_id = ?`;
      for (const update of updateAssignments) {
        const res = await mysqlDao.doQueryParams(updateQuery, update);
        updateCount += res.affectedRows || 0;
      }
    }

    let insertResponse = {};
    // Step 5: Execute inserts
    if (newAssignments.length > 0) {
      const insertQuery = `INSERT INTO sam_assigned_payroll_details (user_id, payroll_structure_id, ctc, created_by, effective_from)
                             VALUES ${newAssignments
                               .map(() => "(?, ?, ?, ?, ?)")
                               .join(", ")}`;
      const insertValues = newAssignments.flat();
      insertResponse = await mysqlDao.doQueryParams(insertQuery, insertValues);
    }

    // Return meaningful response
    if (updateCount > 0 && Object.keys(insertResponse).length > 0) {
      return { updated: updateCount, inserted: insertResponse };
    } else if (updateCount > 0) {
      return { updated: updateCount };
    } else if (Object.keys(insertResponse).length > 0) {
      return insertResponse;
    }

    return {}; // No changes made
  };

  this.removeAssignedPayrollStructure = async (obj) => {
    const query = `DELETE FROM sam_assigned_payroll_details
	WHERE id = ?;`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  //decrypt the salary
  this.getPayrollDetails = async function (org_id) {
    const query = `
    SELECT ap.id AS assigned_id, u.id AS user_id, p.id AS payroll_structure_id, 
           p.name AS payroll_name, p.description AS payroll_description,
           u.username AS employee_name, u.employee_id,
           d.designations AS designation,
           ap.ctc, ap.conveyance_allowance,
           p.basic_formula, p.hra_formula, p.overtime
    FROM sam_users AS u
    LEFT JOIN sam_assigned_payroll_details AS ap ON u.id = ap.user_id
    LEFT JOIN sam_payroll_structure AS p ON p.id = ap.payroll_structure_id
    LEFT JOIN samlite_designations AS d ON u.designation_Id = d.id
    WHERE u.org_id = ? and u.is_active = 1`;

    const values = [org_id];
    const res = await mysqlDao.doQueryParams(query, values);
    if (_.isEmpty(res)) return [];
    const finalResult = res.map((row) => {
      try {
        const decryptedCTC = parseFloat(decrypt(row.ctc));
        const decryptedConveyance = parseFloat(decrypt(row.conveyance_allowance));
        const basic = Math.round(decryptedCTC * row.basic_formula);
        const hra = Math.round(decryptedCTC * row.hra_formula);
        const special_allowance = Math.round(decryptedCTC - (basic + hra + decryptedConveyance));
        const ctc_per_month = Math.round(decryptedCTC / 12);
        const basic_month = Math.round(ctc_per_month * row.basic_formula);
        const hra_month = Math.round(ctc_per_month * row.hra_formula);
        const conveyance_allowance_month = Math.round(decryptedConveyance / 12);
        const special_allowance_month = Math.round(
          ctc_per_month - (basic_month + hra_month + conveyance_allowance_month)
        );
        return {
          ...row,
          ctc: decryptedCTC,
          conveyance_allowance: decryptedConveyance,
          basic,
          hra,
          special_allowance,
          ctc_per_month,
          basic_month,
          hra_month,
          conveyance_allowance_month,
          special_allowance_month,
        };
      } catch (err) {
        console.error(`Failed to decrypt payroll data for user_id ${row.user_id}:`, err.message);
        return {
          ...row,
          ctc: null,
          conveyance_allowance: null,
          error: "Decryption failed",
        };
      }
    });
    return finalResult;
  };

//encrypted salary storingupdatePayrollDetails
  this.updatePayrollDetails = async function (obj) {
    const query = `UPDATE sam_assigned_payroll_details
    SET ctc = ?, conveyance_allowance = ?
    WHERE user_id = ?;`;
    // Encrypt the salary fields before storing
    const encryptedCTC = encrypt(obj.ctc);
    const encryptedConveyance = encrypt(obj.conveyance_allowance);
    let values = [encryptedCTC, encryptedConveyance, obj.user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.fetchOldPayrollDetails = async function (obj) {
  const query = `
    SELECT ctc, conveyance_allowance 
    FROM sam_assigned_payroll_details
    WHERE user_id = ?;
  `;
  const values = [obj.user_id];
  const res = await mysqlDao.doQueryParams(query, values);
  if (_.isEmpty(res)) return [];
  let row = res[0];
  try {
    row.ctc = row.ctc && row.ctc.includes(':') ? decrypt(row.ctc) : row.ctc;
  } catch (err) {
    console.error("CTC decryption failed:", err.message);
    row.ctc = null;
  }
  try {
    row.conveyance_allowance = row.conveyance_allowance && row.conveyance_allowance.includes(':') 
      ? decrypt(row.conveyance_allowance) 
      : row.conveyance_allowance;
  } catch (err) {
    console.error("Conveyance decryption failed:", err.message);
    row.conveyance_allowance = null;
  }
  return [row];
};

  // ADOC/VARIABLE START
  // decrypted the amount new code
  this.getAdocAndVariableDetails = async function (org_id) {
    const query = `
    SELECT 
      a.*, 
      CONCAT(u.first_name, " ", u.last_name) AS name, 
      u.employee_id 
    FROM 
      sam_adoc_variable AS a
    INNER JOIN 
      sam_users AS u ON u.id = a.user_id
    WHERE 
      u.org_id = ?;
  `;
    const values = [org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    if (_.isEmpty(res)) return [];
    // Decrypt amount for each row
    const decryptedRes = res.map(row => {
      try {
        row.amount = decrypt(row.amount);
      } catch (err) {
        console.error(`Decryption failed for user_id ${row.user_id}:`, err);
        row.amount = null;
      }
      return row;
    });
    return decryptedRes;
  };

  this.getAdocAndVariableDetailsById = async function (org_id, obj) {
    const query = `SELECT a.* FROM sam_adoc_variable as a
    inner join sam_users as u on u.id = a.user_id
    WHERE u.org_id = ? and a.id = ?;`;
    let values = [org_id, obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getOldAdocAndVariableDataForLogs = async function (obj) {
    const query = `SELECT  amount, type, description FROM sam_adoc_variable WHERE id = ?`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  //encrypted adocVariableInsertCode
  this.createAdocAndVariable = async function (obj) {
    const query = `INSERT INTO sam_adoc_variable
    (user_id, amount, type, description)
    VALUES (?, ?, ?, ?);`;

    const encryptedAmount = encrypt(obj.amount.toString());

    const values = [obj.user_id, encryptedAmount, obj.type, obj.description];
    const res = await mysqlDao.doQueryParams(query, values);

    return _.isEmpty(res) ? {} : res;
  };

  //newencryptAdoc/Variblecode
  this.updateAdocAndVariable = async function (obj) {
    const query = `
    UPDATE sam_adoc_variable
    SET
      amount = ?,
      type = ?,
      description = ?
    WHERE id = ?;
  `;
    const encryptedAmount = encrypt(obj.amount);
    const values = [encryptedAmount, obj.type, obj.description, obj.id];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getAdocAndVariableDetailsForLogs = async function (obj) {
    const query = `SELECT * FROM sam_adoc_variable WHERE id = ?`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deleteAdocAndVariable = async function (obj) {
    const query = `DELETE FROM sam_adoc_variable
    WHERE id = ?`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // ADOC/VARIABLE END

  // SALARY ON HOLD START

  this.holdUserSalary = async function (obj) {
    const query = `INSERT INTO sam_salary_on_hold
    (user_id)
    VALUES
    (?);
    `;
    let values = [obj.user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getHeldSalaryDetailsForLogs = async function (obj) {
    const query = `SELECT * FROM sam_salary_on_hold WHERE id = ?`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.releaseUserSalary = async function (obj) {
    const query = `DELETE FROM sam_salary_on_hold
    WHERE id = ?
    `;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getOnHoldSalaryUsers = async function (obj) {
    const query = `SELECT sh.*,CONCAT(u.first_name, " ", u.last_name) as name, u.employee_id FROM sam_salary_on_hold as sh 
    inner join sam_users as u on u.id = sh.user_id
    WHERE u.org_id = ?;`;
    let values = [obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getReleasedSalaryUsers = async function (obj) {
    const query = `SELECT id,CONCAT(first_name, " ", last_name) as name from sam_users where id not in (select user_id from sam_salary_on_hold) and org_id = ?`;
    let values = [obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // SALARY ON HOLD START

  // RUN PAYROLL START
  //decryption
  function safeDecrypt(value) {
    if (!value || value === "0") return "0";
    try {
      return decrypt(value);
    } catch (err) {
      return "0";
    }
  }

  this.getRunPayrollByOrgId = async function (obj, data) {
    const query = `
    SELECT 
      CONCAT(u.first_name, " ", u.last_name) AS name,
      u.id AS user_id,
      u.employee_id,
      sd.designations AS designation,
      ap.ctc,
      ap.conveyance_allowance,
      ps.basic_formula,
      ps.hra_formula,
      av.type,
      av.amount,
      COALESCE(leaves.total_leaves_for_current_month, 0) AS lop,
      leaves.rule_id AS leave_rule_id
    FROM 
        sam_users AS u
    LEFT JOIN samlite_designations AS sd ON u.designation_Id = sd.id
    LEFT JOIN sam_assigned_payroll_details AS ap ON u.id = ap.user_id
    LEFT JOIN sam_payroll_structure AS ps ON ap.payroll_structure_id = ps.id
    LEFT JOIN (
        SELECT 
            sp.user_id,
            sp.rule_id,
            SUM(sp.total_leaves) AS total_leaves_for_current_month
        FROM 
         sam_leave_rules AS lr
        INNER JOIN sam_leave_applications as sp on sp.rule_id = lr.id
        WHERE 
            month(sp.start_date) = ? and
            year(sp.start_date) = ? and
            lr.leave_rule_type_id = 3 and 
            sp.status != 'Rejected' and 
            sp.status != 'Deleted'
        GROUP BY 
            sp.user_id, sp.rule_id, sp.status
    ) AS leaves ON u.id = leaves.user_id
    LEFT JOIN (
      SELECT 
          user_id,
          type,
          amount
      FROM 
          sam_adoc_variable
    ) AS av ON u.id = av.user_id
    WHERE 
      u.org_id = ? and u.is_active = 1`;

    let values = [data.month, data.year, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    if (_.isEmpty(res)) return {};
    const grouped = {};
    res.forEach(row => {
      if (!grouped[row.user_id]) {
        grouped[row.user_id] = {
          ...row,
          variable_sum: 0,
          adoc_sum: 0
        };
      }
      if (row.amount && row.type) {
        const decryptedAmount = parseFloat(safeDecrypt(row.amount));
        if (row.type === 'variable') {
          grouped[row.user_id].variable_sum += decryptedAmount;
        } else if (row.type === 'adoc') {
          grouped[row.user_id].adoc_sum += decryptedAmount;
        }
      }
    });
    const finalData = Object.values(grouped).map(row => {
      const ctc = parseFloat(safeDecrypt(row.ctc));
      const conveyance = parseFloat(safeDecrypt(row.conveyance_allowance));
      const adocVariableAmount = +(row.variable_sum - row.adoc_sum).toFixed(2);
      const ctcPerMonth = +(ctc / 12).toFixed(2);
      const basicMonth = +(ctcPerMonth * row.basic_formula).toFixed(2);
      const hraMonth = +(ctcPerMonth * row.hra_formula).toFixed(2);
      const conveyanceMonth = +(conveyance / 12).toFixed(2);
      const specialAllowance = +(ctcPerMonth - (basicMonth + hraMonth + conveyanceMonth)).toFixed(2);
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const daySalary = +(ctcPerMonth / daysInMonth).toFixed(2);
      const netPay = +((ctcPerMonth - (row.lop * daySalary)) + adocVariableAmount).toFixed(2);

      return {
        ...row,
        ctc,
        conveyance_allowance: conveyance,
        adoc_variable_amount: adocVariableAmount,
        ctc_per_month: ctcPerMonth,
        basic_month: basicMonth,
        hra_month: hraMonth,
        conveyance_allowance_month: conveyanceMonth,
        special_allowance_month: specialAllowance,
        day_salary: daySalary,
        net_pay: netPay
      };
    });
    return finalData;
  };


  // encryptnewcode forcreatespayoutforcurrentmonth
  const dayjs = require('dayjs');
  this.createPayoutForCurrentMonth = async function (obj, data) {
    const query = `
    SELECT 
      CONCAT(u.first_name, " ", u.last_name) AS name,
      u.id AS user_id,
      u.employee_id,
      sd.designations AS designation,
      ap.ctc AS encrypted_ctc,
      ap.conveyance_allowance AS encrypted_conveyance_allowance,
      ps.basic_formula,
      ps.hra_formula,
      COALESCE(leaves.total_leaves_for_current_month, 0) AS lop,
      leaves.rule_id AS leave_rule_id,
      (CASE WHEN sh.user_id = u.id THEN 'SALARY ON HOLD' ELSE 'PENDING' END) as status,
      av.adoc_variable_types,
      av.adoc_variable_encrypted_amounts
    FROM sam_users AS u
    LEFT JOIN samlite_designations AS sd ON u.designation_Id = sd.id
    LEFT JOIN sam_assigned_payroll_details AS ap ON u.id = ap.user_id
    LEFT JOIN sam_payroll_structure AS ps ON ap.payroll_structure_id = ps.id
    LEFT JOIN (
     SELECT 
            sp.user_id,
            sp.rule_id,
            SUM(sp.total_leaves) AS total_leaves_for_current_month
        FROM 
         sam_leave_rules AS lr
        INNER JOIN sam_leave_applications as sp on sp.rule_id = lr.id
        WHERE 
            month(sp.start_date) = ? and
            year(sp.start_date) = ? and
            lr.leave_rule_type_id = 3 and 
            sp.status != 'Rejected' and 
            sp.status != 'Deleted'
        GROUP BY 
            sp.user_id, sp.rule_id, sp.status
    ) AS leaves ON u.id = leaves.user_id
    LEFT JOIN (
      SELECT 
        user_id,
        GROUP_CONCAT(type) AS adoc_variable_types,
        GROUP_CONCAT(amount) AS adoc_variable_encrypted_amounts
      FROM sam_adoc_variable
      GROUP BY user_id
    ) AS av ON u.id = av.user_id
    LEFT JOIN sam_salary_on_hold AS sh ON sh.user_id = u.id
    WHERE u.org_id = ? AND u.id IN (?);
  `;
    const values = [data.month, data.year, obj.org_id, data.users];
    const res = await mysqlDao.doQueryParams(query, values);
    if (_.isEmpty(res)) {
      return [];
    }
    // Delete any existing payouts for this month
    await this.deleteCurrentMonthPayout(obj, data);
    const insertQuery = `
    INSERT INTO sam_monthly_payout_details 
      (name, user_id, employee_id, designation, ctc, ctc_per_month, basic_month, hra_month, 
       conveyance_allowance_month, special_allowance_month, day_salary, adoc_variable_amount, 
       lop, net_pay, leave_rule_id, month, year, status) 
    VALUES ?
  `;
    const currentMonthDays = dayjs().daysInMonth();
    const payoutValues = res.map(row => {
      // Decrypt CTC and conveyance
      const ctc = parseFloat(decrypt(row.encrypted_ctc || "0"));
      const conveyance = parseFloat(decrypt(row.encrypted_conveyance_allowance || "0"));
      const ctc_per_month = +(ctc / 12).toFixed(2);
      const basic_month = +(ctc_per_month * row.basic_formula).toFixed(2);
      const hra_month = +(ctc_per_month * row.hra_formula).toFixed(2);
      const conveyance_month = +(conveyance / 12).toFixed(2);
      const special_allowance_month = +(ctc_per_month - (basic_month + hra_month + conveyance_month)).toFixed(2);
      const day_salary = +(ctc_per_month / currentMonthDays).toFixed(2);
      // Handle adoc/variable decryption and adjustment
      let adocVariableAmount = 0;
      if (row.adoc_variable_encrypted_amounts) {
        const amounts = row.adoc_variable_encrypted_amounts.split(',');
        const types = row.adoc_variable_types.split(',');
        for (let i = 0; i < amounts.length; i++) {
          const decrypted = parseFloat(decrypt(amounts[i] || "0"));
          if (types[i] === 'variable') {
            adocVariableAmount += decrypted;
          } else if (types[i] === 'adoc') {
            adocVariableAmount -= decrypted;
          }
        }
      }
      const lop = +(row.lop || 0);
      const net_pay = +((ctc_per_month - (lop * day_salary)) + adocVariableAmount).toFixed(2);
      return [
        row.name,
        row.user_id,
        row.employee_id,
        row.designation,
        encrypt(ctc.toString()),
        encrypt(ctc_per_month.toString()),
        encrypt(basic_month.toString()),
        encrypt(hra_month.toString()),
        encrypt(conveyance_month.toString()),
        encrypt(special_allowance_month.toString()),
        encrypt(day_salary.toString()),
        encrypt(adocVariableAmount.toString()),
        row.lop,
        encrypt(net_pay.toString()),
        row.leave_rule_id,
        data.monthName,
        data.year,
        row.status,
      ];
    });
    const result = await mysqlDao.doQueryParams(insertQuery, [payoutValues]);
    return result;
  };

  this.deleteCurrentMonthPayout = async (obj, data) => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString("en-US", { month: "long" });
    const year = currentDate.getFullYear();
    const query = `DELETE FROM sam_monthly_payout_details WHERE month = ? and year = ?
    and user_id IN (SELECT id FROM sam_users WHERE org_id = ? and id in (?))`;
    const values = [data.monthName, data.year, obj.org_id, data.users];
    await mysqlDao.doQueryParams(query, values);
  };
  // RUN PAYROLL END

  // BANK DETAILS START
  this.getBankDetailsByUserId = async (obj) => {
    const query = `SELECT bc.* FROM sam_lite.sam_bank_credentials as bc
    inner join sam_users as u on u.id = bc.user_id
    WHERE u.id = ?;`;
    let values = [obj.user_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.AddBankDetails = async (obj) => {
    const query = `INSERT INTO sam_bank_credentials
    (account_holder_name,
    bank_name,
    account_number,
    branch_name,
    ifsc_code,
    city,
    user_id)
    VALUES
    (?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?);`;
    let values = [
      obj.account_holder_name,
      obj.bank_name,
      obj.account_number,
      obj.branch_name,
      obj.ifsc_code,
      obj.city,
      obj.user_id,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.UpdateBankDetails = async (obj) => {
    const query = `UPDATE sam_bank_credentials
    SET
    account_holder_name = ?,
    bank_name = ?,
    account_number = ?,
    ifsc_code = ?,
    branch_name=?,
    city = ?
    WHERE user_id = ?;`;
    let values = [
      obj.account_holder_name,
      obj.bank_name,
      obj.account_number,
      obj.ifsc_code,
      obj.branch_name,
      obj.city,
      obj.user_id,
      obj.id,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

   this.getExistingBankDetails = async function (user) {
    const query = `
    SELECT * from sam_bank_credentials
    WHERE user_id = ?
  `;
    const [data] = await mysqlDao.doQueryParams(query, [
      user.user_id
    ]);
    return data;
  };
  // BANK DETAILS END

  // PAYOUT START
  //decrypt the values newdecryptcode
  this.getPayoutDetails = async (obj) => {
    const query = `
    SELECT mpd.* 
    FROM sam_monthly_payout_details AS mpd
    INNER JOIN sam_users AS u ON u.id = mpd.user_id
    WHERE u.org_id = ? AND month = ? AND year = ?;
  `;
    const values = [obj.org_id, obj.month, obj.year];
    const res = await mysqlDao.doQueryParams(query, values);
    if (_.isEmpty(res)) return [];
    const decryptedRes = res.map((row) => {
      try {
        return {
          ...row,
          ctc: parseFloat(decrypt(row.ctc || '0')),
          ctc_per_month: parseFloat(decrypt(row.ctc_per_month || '0')),
          basic_month: parseFloat(decrypt(row.basic_month || '0')),
          hra_month: parseFloat(decrypt(row.hra_month || '0')),
          conveyance_allowance_month: parseFloat(decrypt(row.conveyance_allowance_month || '0')),
          special_allowance_month: parseFloat(decrypt(row.special_allowance_month || '0')),
          day_salary: parseFloat(decrypt(row.day_salary || '0')),
          adoc_variable_amount: parseFloat(decrypt(row.adoc_variable_amount || '0')),
          net_pay: parseFloat(decrypt(row.net_pay || '0')),
        };
      } catch (err) {
        console.error(`Decryption failed for user_id ${row.user_id}:`, err.message);
        return {
          ...row,
          ctc: null,
          ctc_per_month: null,
          basic_month: null,
          hra_month: null,
          conveyance_allowance_month: null,
          special_allowance_month: null,
          day_salary: null,
          adoc_variable_amount: null,
          net_pay: null,
          decryption_error: true,
        };
      }
    });
    return decryptedRes;
  };

  this.updatePayoutDetails = async (obj) => {
    const query = `UPDATE sam_monthly_payout_details
	SET
	status = ?
	WHERE id = ?;`;
    let values = [obj.status, obj.row_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.generatePayslip = async (obj) => {
    const query = `UPDATE sam_monthly_payout_details 
    set is_payslip = 1
    where month = ? and year = ? and user_id in (?);`;
    let values = [obj.month, obj.year, obj.users];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // PAYOUT END


 this.fetchUsersForPayslip = async (obj) => {
    console.log(obj, "-------obj in fetchUsersForPayslip-------");
    const query = `
   SELECT 
  smpd.name, 
  smpd.user_id, 
  sd.designations AS designation_name,
  sdep.department_name
FROM 
  sam_monthly_payout_details smpd
INNER JOIN 
  sam_users su ON smpd.user_id = su.id
INNER JOIN 
  samlite_designations sd ON su.designation_Id = sd.id
INNER JOIN 
  samlite_departments sdep ON su.department_Id = sdep.id
WHERE 
  smpd.month = ? AND 
  smpd.year = ? AND 
  su.org_id = ? AND 
  smpd.is_payslip = 1
  `;

    let values = [obj.month, obj.year, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    console.log(res, "-------res in fetchUsersForPayslip-------");
    return _.isEmpty(res) ? {} : res;
  };


  //newcodefor payslipdetails
  this.getPayslipDetails = async (obj) => {
    const query = `
    SELECT 
      a.hra_month, 
      a.basic_month, 
      a.conveyance_allowance_month,
      a.special_allowance_month,
      a.ctc_per_month, 
      a.net_pay, 
      a.month, 
      a.year, 
      us.username AS employee_name, 
      us.employee_id, 
      b.work_location, 
      c.department_name, 
      sd.designations, 
      e.bank_name, 
      e.account_number, 
      f.company_name,
      f.corporate_office,
      f.registered_office,
      f.logo_url,
      us.email,
      MAX(CASE WHEN g.file_type = 'Pan Card' THEN g.document_Id END) AS pan_no,
      a.user_id,
      a.lop
    FROM 
      sam_monthly_payout_details AS a
    LEFT JOIN sam_users AS us ON a.user_id = us.id
    LEFT JOIN sam_personal_details AS b ON a.user_id = b.user_id
    LEFT JOIN samlite_departments AS c ON us.department_Id = c.id
    LEFT JOIN samlite_designations AS sd ON us.designation_Id = sd.id
    LEFT JOIN sam_bank_credentials AS e ON b.user_id = e.user_id
    LEFT JOIN samlite_company_details AS f ON b.org_id = f.org_id
    LEFT JOIN samlite_documents AS g ON b.user_id = g.user_id
    WHERE 
      a.month = ? AND a.year = ? AND us.id IN (?) AND a.is_payslip = 1
    GROUP BY 
      a.hra_month, a.basic_month, a.conveyance_allowance_month, 
      a.ctc_per_month, a.special_allowance_month, a.net_pay, a.month, a.year, us.username, 
      us.employee_id, b.work_location, c.department_name, 
      sd.designations, e.bank_name, e.account_number, 
      f.company_name, f.corporate_office, f.registered_office, 
      f.logo_url, us.email, a.user_id, a.lop
  `;

    const values = [obj.month, obj.year, obj.users];
    const res = await mysqlDao.doQueryParams(query, values);

    if (_.isEmpty(res)) return {};
    // Get adoc/variable encrypted amounts separately
    const adocVarQuery = `
    SELECT user_id, type, amount 
    FROM sam_adoc_variable 
    WHERE user_id IN (?)
  `;
    const adocVarRes = await mysqlDao.doQueryParams(adocVarQuery, [obj.users]);
    // Group adoc/variable amounts
    const adocVarMap = {};
    adocVarRes.forEach(row => {
      const decryptedAmount = parseFloat(decrypt(row.amount));
      if (!adocVarMap[row.user_id]) {
        adocVarMap[row.user_id] = { variable: 0, adoc: 0 };
      }
      if (row.type === 'variable') {
        adocVarMap[row.user_id].variable += decryptedAmount;
      } else if (row.type === 'adoc') {
        adocVarMap[row.user_id].adoc += decryptedAmount;
      }
    });

    const decryptedRes = res.map(row => {
      const safeDecrypt = val => {
        if (!val || val === "0") return "0";
        try {
          return decrypt(val);
        } catch {
          return "0";
        }
      };

      const adocVar = adocVarMap[row.user_id] || { variable: 0, adoc: 0 };
      return {
        hra_month: safeDecrypt(row.hra_month),
        basic_month: safeDecrypt(row.basic_month),
        conveyance_allowance_month: safeDecrypt(row.conveyance_allowance_month),
        ctc_per_month: safeDecrypt(row.ctc_per_month),
        special_allowance_month: safeDecrypt(row.special_allowance_month),
        net_pay: safeDecrypt(row.net_pay),
        month: row.month,
        year: row.year,
        employee_name: row.employee_name,
        employee_id: row.employee_id,
        work_location: row.work_location,
        department_name: row.department_name,
        designations: row.designations,
        bank_name: row.bank_name,
        account_number: row.account_number,
        company_name: row.company_name,
        corporate_office: row.corporate_office,
        registered_office: row.registered_office,
        logo_url: row.logo_url,
        email: row.email,
        pan_no: row.pan_no,
        adoc_deduction: adocVar.adoc,
        variable: adocVar.variable,
        lop: row.lop
      };
    });
    return decryptedRes;
  };

  //newdecryptedcodeget-salary-structure-details
  this.getSalaryStructureDetails = async function (data) {
    const query = `
    SELECT 
      ap.ctc,
      ap.effective_from,
      ap.conveyance_allowance,
      p.basic_formula,
      p.hra_formula,
      p.overtime
    FROM sam_personal_details as u
    LEFT JOIN sam_users as us on u.user_id = us.id
    LEFT JOIN sam_assigned_payroll_details as ap on u.user_id = ap.user_id
    LEFT JOIN sam_payroll_structure as p on p.id = ap.payroll_structure_id
    LEFT JOIN samlite_designations as d on us.designation_Id = d.id
    WHERE u.org_id = ? AND u.user_id = ?;
  `;

    const values = [data.org_id, data.user_id];
    const res = await mysqlDao.doQueryParams(query, values);
    if (_.isEmpty(res)) return [];
    const row = res[0];
    let ctc = 0;
    let conveyance = 0;
    try {
      ctc = row.ctc && row.ctc.includes(':') ? parseFloat(decrypt(row.ctc)) : parseFloat(row.ctc);
    } catch (err) {
      console.error('CTC decryption failed:', err.message);
    }

    try {
      conveyance = row.conveyance_allowance && row.conveyance_allowance.includes(':')
        ? parseFloat(decrypt(row.conveyance_allowance))
        : parseFloat(row.conveyance_allowance);
    } catch (err) {
      console.error('Conveyance decryption failed:', err.message);
    }
    const ctcPerMonth = +(ctc / 12).toFixed(2);
    const basic = +(ctc * row.basic_formula).toFixed(2);
    const hra = +(ctc * row.hra_formula).toFixed(2);
    const specialAllowance = +(ctc - (basic + hra + conveyance)).toFixed(2);
    const basicMonth = +(ctcPerMonth * row.basic_formula).toFixed(2);
    const hraMonth = +(ctcPerMonth * row.hra_formula).toFixed(2);
    const conveyanceMonth = +(conveyance / 12).toFixed(2);
    const specialAllowanceMonth = +(ctcPerMonth - (basicMonth + hraMonth + conveyanceMonth)).toFixed(2);
    return {
      ctc,
      effective_from: row.effective_from,
      basic,
      hra,
      special_allowance: specialAllowance,
      conveyance_allowance: conveyance,
      ctc_per_month: ctcPerMonth,
      basic_month: basicMonth,
      hra_month: hraMonth,
      conveyance_allowance_month: conveyanceMonth,
      special_allowance_month: specialAllowanceMonth,
      overtime: row.overtime,
    };
  };

  // newdecryptedpayrolloverviewcode
  this.getPayrollOverview = async (obj) => {
    const query = `
    SELECT 
      a.id AS user_id,
      b.status,
      b.is_payslip,
      b.basic_month,
      b.hra_month,
      b.special_allowance_month,
      b.conveyance_allowance_month,
      b.net_pay
    FROM sam_users AS a
    LEFT JOIN sam_monthly_payout_details AS b 
      ON a.id = b.user_id  
    WHERE b.month = ? AND b.year = ? AND a.org_id = ?
  `;

    const values = [obj.month, obj.year, obj.org_id];
    const res = await mysqlDao.doQueryParams(query, values);
    if (_.isEmpty(res)) {
      return {};
    }

    let totalEmployees = 0;
    let payrollCompleted = 0;
    let grossPay = 0;
    let netPay = 0;
    let payslip = 0;

    const safeDecrypt = (val) => {
      if (!val || val === "0") return "0";
      try {
        return decrypt(val);
      } catch {
        return "0";
      }
    };

    res.forEach(row => {
      totalEmployees += 1;

      if (row.status === "PAID") {
        payrollCompleted += 1;
      }

      const basic = parseFloat(safeDecrypt(row.basic_month));
      const hra = parseFloat(safeDecrypt(row.hra_month));
      const special = parseFloat(safeDecrypt(row.special_allowance_month));
      const conveyance = parseFloat(safeDecrypt(row.conveyance_allowance_month));
      const net = parseFloat(safeDecrypt(row.net_pay));

      grossPay += basic + hra + special + conveyance;
      netPay += net;
      if (row.is_payslip === 1) {
        payslip += 1;
      }
    });
    return [
      {
        total_employees: totalEmployees,
        payroll_completed: payrollCompleted,
        gross_pay: grossPay,
        net_pay: netPay,
        payslip: payslip
      }
    ];
  };

  this.storeAssignedStructureLogs = async (
    modulename,
    obj,
    user_id,
    actionType
  ) => {
    const query = `INSERT INTO sam_payroll_logs (id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.storeUpdatedAssignStructureLogs = async (modulename, obj, user_id, actionType) => {
    const safeObj = JSON.parse(JSON.stringify(obj));
    // Encrypt top-level fields
    if (safeObj.ctc) {
      safeObj.ctc = encrypt(safeObj.ctc.toString());
    }
    if (safeObj.conveyance_allowance) {
      safeObj.conveyance_allowance = encrypt(safeObj.conveyance_allowance.toString());
    }
    // Encrypt oldData array if it exists
    if (Array.isArray(safeObj.oldData)) {
      safeObj.oldData = safeObj.oldData.map((item) => {
        const encryptedItem = { ...item };
        if (item.ctc) {
          encryptedItem.ctc = encrypt(item.ctc.toString());
        }
        if (item.conveyance_allowance) {
          encryptedItem.conveyance_allowance = encrypt(item.conveyance_allowance.toString());
        }
        return encryptedItem;
      });
    }
    const query = `
    INSERT INTO sam_payroll_logs 
    (id, module_name, created_by, created_at, action, logs) 
    VALUES (?,?,?,?,?,?)`;
    const values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(safeObj),
    ];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.postStructureLogs = async (modulename, obj, user_id, actionType) => {
    const query = `INSERT INTO sam_payroll_logs (id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateStructureLogs = async (modulename, obj, user_id, actionType) => {
    const query = `INSERT INTO sam_payroll_logs (id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

   this.postAdocVariableLogs = async (modulename, obj, user_id, actionType) => {
    const safeObj = JSON.parse(JSON.stringify(obj));
    delete safeObj.oldData;
    if (safeObj.ctc) {
      safeObj.ctc = encrypt(safeObj.ctc.toString());
    }
    if (safeObj.conveyance_allowance) {
      safeObj.conveyance_allowance = encrypt(safeObj.conveyance_allowance.toString());
    }
    if (safeObj.amount) {
      safeObj.amount = encrypt(safeObj.amount.toString());
    }
    const query = `INSERT INTO sam_payroll_logs 
    (id, module_name, created_by, created_at, action, logs) 
    VALUES (?,?,?,?,?,?)`;

    const values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(safeObj),
    ];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateAdocVariableLogs = async (
    modulename,
    obj,
    user_id,
    actionType
  ) => {
    const safeObj = JSON.parse(JSON.stringify(obj));
    if (safeObj.amount && !safeObj.amount.includes(':')) {
      safeObj.amount = encrypt(safeObj.amount.toString());
    }
    const query = `
    INSERT INTO sam_payroll_logs 
    (id, module_name, created_by, created_at, action, logs) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    const values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(safeObj),
    ];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.postHoldUserSalaryLogs = async (
    modulename,
    obj,
    user_id,
    actionType
  ) => {
    const query = `INSERT INTO sam_payroll_logs (id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deleteHeldSalaryLogs = async (modulename, obj, user_id, actionType) => {
    const query = `INSERT INTO sam_payroll_logs ( id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.storeRemovedAssignPayrollStructureLogs = async (
    modulename,
    obj,
    user_id,
    actionType
  ) => {
    const query = `INSERT INTO sam_payroll_logs (id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deletePayrollStructureLogs = async (
    modulename,
    obj,
    user_id,
    actionType
  ) => {
    const query = `INSERT INTO sam_payroll_logs(id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.postDeletedADOCVariableLogs = async (
    modulename,
    obj,
    user_id,
    actionType
  ) => {
    const query = `INSERT INTO sam_payroll_logs(id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  //newdecryptpayrolldetailslogs
  this.getPayrollDetailsForLogs = async (obj, org_id) => {
    const query = `
    SELECT a.*, b.username  
    FROM sam_payroll_logs AS a
    INNER JOIN sam_users AS b ON a.created_by = b.id
    WHERE created_at >= ? AND created_at <= ? and b.org_id = ?;
  `;

    const values = [obj.startDate, obj.endDate, org_id];
    const res = await mysqlDao.doQueryParams(query, values);
    if (_.isEmpty(res)) return [];

    const result = res.map((row) => {
      try {
        const parsedLog = JSON.parse(row.logs);

        // Decrypt top-level fields
        if (typeof parsedLog.ctc === 'string' && parsedLog.ctc.includes(':')) {
          parsedLog.ctc = decrypt(parsedLog.ctc);
        }

        if (typeof parsedLog.conveyance_allowance === 'string' && parsedLog.conveyance_allowance.includes(':')) {
          parsedLog.conveyance_allowance = decrypt(parsedLog.conveyance_allowance);
        }

        if (typeof parsedLog.amount === 'string' && parsedLog.amount.includes(':')) {
          parsedLog.amount = decrypt(parsedLog.amount);
        }

        // ✅ Decrypt fields inside oldData array
        if (Array.isArray(parsedLog.oldData)) {
          parsedLog.oldData = parsedLog.oldData.map((entry) => {
            const updated = { ...entry };

            if (typeof updated.ctc === 'string' && updated.ctc.includes(':')) {
              try {
                updated.ctc = decrypt(updated.ctc);
              } catch {
                updated.ctc = '** decryption failed **';
              }
            }

            if (typeof updated.conveyance_allowance === 'string' && updated.conveyance_allowance.includes(':')) {
              try {
                updated.conveyance_allowance = decrypt(updated.conveyance_allowance);
              } catch {
                updated.conveyance_allowance = '** decryption failed **';
              }
            }

            // ✅ Decrypt amount if present
            if (typeof updated.amount === 'string' && updated.amount.includes(':')) {
              try {
                updated.amount = decrypt(updated.amount);
              } catch {
                updated.amount = '** decryption failed **';
              }
            }

            return updated;
          });
        }

        // Keep logs as stringified JSON (to match expected structure)
        return {
          ...row,
          logs: JSON.stringify(parsedLog),
        };

      } catch (err) {
        console.error(`Error parsing/decrypting log ID ${row.id}:`, err.message);
        return {
          ...row,
          logs: JSON.stringify({ error: 'Failed to parse or decrypt log data' }),
        };
      }
    });

    return result;
  };

  this.fetchUserDetailsForPayrollLogs = async (obj) => {
    const query = `SELECT id,username,email FROM sam_users WHERE id = ?`;
    values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.fetchMultipleUserDetailsForPayrollLogs = async (obj) => {
    // Assuming obj.id is an array of IDs
    const ids = obj.id;
    // Create placeholders for each ID
    const placeholders = ids.map(() => "?").join(",");


     const query = `SELECT id, username, email FROM sam_users WHERE id IN (${placeholders})`;
    const values = ids;
 
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };
 
 
  this.fetchMultipleUserDetailsForPayrollLogs2 = async (obj) => {
    // Assuming obj.id is an array of IDs
    const ids = obj.users;
    // Create placeholders for each ID
    const placeholders = ids.map(() => "?").join(",");
    const query = `SELECT id, username, email FROM sam_users WHERE id IN (${placeholders})`;
    const values = ids;

    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getAssignedUsersForLogs = async (obj) => {
    const values = obj;
    const query = `SELECT 
    apd.*,
    ps.*,
    su.username,
    su.email
FROM 
    sam_lite.sam_assigned_payroll_details AS apd
INNER JOIN 
    sam_payroll_structure AS ps 
    ON apd.payroll_structure_id = ps.id
INNER JOIN 
    sam_users AS su
    ON apd.user_id = su.id
WHERE 
    apd.user_id IN (${values.map(() => "?").join(",")})`;
    // Call the mysqlDao.doQuery instead of doQueryParams since no parameters are passed
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? [] : res;
  };

  this.mergeUserData = async (a, b) => {
    const old_records = [];
    const new_records = [];

    // Create a map for the first array for quick lookup
    const mapA = new Map(
      a.map((user) => [
        user.user_id,
        {
          name: user.name,
          username: user.username,
          email: user.email,
        },
      ])
    );

    // Iterate through the second array
    for (const userB of b) {
      const userId = userB.user_id;
      if (mapA.has(userId)) {
        // If user exists in the first array, add old_name with username and email
        const userAData = mapA.get(userId);
        old_records.push({
          user_id: userId,
          old_name: userAData.name,
          name: userB.name,
          username: userAData.username,
          email: userAData.email,
        });
        // Remove the user from the map to avoid duplicates
        mapA.delete(userId);
      } else {
        // If user does not exist in the first array, add all required fields including username and email
        new_records.push({
          user_id: userId,
          name: userB.name,
          username: userB.username,
          email: userB.email,
          ctc: userB.ctc,
          conveyance_allowance: userB.conveyance_allowance,
          effective_from: userB.effective_from,
          basic_formula: userB.basic_formula,
          description: userB.description,
          hra_formula: userB.hra_formula,
          conveyance_allowance_formula: userB.conveyance_allowance_formula,
          special_allowance_formula: userB.special_allowance_formula,
        });
      }
    }

    // Add remaining users from the first array that were not in the second array
    for (const [userId, userAData] of mapA) {
      old_records.push({
        user_id: userId,
        old_name: userAData.name,
        username: userAData.username,
        email: userAData.email,
      });
    }

    const result = {
      old_records,
      new_records,
    };

    return result;
  };

  this.storeCreatePayoutLogs = async (modulename, obj, user_id, actionType) => {
    const query = `INSERT INTO sam_payroll_logs (id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.storeUpdatePayoutLogs = async (modulename, obj, user_id, actionType) => {
    const query = `INSERT INTO sam_payroll_logs (id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getUserDetailsForPayout = async (obj) => {
    const query = `SELECT 
    smpd.name,
    smpd.status,
    su.email
FROM 
    sam_monthly_payout_details AS smpd
JOIN 
    sam_users AS su
ON 
    smpd.user_id = su.id
WHERE 
    smpd.id = ?;
`;
    let values = [obj.row_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };


   this.storeGeneratedPayslipLogs = async (modulename, obj, user_id, actionType) => {
     const query = `INSERT INTO sam_payroll_logs (id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
   }

    this.getFinalSettlementByOrgId = async function (obj, data) {
    const query = `
    with 
  salary_data AS (
      SELECT 
          su.id,
          su.org_id, 
          ap.CTC,
          sd.department_name,
          ssd.subdepartment,
         sdesg.designations,
          ROUND(ap.ctc * p.basic_formula) AS Basic,
          ROUND((ap.ctc / 12) * p.basic_formula) AS Month_Basic,
          ROUND((ap.ctc / 12) * p.hra_formula) AS Month_HRA,
          ROUND(ap.ctc / 12) AS Month_CTC,
          ROUND((ap.ctc / 12) / DAY(LAST_DAY(CURRENT_DATE())), 2) AS day_salary,
          ROUND(ap.conveyance_allowance / 12, 2) AS Conveyance_Allowance
      FROM sam_users AS su
      LEFT JOIN sam_assigned_payroll_details AS ap ON su.id = ap.user_id
      LEFT JOIN sam_payroll_structure AS p ON p.id = ap.payroll_structure_id
      LEFT JOIN samlite_departments AS sd ON su.department_Id = sd.id
      LEFT JOIN samliteorg_subdepartments AS ssd ON su.subdepartment_Id = ssd.id
      LEFT JOIN samlite_designations AS sdesg ON su.designation_Id = sdesg.id
      WHERE su.org_id = ?
  ),
  leave_data AS (
      SELECT 
          sr.user_id,
          sr.org_id,
          SUM(CASE WHEN slr.leave_rule_type_id = 1 THEN sal.carry_forward ELSE 0 END) AS carry_forward_leave,
          SUM(CASE WHEN slr.leave_rule_type_id = 2 THEN sal.applied_leaves ELSE 0 END) AS comp_off_applied,
          SUM(CASE WHEN slr.leave_rule_type_id = 2 THEN (sal.credited_leaves - sal.applied_leaves) ELSE 0 END) AS comp_off_balance
      FROM sam_assigned_leave_details sal
      INNER JOIN samlite_resignations sr ON sal.user_id = sr.user_id
      INNER JOIN sam_leave_rules slr ON sr.org_id = slr.org_id AND slr.id = sal.rule_id
      WHERE slr.leave_rule_type_id IN (1, 2) AND sr.org_id = ?
      GROUP BY sr.user_id
  ),
  leave_application_data AS (
      SELECT 
          sla.user_id, 
          su.org_id, 
          SUM(CASE WHEN slr.leave_rule_type_id = 1 THEN sla.applied_leaves ELSE 0 END) AS total_EL_applied_month,
          SUM(sla.penalty_deduction) AS total_penalty_month,
          SUM(CASE 
                  WHEN slr.leave_rule_type_id = 3  
                  AND sla.start_date BETWEEN DATE_FORMAT(sr.Last_Working_Day, '%Y-%m-01') AND sr.Last_Working_Day  
                  AND sla.end_date BETWEEN DATE_FORMAT(sr.Last_Working_Day, '%Y-%m-01') AND sr.Last_Working_Day
              THEN sla.applied_leaves 
              ELSE 0 
              END) AS total_LOP_Days
      FROM sam_leave_applications AS sla
      INNER JOIN sam_users AS su ON sla.user_id = su.id  
      INNER JOIN samlite_resignations sr ON sr.user_id = su.id AND sr.org_id = su.org_id
      LEFT JOIN sam_leave_rules AS slr ON sla.rule_id = slr.id 
      WHERE su.org_id = ?
          AND YEAR(sla.start_date) = YEAR(CURRENT_DATE())
          AND YEAR(sla.end_date) = YEAR(CURRENT_DATE())
          AND sla.status IN ("Approved", "Pending")
          AND su.is_active = 1
      GROUP BY sla.user_id, su.org_id
  ),
  leave_calculation AS (
      SELECT 
          sr.user_id,
          sr.org_id,
          ROUND(COALESCE(ld.carry_forward_leave, 0) + ((MONTH(sr.Last_working_day) - 1) * 1.67) + ((DAY(sr.Last_working_day) / DAY(LAST_DAY(sr.Last_working_day))) * 1.67), 2) AS Total_Earned_Leave,
          (COALESCE(ld.comp_off_applied, 0) + COALESCE(lad.total_EL_applied_month, 0) + COALESCE(lad.total_penalty_month, 0)) AS Total_Leave_Taken
      FROM samlite_resignations sr
      LEFT JOIN leave_data AS ld ON sr.user_id = ld.user_id AND sr.org_id = ld.org_id
      LEFT JOIN leave_application_data lad ON sr.user_id = lad.user_id AND sr.org_id = lad.org_id
      WHERE sr.org_id = ?
  )
  SELECT 
      sr.user_id,
      sr.org_id,
      CONCAT(su.first_name, " ", su.last_name) AS Full_Name,
      su. employee_id AS Employee_ID, 
      pd.Date_Of_Joining,
      sd.department_name AS Department_Name, 
      sd.subdepartment AS SubDepartment_Name, 
      sd.designations AS Designation_Name,
      DATE(sr.resignation_timestamp) AS Resignation_Date, 
      sr.Last_working_day AS Last_Working_Day,
      lc.Total_Earned_Leave,
      lc.Total_Leave_Taken,
      COALESCE(ld.comp_off_applied, 0) AS Comp_off_Applied,
      COALESCE(ld.comp_off_balance, 0) AS Comp_Off_Balance,
      COALESCE(lad.total_LOP_Days, 0) AS LOP_Leaves,
      ROUND((COALESCE(lc.Total_Leave_Taken, 0) - COALESCE(lc.Total_Earned_Leave, 0)), 2) AS Excess_Leaves,   
      ROUND((COALESCE(lc.Total_Earned_Leave, 0) - COALESCE(lc.Total_Leave_Taken, 0)), 2) AS Remaining_Leave,
      ROUND(DAY(sr.Last_working_day) * sd.day_salary, 2) AS Monthly_Salary,
      sd.CTC,
      sd.Basic,
      sd.Month_Basic,
      sd.Month_HRA,
      sd.Month_CTC,
      sd.day_salary AS Day_Salary,
      ROUND(av.amount, 2) AS Adoc_Variable_Amount,
      COALESCE(sd.Conveyance_Allowance,0) AS Conveyance_Allowance,
      CASE
          WHEN (COALESCE(lc.Total_Earned_Leave, 0) - COALESCE(lc.Total_Leave_Taken, 0)) > 0 THEN
              ROUND((lc.Total_Earned_Leave - lc.Total_Leave_Taken) * sd.day_salary, 2)
          ELSE 
              0
      END AS EL_Encashment,
      ROUND(COALESCE(ld.comp_off_balance, 0) * sd.day_salary, 2) AS Comp_Off_Encashment,
      ROUND(COALESCE(lad.total_LOP_Days, 0) * sd.day_salary, 2) AS LOP_Deduction_amount,
      CASE 
          WHEN (COALESCE(lc.Total_Leave_Taken, 0) - COALESCE(lc.Total_Earned_Leave, 0)) > 0 THEN 
              ROUND((lc.Total_Leave_Taken - lc.Total_Earned_Leave) * sd.day_salary, 2)
          ELSE 
              0
      END AS Excess_Leave_Deduction_Amount,
      MONTHNAME(sr.Last_Working_Day) AS Month,
      YEAR(sr.Last_Working_Day) as Year
  FROM samlite_resignations sr
  LEFT JOIN sam_users su ON sr.user_id = su.id AND sr.org_id = su.org_id
  LEFT JOIN sam_personal_details AS pd ON pd.user_id = sr.user_id AND pd.org_id = sr.org_id
  LEFT JOIN salary_data sd ON sr.user_id = sd.id AND sr.org_id = sd.org_id
  LEFT JOIN leave_data ld ON sr.user_id = ld.user_id AND sr.org_id = ld.org_id
  LEFT JOIN leave_application_data lad ON sr.user_id = lad.user_id AND sr.org_id = lad.org_id
  LEFT JOIN leave_calculation lc ON sr.user_id = lc.user_id AND sr.org_id = lc.org_id
  LEFT JOIN (SELECT 
      user_id,
      'adoc/variable' as type,
      SUM(CASE WHEN type = 'variable' THEN amount ELSE 0 END) 
          - SUM(CASE WHEN type = 'adoc' THEN amount ELSE 0 END) AS amount
  FROM 
       sam_adoc_variable
  GROUP BY 
      user_id)
  AS av ON su.id = av.user_id
        
    WHERE sr.status = "offboarded" AND  YEAR(sr.Last_working_day) = YEAR(CURRENT_DATE()) and su.is_active =1
          AND sr.org_id = ?
        `;

    let values = Array(5).fill(obj.org_id);

    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.createFinalSettlementForCurrentMonth = async function (obj, data) {

    if (!data.users || (Array.isArray(data.users) && data.users.length === 0)) {
      throw new Error("No user(s) provided for final settlement");
  }
  
    // const userIds = Array.isArray(data.users) ? data.users : [data.users];
    const userIds = Array.isArray(data.users) ? data.users.map(Number) : [Number(data.users)];

    // console.log(userIds,"userIds")
    const userIdPlaceholders = userIds.map(() => '?').join(', ');
    // console.log(userIdPlaceholders,"---------userIdPlaceholders---------")
    const query = `
    with 
  salary_data AS (
      SELECT 
          su.id,
          su.org_id, 
          ap.CTC,
          sd.department_name,
          ssd.subdepartment,
         sdesg.designations,
          ROUND(ap.ctc * p.basic_formula) AS Basic,
          ROUND((ap.ctc / 12) * p.basic_formula) AS Month_Basic,
          ROUND((ap.ctc / 12) * p.hra_formula) AS Month_HRA,
          ROUND(ap.ctc / 12) AS Month_CTC,
          ROUND((ap.ctc / 12) / DAY(LAST_DAY(CURRENT_DATE())), 2) AS day_salary,
          ROUND(ap.conveyance_allowance / 12, 2) AS Conveyance_Allowance
      FROM sam_users AS su
      LEFT JOIN sam_assigned_payroll_details AS ap ON su.id = ap.user_id
      LEFT JOIN sam_payroll_structure AS p ON p.id = ap.payroll_structure_id
      LEFT JOIN samlite_departments AS sd ON su.department_Id = sd.id
      LEFT JOIN samliteorg_subdepartments AS ssd ON su.subdepartment_Id = ssd.id
      LEFT JOIN samlite_designations AS sdesg ON su.designation_Id = sdesg.id
      WHERE su.org_id = ?
  ),
  leave_data AS (
      SELECT 
          sr.user_id,
          sr.org_id,
          SUM(CASE WHEN slr.leave_rule_type_id = 1 THEN sal.carry_forward ELSE 0 END) AS carry_forward_leave,
          SUM(CASE WHEN slr.leave_rule_type_id = 2 THEN sal.applied_leaves ELSE 0 END) AS comp_off_applied,
          SUM(CASE WHEN slr.leave_rule_type_id = 2 THEN (sal.credited_leaves - sal.applied_leaves) ELSE 0 END) AS comp_off_balance
      FROM sam_assigned_leave_details sal
      INNER JOIN samlite_resignations sr ON sal.user_id = sr.user_id
      INNER JOIN sam_leave_rules slr ON sr.org_id = slr.org_id AND slr.id = sal.rule_id
      WHERE slr.leave_rule_type_id IN (1, 2) AND sr.org_id = ?
      GROUP BY sr.user_id
  ),
  leave_application_data AS (
      SELECT 
          sla.user_id, 
          su.org_id, 
          SUM(CASE WHEN slr.leave_rule_type_id = 1 THEN sla.applied_leaves ELSE 0 END) AS total_EL_applied_month,
          SUM(sla.penalty_deduction) AS total_penalty_month,
          SUM(CASE 
                  WHEN slr.leave_rule_type_id = 3  
                  AND sla.start_date BETWEEN DATE_FORMAT(sr.Last_Working_Day, '%Y-%m-01') AND sr.Last_Working_Day  
                  AND sla.end_date BETWEEN DATE_FORMAT(sr.Last_Working_Day, '%Y-%m-01') AND sr.Last_Working_Day
              THEN sla.applied_leaves 
              ELSE 0 
              END) AS total_LOP_Days
      FROM sam_leave_applications AS sla
      INNER JOIN sam_users AS su ON sla.user_id = su.id  
      INNER JOIN samlite_resignations sr ON sr.user_id = su.id AND sr.org_id = su.org_id
      LEFT JOIN sam_leave_rules AS slr ON sla.rule_id = slr.id 
      WHERE su.org_id = ?
          AND YEAR(sla.start_date) = YEAR(CURRENT_DATE())
          AND YEAR(sla.end_date) = YEAR(CURRENT_DATE())
          AND sla.status IN ("Approved", "Pending")
          AND su.is_active = 1
      GROUP BY sla.user_id, su.org_id
  ),
  leave_calculation AS (
      SELECT 
          sr.user_id,
          sr.org_id,
          ROUND(COALESCE(ld.carry_forward_leave, 0) + ((MONTH(sr.Last_working_day) - 1) * 1.67) + ((DAY(sr.Last_working_day) / DAY(LAST_DAY(sr.Last_working_day))) * 1.67), 2) AS Total_Earned_Leave,
          (COALESCE(ld.comp_off_applied, 0) + COALESCE(lad.total_EL_applied_month, 0) + COALESCE(lad.total_penalty_month, 0)) AS Total_Leave_Taken
      FROM samlite_resignations sr
      LEFT JOIN leave_data AS ld ON sr.user_id = ld.user_id AND sr.org_id = ld.org_id
      LEFT JOIN leave_application_data lad ON sr.user_id = lad.user_id AND sr.org_id = lad.org_id
      WHERE sr.org_id = ?
  )
  SELECT 
      sr.user_id,
      sr.org_id,
      CONCAT(su.first_name, " ", su.last_name) AS Full_Name,
      su. employee_id AS Employee_ID, 
      pd.Date_Of_Joining,
      sd.department_name AS Department_Name, 
      sd.subdepartment AS SubDepartment_Name, 
      sd.designations AS Designation_Name,
      DATE(sr.resignation_timestamp) AS Resignation_Date, 
      sr.Last_working_day AS Last_Working_Day,
      lc.Total_Earned_Leave,
      lc.Total_Leave_Taken,
      COALESCE(ld.comp_off_applied, 0) AS Comp_off_Applied,
      COALESCE(ld.comp_off_balance, 0) AS Comp_Off_Balance,
      COALESCE(lad.total_LOP_Days, 0) AS LOP_Leaves,
      ROUND((COALESCE(lc.Total_Leave_Taken, 0) - COALESCE(lc.Total_Earned_Leave, 0)), 2) AS Excess_Leaves,   
      ROUND((COALESCE(lc.Total_Earned_Leave, 0) - COALESCE(lc.Total_Leave_Taken, 0)), 2) AS Remaining_Leave,
      ROUND(DAY(sr.Last_working_day) * sd.day_salary, 2) AS Monthly_Salary,
      sd.CTC,
      sd.Basic,
      sd.Month_Basic,
      sd.Month_HRA,
      sd.Month_CTC,
      sd.day_salary AS Day_Salary,
      ROUND(av.amount, 2) AS Adoc_Variable_Amount,
      COALESCE(sd.Conveyance_Allowance,0) AS Conveyance_Allowance,
      CASE
          WHEN (COALESCE(lc.Total_Earned_Leave, 0) - COALESCE(lc.Total_Leave_Taken, 0)) > 0 THEN
              ROUND((lc.Total_Earned_Leave - lc.Total_Leave_Taken) * sd.day_salary, 2)
          ELSE 
              0
      END AS EL_Encashment,
      ROUND(COALESCE(ld.comp_off_balance, 0) * sd.day_salary, 2) AS Comp_Off_Encashment,
      ROUND(COALESCE(lad.total_LOP_Days, 0) * sd.day_salary, 2) AS LOP_Deduction_amount,
      CASE 
          WHEN (COALESCE(lc.Total_Leave_Taken, 0) - COALESCE(lc.Total_Earned_Leave, 0)) > 0 THEN 
              ROUND((lc.Total_Leave_Taken - lc.Total_Earned_Leave) * sd.day_salary, 2)
          ELSE 
              0
      END AS Excess_Leave_Deduction_Amount,
      MONTHNAME(sr.Last_Working_Day) AS Month,
      YEAR(sr.Last_Working_Day) as Year
  FROM samlite_resignations sr
  LEFT JOIN sam_users su ON sr.user_id = su.id AND sr.org_id = su.org_id
  LEFT JOIN sam_personal_details AS pd ON pd.user_id = sr.user_id AND pd.org_id = sr.org_id
  LEFT JOIN salary_data sd ON sr.user_id = sd.id AND sr.org_id = sd.org_id
  LEFT JOIN leave_data ld ON sr.user_id = ld.user_id AND sr.org_id = ld.org_id
  LEFT JOIN leave_application_data lad ON sr.user_id = lad.user_id AND sr.org_id = lad.org_id
  LEFT JOIN leave_calculation lc ON sr.user_id = lc.user_id AND sr.org_id = lc.org_id
  LEFT JOIN (SELECT 
      user_id,
      'adoc/variable' as type,
      SUM(CASE WHEN type = 'variable' THEN amount ELSE 0 END) 
          - SUM(CASE WHEN type = 'adoc' THEN amount ELSE 0 END) AS amount
  FROM 
       sam_adoc_variable
  GROUP BY 
      user_id)
  AS av ON su.id = av.user_id
  WHERE sr.status = "offboarded" AND  YEAR(sr.Last_working_day) = YEAR(CURRENT_DATE()) and su.is_active =1
        AND sr.org_id = ? and sr.user_id IN (${userIdPlaceholders})`;

    const values = [obj.org_id, obj.org_id, obj.org_id, obj.org_id, obj.org_id,...userIds];
    let res = await mysqlDao.doQueryParams(query, values);


    if (res.length > 0) {
      const deletedUsers = await this.deleteFinalSettlementCurrentMonthPayout(obj, data);
      const insertQuery = `INSERT INTO samlite_final_settlement 
      (user_id, org_id, Full_Name, Employee_ID, Date_Of_Joining, Department_Name, SubDepartment_Name, Designation_Name, Resignation_Date, Last_Working_Day,
      Total_Earned_Leave, Total_Leave_Taken, Comp_off_Applied, Comp_Off_Balance, LOP_Deduction_amount, LOP_Leaves, Excess_Leaves, Remaining_Leave, Monthly_Salary,
      CTC, Basic, Month_Basic, Month_HRA, Month_CTC, Day_Salary,Adoc_Variable_Amount, Conveyance_Allowance, EL_Encashment, Comp_Off_Encashment, Excess_Leave_Deduction_Amount, Month, Year)
      VALUES ? `;

      const payoutValues = res.map((row) => [
        row.user_id,
        row.org_id,
        row.Full_Name,
        row.Employee_ID,
        row.Date_Of_Joining,
        row.Department_Name,
        row.SubDepartment_Name,
        row.Designation_Name,
        row.Resignation_Date,
        row.Last_Working_Day,
        row.Total_Earned_Leave,
        row.Total_Leave_Taken,
        row.Comp_off_Applied,
        row.Comp_Off_Balance,
        row.LOP_Deduction_amount,
        row.LOP_Leaves,
        row.Excess_Leaves,
        row.Remaining_Leave,
        row.Monthly_Salary,
        row.CTC,
        row.Basic,
        row.Month_Basic,
        row.Month_HRA,
        row.Month_CTC,
        row.Day_Salary,
        row.Adoc_Variable_Amount,
        row.Conveyance_Allowance,
        row.EL_Encashment,
        row.Comp_Off_Encashment,
        row.Excess_Leave_Deduction_Amount,
        row.Month,
        row.Year
      ]);

      let result = await mysqlDao.doQueryParams(insertQuery, [payoutValues]);
      return result;
    } else {
      return [];
    }
  };

  this.deleteFinalSettlementCurrentMonthPayout = async (obj, data) => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString("en-US", { month: "long" });
    // const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const userPlaceholders = data.users.map(() => '?').join(', ');

    const query = `DELETE FROM samlite_final_settlement 
                WHERE Month = ? AND Year = ? AND org_id = ? AND user_id IN (${userPlaceholders})`;
    // const values = [month, year, obj.org_id, ...data.users];
    const userIds = Array.isArray(data.users) ? data.users : [data.users];
    const values = [month, year, obj.org_id, ...userIds];
    await mysqlDao.doQueryParams(query, values);
  };


  // FINAL SETTLEMENT END


  // FINAL SETTLEMENT PAYOUT START

  this.getFinalSettlementPayoutDetails = async (obj) => {
    const query = `SELECT sfs.* FROM samlite_final_settlement AS sfs
    INNER JOIN samlite_resignations AS sr ON sr.user_id = sfs.user_id
    WHERE sfs.org_id = ? AND Month = ? AND Year = ?;`;
    let values = [obj.org_id, obj.month, obj.year];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateFinalSettlementPayoutDetails = async (obj) => {
     // Ensure row_id is always an array
  const rowIds = Array.isArray(obj.row_id) ? obj.row_id : [obj.row_id];
  if (rowIds.length === 0) return {};
  // Generate placeholders like ?, ?, ?
  const placeholders = rowIds.map(() => '?').join(',');
  const query = `UPDATE samlite_final_settlement
                  SET
                  settlement_status = ?
                  WHERE id IN (${placeholders});`;
  const values = [obj.status, ...rowIds];
  let res = await mysqlDao.doQueryParams(query, values);
  return _.isEmpty(res) ? {} : res;
  };

  

  // this.updateIsActiveStatus = async (obj = {}) => {
  //   // console.log(obj, "--------obj------------");
  
  //   const userIds = Array.isArray(obj.user_id)
  //     ? obj.user_id.filter(id => id !== undefined && id !== null)
  //     : obj.user_id !== undefined && obj.user_id !== null
  //       ? [obj.user_id]
  //       : [];

  //   // console.log(userIds, "--------userIds-------");
  
  //   if (userIds.length === 0) return {};
  //   const placeholders = userIds.map(() => '?').join(',');
  //   const query = `UPDATE sam_users SET is_active = 0 WHERE id IN (${placeholders});`;
  //   const res = await mysqlDao.doQueryParams(query, userIds);
  //   return _.isEmpty(res) ? {} : res;
  // };
  

  this.getFinalSettlementDetailsForLogs = async (obj) => {
    const query = `SELECT * FROM samlite_final_settlement WHERE id = ?`;
    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };


  this.insertFSDetailsForLogs = async (
    modulename,
    obj,
    user_id,
    actionType
  ) => {
    const query = `INSERT INTO sam_payroll_logs(id, module_name, created_by, created_at, action, logs) VALUES (?,?,?,?,?,?)`;
    let values = [
      null,
      modulename,
      user_id,
      new Date(),
      actionType,
      JSON.stringify(obj),
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deleteFinalSettlementPayoutUsers = async (obj) => {
    const query = `DELETE FROM samlite_final_settlement
	WHERE id = ?;`;

    let values = [obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.generateFSPayslip = async (obj) => {
    const query = `UPDATE samlite_final_settlement 
    set is_payslip = 1
    where Month = ? and Year = ? and user_id in (?);`;
    let values = [obj.Month, obj.Year, obj.users];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };


  this.getFSPayslipDetails = async (obj) => {
    const query = `SELECT 
    a.Employee_id,
    a.Designation_Name,
    a.Date_Of_Joining,
    date(current_date()) AS Final_Settlement_Date,
    a.Full_Name AS employee_name,
    e.account_number,
    a.Last_Working_Day,
    a.Remaining_Leave,
    a.LOP_Leaves,
    a.Final_Amount AS Month_Basic,
    a.Month_HRA,
    a.Conveyance_Allowance,
    COALESCE(ANY_VALUE(av.variable), 0) AS variable,
    a.EL_Encashment,
    COALESCE(ANY_VALUE(av.adoc_deduction), 0) AS adoc_deduction,
    a.Month,
    a.Year,
    f.company_name,
    f.corporate_office,
    f.Registered_office,
    f.logo_url,
    sr.personal_email_id AS personalemail_id,
    COALESCE(ANY_VALUE(av.adoc_deduction), 0) AS Adoc_Deduction,
    COALESCE(ANY_VALUE(av.variable), 0) AS Variable
FROM 
    samlite_final_settlement AS a
LEFT JOIN 
    samlite_resignations AS sr ON a.user_id = sr.user_id
LEFT JOIN 
    sam_bank_credentials AS e ON a.user_id = e.user_id
LEFT JOIN 
    samlite_company_details AS f ON a.org_id = f.org_id
LEFT JOIN (
    SELECT user_id, 
           SUM(CASE WHEN type = 'adoc' THEN amount ELSE 0 END) AS adoc_deduction,
           SUM(CASE WHEN type = 'variable' THEN amount ELSE 0 END) AS variable
    FROM sam_adoc_variable
    GROUP BY user_id
) AS av ON a.user_id = av.user_id
WHERE 
	 a.Month = ?
    AND a.Year = ?
    AND a.user_id IN (?)
    AND a.is_payslip = 1
GROUP BY 
    a.Employee_id,
    a.Designation_Name,
    a.Date_Of_Joining,
    a.Full_Name,
    e.account_number,
    a.Last_Working_Day,
    a.Remaining_Leave,
    a.LOP_Leaves,
    a.Final_Amount,
    a.Month_HRA,
    a.Conveyance_Allowance,
    a.EL_Encashment,
    a.Month,
    a.Year,
    f.company_name,
    f.corporate_office,
    f.Registered_office,
    f.logo_url,
    sr.personal_email_id
`;
    let values = [obj.Month, obj.Year, obj.users];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // this.mergeUserData = async (a, b) => {
  //   const old_records = [];
  //   const new_records = [];

  //   // Create a map for the first array for quick lookup
  //   const mapA = new Map(a.map((user) => [user.user_id, user.name]));

  //   // Iterate through the second array
  //   for (const userB of b) {
  //     const userId = userB.user_id;
  //     if (mapA.has(userId)) {
  //       // If user exists in the first array, add old_name
  //       old_records.push({
  //         user_id: userId,
  //         old_name: mapA.get(userId),
  //         name: userB.name,
  //       });
  //       // Remove the user from the map to avoid duplicates
  //       mapA.delete(userId);
  //     } else {
  //       // If user does not exist in the first array, just add it
  //       new_records.push({ user_id: userId, name: userB.name, ctc: userB.ctc });
  //     }
  //   }

  //   // Add remaining users from the first array that were not in the second array
  //   for (const [userId, oldName] of mapA) {
  //     old_records.push({ user_id: userId, old_name: oldName });
  //   }
  //   result = {
  //     old_records,
  //     new_records,
  //   };

  //   return result;
  // };
}

module.exports = new obj();
