var mysqlDao = require(__base + "/dao/mysqlDao.js");

function obj() {
  this.updateCompanyOverview = async function (obj, id) {
    const query = `
     UPDATE samlite_company_details
      SET 
        company_name = ?, 
        brand_name = ?, 
        official_email = ?, 
        official_contact = ?, 
        website = ?, 
        Domain = ?, 
        industry_type = ?, 
        Registered_office = ?, 
        corporate_office = ?,
        logo_url=?
      WHERE org_id = ?
    `;

    const values = [
      obj.registeredCompanyName,
      obj.brandName,
      obj.companyEmail,
      obj.companyContact,
      obj.website,
      obj.domainName,
      obj.industryType,
      obj.registeredOffice,
      obj.corporateOffice,
      obj.logourl,
      id,
    ];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

   this.getCompanyOverview = async function (id) {
    const query = " select*from samlite_company_details where org_id=?";
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  // this.companyStatutory = async function (id, data) {
  //   const getValidValue = (value) => {
  //     if (value === null || value === undefined) return "NULL";
  //     if (typeof value === "string") return `'${value.replace("'", "''")}'`;
  //     return value;
  //   };
  //   const fields = [
  //     "Entity_Type",
  //     "CIN",
  //     "dateOfIncorporation",
  //     "companyPan",
  //     "companyTan",
  //     "GST",
  //     "Accounttitle",
  //     "bankName",
  //     "AccountNumber",
  //     "branchName",
  //     "city",
  //     "IFSC",
  //     "Accounttype",
  //     "CorporateID",
  //   ];

  //   const setClauses = [];
  //   fields.forEach((field) => {
  //     if (data[field] !== undefined && data[field] !== null) {
  //       setClauses.push(`${field} = ${getValidValue(data[field])}`);
  //     }
  //   });

  //   if (setClauses.length === 0) {
  //     return {};
  //   }

  //   const setClauseString = setClauses.join(", ");
  //   const query = `
  //     UPDATE samlite_companydetails
  //     SET ${setClauseString}
  //     WHERE org_id = ?
  //   `;

  //   try {
  //     const values = [id];
  //     const res = await mysqlDao.doQueryParams(query, values);

  //     return res && !_.isEmpty(res) ? res : {};
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  this.updateCompanyStatutory = async function (id, data) {
    const fieldMap = {
      entity_type: "entity_type",
      cin: "cin",
      date_of_incorporation: "date_of_incorporation",
      company_pan: "company_pan",
      company_tan: "company_tan",
      gst: "gst",
      account_title: "account_title",
      bank_name: "bank_name",
      account_number: "account_number",
      branch_name: "branch_name",
      city: "city",
      ifsc: "ifsc",
      account_type: "account_type",
      corporate_Id: "corporate_Id",
    };
  
    const setClauses = [];
    const values = [];
  
    Object.entries(fieldMap).forEach(([frontendField, dbColumn]) => {
      if (data[frontendField] !== undefined) {
        setClauses.push(`${dbColumn} = ?`);
  
        // Proper NULL handling
        if (data[frontendField] === "" || data[frontendField] === null) {
          values.push(null);
        } else {
          values.push(data[frontendField]);
        }
      }
    });
  
    if (setClauses.length === 0) return {};
  
    const query = `
      UPDATE samlite_company_details
      SET ${setClauses.join(", ")}
      WHERE org_id = ?
    `;
  
    values.push(id);
  
    try {
      const res = await mysqlDao.doQueryParams(query, values);
      return res && !_.isEmpty(res) ? res : {};
    } catch (error) {
      throw error;
    }
  };
  

  this.getOrganizationDesignations = async function (id) {
    const query = `select distinct a.designations, count(b.id) as designation_count, a.org_id, a.id  from samlite_designations as a
left join sam_users as b on a.org_id = b.org_id and
b.designation_Id = a.id where a.org_id = ?
 group by a.designations, a.id, a.org_id
 order by designation_count desc`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };


  this.addDepartments = async function (id, data) {
    const query1 = `INSERT INTO samlite_departments 
                     (org_id, department_name, department_head) 
                     VALUES (?, ?, ?)`;
    const values1 = [id, data.department, data.departmentHead];
    const res1 = await mysqlDao.doQueryParams(query1, values1);
    const query2 = `INSERT INTO samliteorg_subdepartments (departmentId, org_id, subdepartment) VALUES (?, ?, ?)`;
    const res2 = [];

    for (let i = 0; i < data.subDepartments.length; i++) {
      const subDept = data.subDepartments[i];
      let values2 = [res1.insertId, id, subDept.subDepartment];
      const result = await mysqlDao.doQueryParams(query2, values2);
      res2.push(result);
    }

    return {
      res1,
      res2,
    };
  };

  this.updateDepartments = async function (id, data) {
    const query1 = `UPDATE samlite_departments 
                                    SET department_name = ?, department_head = ? 
                                    WHERE id = ?`;
    const Values1 = [data.department, data.departmentHead, data.id];
    const updateRes = await mysqlDao.doQueryParams(query1, Values1);
    const query2 = `UPDATE samliteorg_subdepartments 
                                       SET subdepartment = ? 
                                       WHERE id = ? AND departmentId=?`;
    const updateResList = [];
    for (let i = 0; i < data.subDepartments.length; i++) {
      const subDept = data.subDepartments[i];
      if (subDept.subDepartmentId) {
        const Values2 = [
          subDept.subDepartment,
          subDept.subDepartmentId,
          data.id,
        ];
        const result = await mysqlDao.doQueryParams(query2, Values2);
        updateResList.push(result);
      } else {
        const query3 = `INSERT INTO samliteorg_subdepartments 
                                          (departmentId, org_id, subdepartment) 
                                          VALUES (?, ?, ?)`;
        const Values3 = [data.id, id, subDept.subDepartment];
        const insertResult = await mysqlDao.doQueryParams(query3, Values3);
        updateResList.push(insertResult);
      }
    }
    return {
      updateDepartmentRes: updateRes,
      subDepartmentUpdates: updateResList,
    };
  };

 this.getOrganizationDepartments = async function (id) {
    const query = `SELECT 
    d.org_id,
    d.id AS department_id,
    d.department_name,
    d.department_head,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'subdepartment_id', s.id,
            'subdepartment', s.subdepartment,
            'count', s.subdepartment_count
        )
    ) AS subdepartments
FROM 
    samlite_departments d
LEFT JOIN (
    SELECT 
        s.id,
        s.departmentID,
        s.org_id,
        s.subdepartment,
        COUNT(u.subdepartment_Id) AS subdepartment_count
    FROM 
        samliteorg_subdepartments s
    LEFT JOIN 
        sam_users u
    ON 
        u.org_id = s.org_id 
        AND u.subdepartment_Id = s.id
    WHERE s.org_id = ?
    GROUP BY 
        s.id, s.departmentID, s.org_id, s.subdepartment
) s
ON 
    d.id = s.departmentID AND d.org_id = s.org_id
WHERE 
    d.org_id = ?
GROUP BY 
    d.org_id, d.id, d.department_name, d.department_head
LIMIT 0, 1000;`;
    let values = [id, id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deleteDepartment = async function (obj) {
    const query = `DELETE FROM samlite_departments WHERE id = ? AND org_id = ?`;
     const values = [obj.department_Id, obj.org_id];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deleteSubDepartment = async function (obj) {
    const query = `DELETE FROM samliteorg_subdepartments WHERE id = ? AND departmentId = ? AND org_id = ?
`;
    const values = [obj.subdepartment_Id, obj.department_Id, obj.org_id];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.addDesignations = async function (id, data) {
    const query =
      "INSERT INTO samlite_designations(org_id, designations) VALUES(?, ?)";
    const results = [];
    for (let designation of data.designations) {
      const values = [id, designation];
      let res = await mysqlDao.doQueryParams(query, values);
      results.push(res);
    }
    return _.isEmpty(results) ? {} : results;
  };

  this.deleteDesignations = async function (data) {
    const query =
      "delete from samlite_designations where id=? and org_id=?";
    let values = [data.designation_Id, data.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkDesignations = async function (id, data) {
    const query =
      "SELECT * FROM samlite_designations WHERE BINARY designations = ? AND org_id = ?";
    const results = [];
    for (let designation of data.designations) {
      const values = [designation, id];
      let res = await mysqlDao.doQueryParams(query, values);
      if (!_.isEmpty(res)) {
        results.push(res);
      }
    }
    return _.isEmpty(results) ? {} : results;
  };

  this.checkDepartment = async function (id, data) {
    const query =
      "SELECT * FROM samlite_departments WHERE BINARY department_name = ? AND org_id = ?";
    let values = [data.department, id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.assignedDept = async function (id) {
   const query = `select a.id FROM sam_personal_details as a
left join sam_users as b on a.user_id = b.id
where b.department_Id=?`;
 let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkDesignation = async function (id) {
    const query = `select b.id FROM sam_users as a 
left join sam_personal_details as b on a.id = b.user_id
where a.designation_Id=?`;
   let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkSubDepartment = async function (id) {
    const query = `select a.id FROM sam_personal_details as a
left join sam_users as b on a.user_id = b.id
where b.subdepartment_Id=?`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.applyResignation = async function (obj, data) {
     const createdAt = new Date();
    const query = `insert into samlite_resignations(user_id,org_id,personalemail_id,mobile_number,emergency_contact_number,address,reason_for_resignation, resignation_timestamp) values(?,?,?,?,?,?,?,?) `;
    let values = [
      obj.user_id,
      obj.org_id,
      data.email,
      data.mobileNumber,
      data.emergencyContactNumber,
      data.address,
      data.reason,
      createdAt,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkResignation = async function (obj) {
    const query = `select * from samlite_resignations where user_id=? and org_id=?`;
    let values = [obj.user_id, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.generateExperienceLetterPDF = async function (data) {
    let logopath = await companyDl.getlogo(data[0].org_id);
    let logo_url = logopath[0].logo_url;
    const experienceHTML = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            border: 1px solid #ddd;
            box-sizing: border-box;
            background-color: #fff;
          }
          .page-wrapper {
            max-width: 210mm; /* A4 width */
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
            padding: 20px;
            min-height: 100%; /* Ensures footer stays at the bottom */
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header {
            text-align: center;
          }
          .header img {
            max-width: 120px;
            width: 100%;
          }
          .header h2 {
            margin-top: 10px;
            color: #333;
            font-size: 24px;
            font-weight: bold;
          }
          .top-color {
            background-color: black;
            height: 10px;
            width: 100%;
            margin-top: 20px;
            margin-bottom:30px;
          }
          .experience-heading {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-top: 30px;
          }
          .content {
            padding: 20px;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
          }
          .content p {
            margin-bottom: 20px;
          }
          .content p strong {
            font-weight: bold;
          }
          .footer-line {
            background-color: black;
            height: 10px;
            width: 100%;
            margin-top: 20px; /* Adjust space above the footer line */
          }
          .footer {
            text-align: left;
            font-size: 14px;
            color: #333;
            margin-top: auto; /* Push the footer content towards the bottom */
            padding-bottom: 10px; /* Adjusted space before the footer line */
          }
          .footer .company-address {
            font-size: 14px;
            margin-top: 10px; /* Move the address above the footer line */
          }
          .signature {
            margin-top: 40px;
            text-align: center;
          }
          .signature p {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div class="header">
            <img src="${logo_url}" alt="Company Logo" />
          </div>
          <div class="experience-heading">
            Experience Letter
          </div>
          <div class="content">
            <p>Date:<strong>${new Date().toLocaleDateString()}</strong></p>
            <p>Employee ID: <strong>${data[0].Employee_id}</strong></p>
            <p>This is to certify that <strong>${
              data[0].Name
            }</strong> has been employed with <strong>${
      data[0].org_name
    }</strong> from <strong>${formatDate(
      data[0].DateofJoining
    )}</strong> to <strong>${formatDate(
      data[0].Last_working_day
    )}</strong>. During their tenure, they have worked as a <strong>${
      data[0].designations
    }</strong>.</p>
            <p>Throughout their time with us, <strong>${
              data[0].Name
            }</strong> demonstrated exceptional skills in their field, significantly enhancing our team's performance and project outcomes.</p>
            <p>Their conduct and performance during their tenure at <strong>${
              data[0].org_name
            }</strong> were excellent, and I wish them success in their future endeavors.</p>
          </div>
          <div class="footer">
            <p class="company-address">${data[0].org_name}</p>
            <p class="company-address">${data[0].Address}</p>
          </div>
          <div class="signature">
          </div>
        </div>
      </body>
    </html>
  `;
 
  try {
    const pdfBuffer = await htmlPdf.create(experienceHTML, {
      format: 'A4',
      printBackground: true
    }).toBuffer();
 
    return pdfBuffer;
  } catch (error) {
    throw error;
  }
};


this.rejectResignation = async function (obj) {
  const query = `UPDATE samlite_resignations 
                 SET status = ?, reason_for_rejection = ?, updated_at = ?
                 WHERE user_id = ?;`;

  const values = [
    obj.status,
    obj.reasonForRejection,
    null,
    obj.user_id,
  ];

  const res = await mysqlDao.doQueryParams(query, values);
  return _.isEmpty(res) ? {} : res;
};

this.getResignedUsers = async function (id) {
  const query = `SELECT 
  u.username as Name, 
  u.employee_id as Employee_id,
  p.date_of_joining as DateofJoining,
  org.org_name,
  org.address as Address, 
  company.logo_url, 
  d.department_name, 
  des.designations,
  resig.personalemail_id,
  resig.mobile_number,
  resig.emergency_contact_number,
  resig.address,
  resig.user_id,
  resig.resignation_timestamp,
  resig.status,
  resig.updated_at,
  resig.updated_by,
  resig.Last_working_day,
  resig.reason_for_rejection 
FROM 
  sam_personal_details p
JOIN
  sam_users u on u.id = p.user_id left join
  sam_organizations org ON p.org_id = org.id
LEFT JOIN 
  samlite_departments d ON u.department_Id = d.id
LEFT JOIN 
  samlite_designations des ON u.designation_Id = des.id
JOIN 
  samlite_resignations r ON p.user_id = r.user_id AND p.org_id = r.org_id
LEFT JOIN 
  samlite_resignations resig ON p.user_id = resig.user_id AND p.org_id = resig.org_id
JOIN 
  samlite_company_details company ON resig.org_id = company.org_id 
WHERE 
 r.org_id = ?
;`;
  let values = [id];
  let res = await mysqlDao.doQueryParams(query, values);
  return _.isEmpty(res) ? {} : res;
};


  this.resignationDetails = async function (user_id, org_id) {
    const query = `select*from samlite_resignations where user_id=? AND org_id=?`;
    let values = [user_id, org_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };


   this.offBoardUsers = async function (obj, data) {
    const updatedAt = new Date();
     const query = `UPDATE samlite_resignations
SET Last_working_day = ?, status = ?, updated_at = ?, updated_by = ?
WHERE user_id = ? AND org_id = ?;`;
     let values = [
      data.lastWorkingDay,
      data.status,
      updatedAt,
      obj.user_name,
      data.user_id,
      obj.org_id,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

this.getUserExperienceDetails = async function (user_id, org_id) {
  const query = `SELECT 
  u.username as Name, 
  u.employee_id as Employee_id,
  p.date_of_joining,
  org.org_name,
  org.Address, 
  d.department_name, 
  des.designations,
  resig.user_id,
  resig.org_id,
  resig.personalemail_id,
  resig.mobile_number,
  resig.emergency_contact_number,
  resig.address,
  resig.Last_working_day,
  resig.reason_for_rejection
FROM 
    sam_personal_details p
JOIN
sam_users u on u.id = p.user_id left join
  sam_organizations org ON p.org_id=org.id
JOIN 
   samlite_departments d ON u.department_Id = d.id
JOIN 
     samlite_designations des ON u.designation_Id = des.id
JOIN 
    samlite_resignations r ON p.user_id = r.user_id AND p.org_id = r.org_id
JOIN 
    samlite_resignations resig ON p.user_id=resig.user_id AND p.org_id=resig.org_id
WHERE 
   r.org_id = ? and r.user_id=?;`;
  let values = [org_id, user_id];
  let res = await mysqlDao.doQueryParams(query, values);
  return _.isEmpty(res) ? {} : res;

  }

  this.getLogo=async function(id){
   const query = `select logo_url from samlite_company_details where org_id=? `;
    let values=[id]
    let res= await mysqlDao.doQueryParams(query, values)
    return _.isEmpty(res)?{}:res;
  }
}

module.exports = new obj();
