const mysqlDao = require("../dao/mysqlDao");
const leaveManagementDl = require("../dl/leaveManagementDl");
var companyDl = require(__base + "/dl/companyDl.js");
var authDl = require(__base + "/dl/authDl.js");
var validations = require(__base + "/validations/validation.js");
var emailUtils = require(__base + "/utils/emailUtils.js");
const PDFDocument = require('pdfkit');
const payrollBl = require(__base + "/bl/payrollBl.js");



function Obj() {
   this.updateCompanyOverview = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let data = { org_id };
    if (req.file) {
      let logourl = await mysqlDao.storeDataToGCP(data, req);
      req.body.logourl = logourl;
     let companydetails = await companyDl.updateCompanyOverview(req.body, org_id);
      if (!_.isEmpty(companydetails)) {
        response["status"] = "success";
        response["message"] = "updated details Successfully";
      } else {
        response["status"] = "error";
        response["message"] = "failed";
      }
    } else {
      let companydetails = await companyDl.updateCompanyOverview(req.body, org_id);
      if (!_.isEmpty(companydetails)) {
        response["status"] = "success";
        response["message"] = "updated details Successfully";
      } else {
        response["status"] = "error";
        response["message"] = "failed";
      }
    }

    return response;
  };


   this.getCompanyOverview = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let response = {};
    let company_overview = await companyDl.getCompanyOverview(org_id);
    if (!_.isEmpty(company_overview)) {
      response["status"] = "success";
      response["data"] = company_overview;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };


 this.updateCompanyStatutory = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let response = {};
    let companydetails = await companyDl.updateCompanyStatutory(org_id, req.body);
    if (!_.isEmpty(companydetails)) {
      response["status"] = "success";
      response["message"] = "Details have been added";
    } else {
      response["status"] = "error";
      response["message"] = "Failed to update data";
    }
    return response;
  };

  this.addDepartments = async function (req, res) {
    let validationRuleObj = {
      department: "required",
      subDepartments: "required",
    };
    let validationObj = req.body;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      let org_id = user_details.org_id;
      let check_department = await companyDl.checkDepartment(org_id, req.body);
      if (_.isEmpty(check_department)) {
        let update_results = await companyDl.addDepartments(org_id, req.body);
        if (!_.isEmpty(update_results)) {
          response["status"] = "success";
          response["message"] = "Department added successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to add department";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Department already exist.!!";
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

  this.updateDepartment = async function (req, res) {
    let validationRuleObj = {
      id: "required",
      department: "required",
      subDepartments: "required",
    };
    let validationObj = req.body;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      let org_id = user_details.org_id;
       let update_results = await companyDl.updateDepartments(org_id, req.body);
      if (!_.isEmpty(update_results)) {
        response["status"] = "success";
        response["message"] = "Department updated successfully";
      } else {
        response["status"] = "error";
        response["message"] = "Failed to update department";
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

  this.getOrganizationDepartments = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let response = {};
   let org_departments = await companyDl.getOrganizationDepartments(org_id);
   if (!_.isEmpty(org_departments)) {
      response["status"] = "success";
      response["data"] = org_departments;
    } else {
      response["status"] = "error";
      response["message"] = "No data Found";
    }
    return response;
  };

  this.getOrganizationDesignations = async function (req, res) {
    let userdetails = await authDl.getDecryptToken(req);
    let org_id = userdetails.org_id;
    let response = {};
   let designations = await companyDl.getOrganizationDesignations(org_id);
    if (!_.isEmpty(designations)) {
      response["status"] = "success";
      response["data"] = designations;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

  this.deleteDepartment = async function (req, res) {
    console.log(req.query, "req.query");
    let response = {};
    let validationRuleObj = {
      departmentId: "required",
    };
    let validationObj = req.query;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
    let user_details = await authDl.getDecryptToken(req);
    org_id = user_details.org_id;
    department_Id = req.query.departmentId;
    subdepartment_Id = req.query.subDepartmentId;
    data = { org_id, department_Id, subdepartment_Id };
    if (subdepartment_Id) {
      let sub_dept_exist = await companyDl.checkSubDepartment(subdepartment_Id);
      if (_.isEmpty(sub_dept_exist)) {
        let delete_sub_dep = await companyDl.deleteSubDepartment(data);
        if (!_.isEmpty(delete_sub_dep) && delete_sub_dep.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "deletesubdepartment successfully";
        } else {
          response["status"] = "error";
          response["message"] = "error in deleting subdepartment";
        }
      } else {
        response["status"] = "error";
        response["message"] =
          "This Subdepartment is already assigned to employees, You cannot delete it ";
      }
    } else {
          let assigned_dept = await companyDl.assignedDept(department_Id);
      if (_.isEmpty(assigned_dept)) {
        let delete_department = await companyDl.deleteDepartment(data);
        if (!_.isEmpty(delete_department)) {
          response["status"] = "success";
          response["data"] = "department  has been deleted";
        } else {
          response["status"] = "error";
          response["message"] = "failed to delete departments";
        }
      } else {
        response["status"] = "error";
        response["message"] =
          "Departments is assigned to employees, You cannot delete it ";
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

  this.getsubDepartments = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let results = await companyDl.getsubDepartments(org_id);
    if (!_.isEmpty(results)) {
      response["status"] = "success";
      response["data"] = "results";
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
  };

  this.addDesignations = async function (req, res) {
    let validationRuleObj = {
      designations: "required",
    };
    let validationObj = req.body;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      let org_id = user_details.org_id;
     let check_designations = await companyDl.checkDesignations(
        org_id,
        req.body
      );
      if (_.isEmpty(check_designations)) {
        let results = await companyDl.addDesignations(org_id, req.body);
        if (!_.isEmpty(results)) {
          response["status"] = "success";
          response["message"] = "New Designations has been added successfully";
        } else {
          response["status"] = "error";
          response["message"] = "There was an error";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Designation already exist ";
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

  this.getDropdowns = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let response = {};
    let getdropdowns = await companyDl.getDropdowns(org_id);
    if (!_.isEmpty(getdropdowns)) {
      response["status"] = "success";
      response["data"] = getdropdowns;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

   // this.getDropdowns = async function (req, res) {
  //   let user_details = await authDl.getDecryptToken(req);
  //   let org_id = user_details.org_id;
  //   let response = {};
  //   let getdropdowns = await companyDl.getDropdowns(org_id);
  //   if (!_.isEmpty(getdropdowns)) {
  //     response["status"] = "success";
  //     response["data"] = getdropdowns;
  //   } else {
  //     response["status"] = "error";
  //     response["message"] = "No data found";
  //   }
  //   return response;
  // };

  this.deleteDesignations = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let validationRuleObj = {
      id: "required",
    };
    let validationObj = req.query;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
    let designation_Id = req.query.id;
    let desig_assigned = await companyDl.checkDesignation(designation_Id);
    if (_.isEmpty(desig_assigned)) {
      let data = { org_id, designation_Id };
      let results = await companyDl.deleteDesignations(data);
      if (!_.isEmpty(results)) {
        response["status"] = "success";
        response["message"] = "Designation deleted successfully";
      } else {
        response["status"] = "error";
        response["message"] = "There was an error in deleting the designation";
      }
    } else {
      response["status"] = "error";
      response["message"] =
        "Designation is already assigned to employees, You cannot delete it";
    }
  } else{
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

  this.applyResignation = async function (req, res) {
    let validationRuleObj = {
      mobileNumber: "required",
      email: "required",
      emergencyContactNumber: "required",
      address: "required",
      reason: "required",
      declaration: "required",
    };
    let validationObj = req.body;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
     let check_resignation = await companyDl.checkResignation(user_details);
      if (_.isEmpty(check_resignation)) {
        let results = await companyDl.applyResignation(user_details, req.body);
        let email = await self.resignationEmail(user_details, req.body);
       if (!_.isEmpty(results) && email.status==="success") {
          response["status"] = "success";
          response["message"] = "Resignation applied Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to apply Resignation";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Resignation already applied";
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

  this.getResignedUsers = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let response = {};
   let get_resigned_users = await companyDl.getResignedUsers(org_id);
    if (!_.isEmpty(get_resigned_users)) { 
   response["status"] = "success";
      response["data"] = get_resigned_users;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

    this.resignationEmail = async function (userdetails) {
    let admin_data = await leaveManagementDl.getAdminData(userdetails.org_id);
    let user_data = await leaveManagementDl.getUserData(
      userdetails.org_id,
      userdetails.user_id
    );
    let resignation_details = await companyDl.resignationDetails(
      userdetails.user_id,
      userdetails.org_id
    );
    let response = {};
    let subject = `Resignation-${user_data[0].Name}`;
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
                          <h2>Resignation Application</h2>
                      </div>
                      <div class="content">
                          <h1>Hey {{adminName}},</h1>
                          <p>${user_data[0].Name} has submitted their resignation request.</p>
                          <p><strong>Reason for Resignation:</strong> ${resignation_details[0].reason_for_resignation}</p>
                          <p>Please click the link below to view the resignation application:</p>
                         <p>
        <a href='${process.env.REACT_APP_API_URL}/login?redirect=/admin/off-boarding' class="click-link">view</a>
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
        const adminEmail = admin.email;
        const adminName = admin.username;
        let personalizedMessage = message.replace("{{adminName}}", adminName);
        await emailUtils.sendEmail(adminEmail, subject, personalizedMessage);
      }

      response["message"] =
        "Resignation email sent successfully to all admins.";
      response["status"] = "success";
    } catch (error) {
      response["message"] = "Failed to send Resignation email.";
      response["status"] = "error";
    }

    return response;
  };


 this.offBoardUsers = async function (req, res) {
    let userdetails = await authDl.getDecryptToken(req);
    let validationRuleObj = {
      status: "required",
      user_id: "required",
    };
    let validationObj = req.body;
    let response = {};
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      if (req.body.status === 'approved') {
        let results = await companyDl.offBoardUsers(userdetails, req.body);
        if (!_.isEmpty(results)) {
         let sendemail = await self.offBoardEmail(req.body, userdetails);
          if (sendemail.status === "success") {
            response["status"] = "success";
            response["message"] = "Resignation has been approved";
          }
        } else {
          response["status"] = "error";
          response["message"] = "failed to approve the resignation";
        }
      } else {
        let results = await companyDl.rejectResignation(req.body);
        console.log(results, "results");
        if (!_.isEmpty(results)) {
          let rejectResignation = await self.rejectResignationEmail(
            req.body,
            userdetails
          );
          console.log(rejectResignation, "rejectresignation");
          if (rejectResignation.status === "success") {
            response["status"] = "success";
            response["message"] = "Resignation has been rejected";
          }
        } else {
          response["status"] = "error";
          response["message"] = "failed to reject the resignation";
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


     this.generateExperienceLetterPDF = async function (data) {

     
    try {
         console.log(data, "data in generateExperienceLetterPDF");
        const doc = new PDFDocument({ margin: 30 });
        const pdfBuffer = [];
        
        doc.on('data', chunk => pdfBuffer.push(chunk));
        
        return new Promise(async (resolve, reject) => {
            doc.on('end', () => {
                const completePdfBuffer = Buffer.concat(pdfBuffer);
                resolve(completePdfBuffer);
            });
 
            doc.on('error', (error) => {
              
                reject(error);
            });
 
            const logoPath = await companyDl.getLogo(data[0].org_id);
            const logoUrl = logoPath.length > 0 ? logoPath[0].logo_url : null;
            const logoBuffer = logoUrl ? await payrollBl.fetchImage(logoUrl) : null;
            const orgDetail = await companyDl.getCompanyOverview(data[0].org_id);
            
            console.log(logoUrl, "logoURL");
            console.log(logoPath, "logo path");
          console.log(orgDetail, "orgDetail");
            if (logoBuffer) {
                const logoWidth = 100;
                const xPosition = (doc.page.width - logoWidth) / 2;
                doc.image(logoBuffer, xPosition, 20, { width: logoWidth });
                doc.moveDown(6);
            }
 
            doc.fontSize(24).font('Helvetica-Bold')
                .text('Experience Letter', { align: 'center' })
                .moveDown(3);
 
            doc.fontSize(14).font('Helvetica')
                .text(`Employee ID: ${data[0].Employee_id}`)
                .moveDown(1);
 
            const formatDate = (date) => new Date(date).toLocaleDateString();
            doc.fontSize(14)
                .text(`This is to certify that ${data[0].Name} has been employed with ${data[0].org_name} from ${formatDate(data[0].date_of_joining)} to ${formatDate(data[0].Last_working_day)}. During their tenure, they worked as a ${data[0].designations}.`)
                .moveDown(1);
 
            doc.text(`Throughout their time with us, ${data[0].Name} demonstrated exceptional skills in their field, significantly enhancing our team's performance and project outcomes.`)
                .moveDown(1);
 
            doc.text(`Their conduct and performance during their tenure at ${data[0].org_name} were excellent, and we wish them success in their future endeavors.`)
                .moveDown(2);
 
            doc.fontSize(14)
                .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
                .moveDown(1);
 
            doc.fontSize(14).font('Helvetica-Bold')
                .text('From HR Department', { align: 'left' })
                .text(data[0].org_name, { align: 'left' })
                .moveDown(0.5)
                .text(data[0].address, { align: 'left' })
                .moveDown(2);
 
            doc.font('Helvetica-Bold')
                .text('Signature', { align: 'left' })
                .moveDown(1);
            
            doc.font('Helvetica')
                .text('(Authorized Signatory)', { align: 'left' });
 
            if (orgDetail.length > 0) {
                const org = orgDetail[0];
                const pageHeight = doc.page.height;
                const footerY = pageHeight - 100;
                doc.moveTo(30, footerY).lineTo(doc.page.width - 30, footerY).stroke();
 
                doc.fontSize(10).fillColor('black')
                    .text(org.company_name || "", 30, footerY + 10, { align: 'center' })
                    .text(org.corporate_office || "", { align: 'center' })
                    .text(`CIN: ${org.cin}` || "", { align: 'center' })
                    .text(`Phone: ${org.official_contact || "N/A"}, E-Mail: ${org.official_email || "N/A"}`, { align: 'center' });
            }
 
            doc.end();
        });
    } catch (error) {
        throw error;
    }
};

  

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  this.offBoardEmail = async function (data, obj) {
    let resignation_details = await companyDl.getUserExperienceDetails(
      data.user_id,
      obj.org_id
    );
    let last_working_date = formatDate(resignation_details[0].Last_working_day);
    let experience_Letter = await self.generateExperienceLetterPDF(
      resignation_details
    );
    let response = {};
    subject = "Acceptance of Resignation";
    let message = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acceptance of Resignation & Experience Letter</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            text-align: left; /* Ensure text starts from left */
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            margin: 0 auto; /* Center the email container */
          }
          .content {
            text-align: left; /* Ensure content is aligned left */
            color: #333333;
            line-height: 1.6;
          }
          .content h1 {
            color: #333333;
            margin-bottom: 15px;
            font-size: 24px;
            font-weight: bold;
          }
          .content p {
            color: #666666;
            font-size: 16px;
            margin-bottom: 15px; /* Add space between paragraphs */
          }
          .footer {
            text-align: left; /* Ensure footer text is aligned left */
            padding-top: 20px;
            border-top: 1px solid #dddddd;
            color: #999999;
            font-size: 14px;
            margin-top: 30px; /* Space above the footer */
          }
          /* Responsive Design: Ensures the email looks good on smaller screens */
          @media (max-width: 600px) {
            .email-container {
              padding: 15px;
              width: 100%;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="content">
            <h1>Dear ${resignation_details[0].Name},</h1>
            <p>I hope this message finds you well.</p>
            <p>I would like to formally acknowledge receipt of your resignation letter and confirm that your resignation from your position as ${resignation_details[0].designations} has been accepted. Your last working day with ${resignation_details[0].org_name} will be ${last_working_date}.</p>
            <p>On behalf of the entire team, I would like to express our gratitude for your contributions during your time with us. It has been a pleasure working with you, and your efforts have made a meaningful impact. We wish you nothing but success in your future endeavors.</p>
            <p>As per your request, I have attached your Experience Letter, which outlines the details of your tenure with ${resignation_details[0].org_name}, along with the skills and accomplishments you demonstrated during your time here.</p>
            <p>If you require any further assistance or have any questions, please do not hesitate to reach out to me.</p>
            <p>Once again, thank you for your hard work and dedication. We wish you all the best in the next chapter of your career.</p>
          </div>
          <div class="footer">
            ${resignation_details[0].org_name}. All rights reserved.<br>
            ${resignation_details[0].address}
          </div>
        </div>
      </body>
    </html>`;

    try {
      console.log(resignation_details, "resignation_details");
     await emailUtils.sendEmail(
  resignation_details[0].personalemail_id,
  subject,
  message,
  experience_Letter,
  'Experience_Letter.pdf',
);

      response["message"] = "Experience letter email sent successfully.";
      response["status"] = "success";
    } catch (error) {
      response["message"] = "Failed to send email.";
      response["status"] = "error";
    }

    return response;
  };


 this.rejectResignationEmail = async function (data, obj) {
    let resignation_details = await companyDl.getUserExperienceDetails(
      data.user_id,
      obj.org_id
    );
    console.log(resignation_details, "resignation_details");
    console.log(data, "data in rejectResignationEmail");
    let response = {};
    subject = "Rejection of Resignation";
    let message = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rejection of Resignation</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            text-align: left; /* Ensure text starts from left */
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            margin: 0 auto; /* Center the email container */
          }
          .content {
            text-align: left; /* Ensure content is aligned left */
            color: #333333;
            line-height: 1.6;
          }
          .content h1 {
            color: #333333;
            margin-bottom: 15px;
            font-size: 24px;
            font-weight: bold;
          }
          .content p {
            color: #666666;
            font-size: 16px;
            margin-bottom: 15px; /* Add space between paragraphs */
          }
          .footer {
            text-align: left; /* Ensure footer text is aligned left */
            padding-top: 20px;
            border-top: 1px solid #dddddd;
            color: #999999;
            font-size: 14px;
            margin-top: 30px; /* Space above the footer */
          }
          /* Responsive Design: Ensures the email looks good on smaller screens */
          @media (max-width: 600px) {
            .email-container {
              padding: 15px;
              width: 100%;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
       <div class="email-container">
  <div class="content">
    <h1>Dear ${data.Name},</h1>
    <p>I hope this message finds you well.</p>
    <p>Thank you for submitting your resignation letter. After careful review and consideration, I regret to inform you that we cannot accept your resignation at this time. The reason for this decision is that <strong>${resignation_details[0].reason_for_rejection}</strong> does not align with our current policies and organizational needs.</p>
    <p>We believe that, given your contributions and importance to ${resignation_details[0].org_name}, we should explore other ways to address any concerns you have. We would be happy to discuss potential adjustments or solutions that might help resolve the matter.</p>
    <p>We understand that making this decision is difficult, and we genuinely want to hear from you regarding any concerns that led to your resignation request. If you’re open to discussing the situation, I would be happy to meet and work together to find an acceptable resolution.</p>
    <p>Your role is valuable to us, and we are committed to finding a way that benefits both you and the company moving forward.</p>
    <p>Please let me know a suitable time for us to discuss this further. We remain hopeful that we can come to a mutually beneficial arrangement.</p>
    <p>Thank you once again for your dedication and contributions to the team.</p>
  </div>
 
          <div class="footer">
            ${resignation_details[0].org_name}. All rights reserved.<br>
            ${resignation_details[0].address}
          </div>
        </div>
      </body>
    </html>`;

    try {
      await emailUtils.sendEmail(
        resignation_details[0].personalemail_id,
        subject,
        message
      );
      response["message"] = "resignation rejected.";
      response["status"] = "success";
    } catch (error) {
      response["message"] = "Failed to send email.";
      response["status"] = "error";
    }

    return response;
  };


}
var self = (module.exports = new Obj());
