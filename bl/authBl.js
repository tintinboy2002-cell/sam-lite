var authDl = require(__base + "/dl/authDl.js");
const _ = require("lodash");
var emailUtils = require(__base + "/utils/emailUtils.js");

var validations = require(__base + "/validations/validation.js");
var bcrypt = require("bcrypt");
var mysqlDao = require(__base + "/dao/mysqlDao");
const { OAuth2Client } = require("google-auth-library");
var systemIpLogger = require(__base + "/utils/systemIpLogger.js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mime = require('mime-types');
const admin = require(__base + "/firebase/firebase.js");
const encryDecrypt = require(__base + "/utils/encryption.js");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function obj() {
  this.organizationRegister = async function (req) {
    let response = {};
    let validationRuleObj = {
      first_name: "required",
      last_name: "required",
      email: "email|required",
      password: "required",
      website: "required|string|maxLength:255",
      company_name: "required|string|maxLength:255",
      Address: "required",
      country: "required",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let user_details = await authDl.usersDetails(req.body.email);
      if (_.isEmpty(user_details)) {
        let result = await authDl.organizationRegister(req.body);
        if (!_.isEmpty(result)) {
          const company_prefix = req.body.company_name
            .slice(0, 3)
            .toUpperCase();
          req.body.org_id = result.res1.insertId;
          req.body.role_id = 2;
          const next_Employee_Id = await authDl.getNextEmployeeIdWithPrefix(
            req.body.org_id,
            company_prefix
          );
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(req.body.password, salt);
          req.body.password = hash;
          req.body["salt"] = salt;
          req.body.employee_id = next_Employee_Id;
          let register_res = await authDl.register(req.body);
          if (!_.isEmpty(register_res)) {
            response["status"] = "success";
            response["message"] = "Organization registered successfully.";
          } else {
            response["status"] = "error";
            response["message"] = "Something went wrong.";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Organization registration failed";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Email Already Exist.";
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

  this.getOtp = async function (req, res) {
    let response = {};
    let validationrule = {
      email: "required|email",
      companyname: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let organization_exist = await authDl.organizationExist(req.body);
      if (_.isEmpty(organization_exist)) {
        let user_details = await authDl.usersDetails(req.body.email);
        if (_.isEmpty(user_details)) {
          let otp_response = await self.generateOtp(req.body.email);
          return otp_response;
        } else {
          response["status"] = "error";
          response["message"] = "email already exist";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Organization Already registered.";
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

  this.verifyOtp = async function (data) {
    let validationObj = data;
    let validaionRuleObj = {
      email: "email|required",
      otp: "required",
    };

    let response = {};
    let isValid = await validations.validate(validationObj, validaionRuleObj);

    if (isValid) {
      let entries = await authDl.verifyOtp(data.email, data.otp);
      console.log(entries, "entries");

      if (!_.isEmpty(entries)) {
        // let otp_time = entries[0].time_stamp;
        // const current_time = Math.floor(new Date() / 1000);
        // const time_difference = current_time - otp_time;
        // let minutes = Math.floor(time_difference / 60);
        // console.log(time_difference, "time_difference");

        // console.log(minutes, "minuytes");

        // if (minutes < 10) {
        response["message"] = "Verified";
        response["status"] = "success";
      } else {
        response["status"] = "error";
        response["message"] = "Invalid otp";
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

  this.organizationRegisterWithGoogle = async function (req) {
    let response = {};
    let validationRuleObj = {
      first_name: "required",
      email: "email|required",
    };
    let validationObj = req;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      let userDetails = await authDl.usersDetails(req.email);
      if (_.isEmpty(userDetails)) {
        let organizationExist = await authDl.organizationExist(req);
        if (_.isEmpty(organizationExist)) {
          let result = await authDl.organizationRegisterWithGoogle(req);
          if (!_.isEmpty(result)) {
            const companyPrefix = req.company_name.slice(0, 3).toUpperCase();
            req.org_id = result.res1.insertId;
            req.role_id = 2;
            const nextEmployeeId = await authDl.getNextEmployeeIdWithPrefix(
              req.org_id,
              companyPrefix
            );
            req.employee_id = nextEmployeeId;
            let registerRes = await authDl.registerWithGoogle(req);
            if (!_.isEmpty(registerRes)) {
              response["status"] = "success";
              response["message"] = "Organization registered successfully.";
            } else {
              response["status"] = "error";
              response["message"] = "Something went wrong.";
            }
          } else {
            response["status"] = "error";
            response["message"] = "Organization registration failed";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Organization Already registered.";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Email Already Exist.";
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

  this.checkLogin = async function (req, res) {
    let response = {};

    // ---------------- GOOGLE LOGIN ----------------
    if (req.body.token) {
      let ticket = await client.verifyIdToken({
        idToken: req.body.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { email, name } = ticket.getPayload();
      let userRow = await authDl.usersDetails(email);
      const fullName = name ? name.trim().split(" ") : [""];
      const firstName = fullName[0] || "";
      const lastName = fullName.length > 1 ? fullName.slice(1).join(" ") : "";
      const companyname = email.includes("@")
        ? email.split("@")[1].split(".")[0]
        : "";

      if (_.isEmpty(userRow)) {
        // --- Register new Google user ---
        const newUser = {
          first_name: firstName,
          last_name: lastName ? lastName : "",
          email: email,
          company_name: companyname,
        };
        let registerWithgoogle = await self.organizationRegisterWithGoogle(newUser);
        if (registerWithgoogle.status === "success") {
          let goggleuserRow = await authDl.usersDetails(email);
          if (!_.isEmpty(goggleuserRow)) {
            response["status"] = "success";
            response["data"] = {
              user_id: goggleuserRow.id,
              email: goggleuserRow.email,
              user_name: goggleuserRow.username,
              org_id: goggleuserRow.org_id,
              role_id: goggleuserRow.role_id,
              accessmodule: await authDl.getAccessModule(goggleuserRow.role_id),
            };
            await authDl.checkIsActive(goggleuserRow.id, 1);
            response["message"] = registerWithgoogle.message;
          } else {
            response["status"] = "error";
            response["message"] = registerWithgoogle.message;
          }
        } else {
          response["status"] = "error";
          response["message"] = registerWithgoogle.message;
        }
      } else {
        // --- Existing Google user ---
        response["status"] = "success";
        response["data"] = {
          user_id: userRow.id,
          email: userRow.email,
          user_name: userRow.username,
          org_id: userRow.org_id,
          role_id: userRow.role_id,
          accessmodule: await authDl.getAccessModule(userRow.role_id),
        };
        response["message"] = "login success.";
      }

      //  Add refresh token generation for Google login
      if (response.status === "success" && response.data?.user_id) {
        const tokenPayload = {
          user_id: response.data.user_id,
          org_id: response.data.org_id,
          role_id: response.data.role_id,
          user_name: response.data.user_name,
        };

        const accessToken = jwt.sign(
          { data: tokenPayload },
          process.env.JWT_SECRET || "samlite",
          { expiresIn: "15m" }
        );

        const refreshToken = crypto.randomBytes(40).toString("hex");
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await authDl.saveRefreshToken(response.data.user_id, refreshToken, refreshTokenExpiry);

        response.data.access_token = accessToken;
        response.data.refresh_token = refreshToken;
      }
    }

    // ---------------- OTP LOGIN ----------------
    else if (req.body.email && req.body.otp) {
      let validationRuleObj = { email: "required", otp: "required" };
      let validationObj = req.body;
      let isValid = await validations.validate(validationObj, validationRuleObj);

      if (isValid) {
        const activ = await authDl.checkIsActiveUser(req.body.email);
        if (Array.isArray(activ) && activ.length > 0 && activ[0]?.is_active === 1) {
          let entries = await authDl.verifyOtp(req.body.email, req.body.otp);

          if (!_.isEmpty(entries) && entries.id > 0) {
            let userRow = await authDl.usersDetails(req.body.email);
            if (!_.isEmpty(userRow)) {
              let updateStatus = await authDl.updateAsUsed(entries.id);
              if (updateStatus && updateStatus.affectedRows > 0) {
                response["status"] = "success";
                response["data"] = {
                  user_id: userRow.id,
                  email: userRow.email,
                  user_name: userRow.username,
                  org_id: userRow.org_id,
                  role_id: userRow.role_id,
                  accessmodule: await authDl.getAccessModule(userRow.role_id),
                };
                response["message"] = "Login successful.";
                await authDl.checkIsActive(userRow.id, 1);
              } else {
                response["status"] = "error";
                response["message"] = "Something went wrong while updating OTP.";
              }
            } else {
              response["status"] = "error";
              response["message"] = "User not found.";
            }
          } else {
            response["status"] = "error";
            response["message"] = "Incorrect OTP.";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Your account is deactivated. Please contact admin.";
        }
      } else {
        response["errors"] = global.errorMessage;
        let key = Object.keys(global.errorMessage).length > 0
          ? Object.keys(global.errorMessage)[0]
          : null;
        response["message"] = global.errorMessage[key]
          ? global.errorMessage[key].message
          : "Something went wrong";
        response["status"] = "error";
      }

      //  Add refresh token generation for OTP login
      if (response.status === "success" && response.data?.user_id) {
        const tokenPayload = {
          user_id: response.data.user_id,
          org_id: response.data.org_id,
          role_id: response.data.role_id,
          user_name: response.data.user_name,
        };

        const accessToken = jwt.sign(
          { data: tokenPayload },
          process.env.JWT_SECRET || "samlite",
          { expiresIn: "15m" }
        );

        const refreshToken = crypto.randomBytes(40).toString("hex");
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await authDl.saveRefreshToken(response.data.user_id, refreshToken, refreshTokenExpiry);

        response.data.access_token = accessToken;
        response.data.refresh_token = refreshToken;
      }
    }

    // ---------------- NORMAL LOGIN ----------------
    else {
      let validationRuleObj = { email: "required", password: "required" };
      let validationObj = req.body;
      let isValid = await validations.validate(validationObj, validationRuleObj);

      if (isValid) {
        var pattern =
          /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
        if (pattern.test(req.body.email)) {
          let userRow = await authDl.usersDetails(req.body.email);
          const activ = await authDl.checkIsActiveUser(req.body.email);
          if (!_.isEmpty(activ)) {
            if (activ[0].is_active === 1) {
              if (!_.isEmpty(userRow)) {
                if (userRow.password) {
                  const hash = bcrypt.hashSync(req.body.password, userRow.salt);
                  if (hash === userRow.password) {
                    response["status"] = "success";
                    response["data"] = {
                      user_id: userRow.id,
                      email: userRow.email,
                      website: userRow.website,
                      user_name: userRow.username,
                      org_id: userRow.org_id,
                      role_id: userRow.role_id,
                      accessmodule: await authDl.getAccessModule(userRow.role_id),
                    };
                    response["message"] = "login success.";
                    var loginAlertUser = await systemIpLogger.getSystemIp();
                    if (loginAlertUser) {
                      var ipUsers = await authDl.uploadUsersIp(loginAlertUser, userRow.id);
                      if (ipUsers.new) {
                        await self.loginAlertFeature(userRow.email, userRow.username);
                      }
                    }
                    await authDl.checkIsActive(userRow.id, 1);
                  } else {
                    response["status"] = "error";
                    response["message"] = "Email or Password wrong.";
                  }
                } else {
                  response["status"] = "error";
                  response["message"] =
                    "You have registered with Google. Please log in using Google.";
                }
              } else {
                response["status"] = "error";
                response["message"] = "Email or Password wrong.";
              }
            } else {
              response["status"] = "error";
              response["message"] = "Your account is deactivated";
            }
          } else {
            response["status"] = "error";
            response["message"] = "Invalid email or password. Please try again.";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Invalid email or password. Please try again.";
        }
      } else {
        response["errors"] = global.errorMessage;
        let key = Object.keys(global.errorMessage).length > 0
          ? Object.keys(global.errorMessage)[0]
          : null;
        response["message"] = global.errorMessage[key]
          ? global.errorMessage[key].message
          : "Something went wrong";
        response["status"] = "error";
      }

      //  Add refresh token generation for normal login
      if (response.status === "success" && response.data?.user_id) {
        const tokenPayload = {
          user_id: response.data.user_id,
          org_id: response.data.org_id,
          role_id: response.data.role_id,
          user_name: response.data.user_name,
        };

        const accessToken = jwt.sign(
          { data: tokenPayload },
          process.env.JWT_SECRET || "samlite",
          { expiresIn: "15m" }
        );

        const refreshToken = crypto.randomBytes(40).toString("hex");
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await authDl.saveRefreshToken(response.data.user_id, refreshToken, refreshTokenExpiry);

        response.data.access_token = accessToken;
        response.data.refresh_token = refreshToken;
      }
    }

    return response;
  };

  this.getOtpForgotPassword = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      email: "required|email",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    if (isValid) {
      // let userRow = await authDl.usersDetails(req.body.email);
      // if (!_.isEmpty(userRow)) {
      //   let otpRes = await self.generateOtp(req.body.email);
      //   return otpRes;
      let user_row = await authDl.usersDetails(req.body.email);
      if (!_.isEmpty(user_row)) {
        let otp_res = await self.generateOtp(req.body.email);
        console.log(otp_res, "response");
        if (otp_res.status === "success") {
          response["status"] = "success";
          response["message"] = "Otp sent successfully";
        }
      } else {
        response["status"] = "error";
        response["message"] =
          "Email not registered, Please register the Organization";
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

  this.updatePassword = async function (data) {
    let validationObj = data;
    let validaionRuleObj = {
      email: "required",
      password: "required",
    };
    let response = {};
    let isValid = await validations.validate(validationObj, validaionRuleObj);
    if (isValid) {
      var userDetails = await authDl.usersDetails(data.email);
      var salt = userDetails.salt;
      let encrypted_password = await self.hashPassword(data.password, salt);
      let update_res = await authDl.updatePassword(
        encrypted_password,
        userDetails.id,
        salt
      );
      if (update_res.affectedRows > 0) {
        response["status"] = "success";
        response["message"] = "Password Updated Successfully";
      } else {
        response["status"] = "error";
        response["message"] = "Error while Updating New Password";
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

  this.organizationUsers = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);

    let response = {};
    let users = await authDl.listorganizationUsers(user_details);
    if (!_.isEmpty(users)) {
      response["status"] = "success";
      response["data"] = users;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

  this.createUser = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      first_name: "required|maxLength:255",
      last_name: "required|maxLength:255",
      email: "email",
      password: "required|string|maxLength:255",
      role_id: "required|maxLength:255",
      designationId: "required",
      subdepartmentId: "required",
      departmentId: "required",
      designation: "required",
    };

    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      req.body.org_id = user_details.org_id;
      let orgData = await authDl.getorganizationDataById(req.body);
      req.body.website = orgData[0].company_website;

      const company_prefix = orgData[0].org_name.slice(0, 3).toUpperCase();
      let is_Valid_Email_Format = true;

      if (req.body.designation !== "Intern") {
        is_Valid_Email_Format = await validations.emailIncludesWebsite(
          req.body.email,
          req.body.website
        );
      }

      if (is_Valid_Email_Format) {
        let userData = await authDl.usersDetails(req.body.email);
        if (_.isEmpty(userData)) {
          const next_Employee_Id = await authDl.getNextEmployeeIdWithPrefix(
            req.body.org_id,
            company_prefix
          );
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(req.body.password, salt);

          req.body.password = hash;
          req.body.salt = salt;
          req.body.employee_id = next_Employee_Id;

          let register_res = await authDl.register(req.body);

          if (!_.isEmpty(register_res)) {
            response["status"] = "success";
            response["message"] = "User created Successfully.";

            // Check date_of_joining and send email if today
            const doj = new Date(req.body.date_of_joining);
            const today = new Date();

            if (
              doj.getFullYear() === today.getFullYear() &&
              doj.getMonth() === today.getMonth() &&
              doj.getDate() === today.getDate()
            ) {
              const subject =
                "Welcome to SAM – Your Account Has Been Successfully Created";

              const message = `
              <p>Dear <b>${req.body.first_name}</b>,</p>
              <p>Welcome to SAM! 🎉</p>
              <p>We are pleased to inform you that your account on SAM has been successfully created. 
              You may now log in using your registered email address, and you’re all set to get started.</p>
              <p>👉 <a href="https://sam.nubaxdatalabs.com">Login here</a> using your registered email ID: <b>${req.body.email}</b></p>
              <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
              <p>We’re excited to have you on board and look forward to supporting your journey with SAM.</p>
              <p>Sincerely,<br/>The SAM Team</p>
            `;

              await emailUtils.sendEmail(req.body.email, subject, message);
            }
          } else {
            response["status"] = "error";
            response["message"] = "Something went wrong.";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Email Already Exist.";
        }
      } else {
        response["status"] = "error";
        response["message"] =
          "Email should include the domain name of the organization.";
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

  this.getProfileDetails = async function (req, res) {
    let response = {};
    let validationrule = {};
    let validationObj = req.body;
    let user_id = req.params.user_id;
    let is_valid = await validations.validate(validationObj, validationrule);
    if (is_valid) {
      let profile_details = await authDl.getProfileDetails(user_id);
      if (!_.isEmpty(profile_details)) {
        response["status"] = "success";
        response["data"] = profile_details;
      } else {
        response["status"] = "error";
        response["message"] = "User not found";
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

  // this.updateProfileDetails = async function (req, res) {
  //   let user_details = authDl.getDecryptToken(req);
  //   let response = {};
  //   user_id = req.body.user_id || 207 ;
  //   org_id = user_details.org_id;
  //   data = { user_id, org_id };
  //   if (req.body.isIdChanged === true) {
  //     let check_employee_id = await authDl.checkEmployeeId(req.body, org_id);
  //     if (_.isEmpty(check_employee_id)) {
  //       let update_result = await authDl.updateUserData(req.body, data);
  //       if (!_.isEmpty(update_result)) {
  //         response["status"] = "success";
  //         response["message"] = "Information saved successfully";
  //       } else {
  //         response["status"] = "error";
  //         response["message"] = "Something went wrong while updating.";
  //       }
  //     } else {
  //       response["status"] = "error";
  //       response["message"] = "Employee Id already exist";
  //     }
  //   } else {
  //     let update_result = await authDl.updateUserData(req.body, data);
  //     if (!_.isEmpty(update_result)) {
  //       response["status"] = "success";
  //       response["message"] = "Information saved successfully";
  //     } else {
  //       response["status"] = "error";
  //       response["message"] = "Something went wrong while updating.";
  //     }
  //   }
  //   return response;
  // };

  this.updateProfileDetails = async function (req, res) {
    let response = {};

    let validationRuleObj = {
      user_id: "required",
    };

    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      let user_id = req.body.user_id;
      let org_id = user_details.org_id;

      // data object passed to DL
      let data = { user_id, org_id };

      // fetch existing data before update

      let existingData = await authDl.getUserProfileExistingData(user_id, org_id)

      // Call DL update function
      let updated = await authDl.updateUserData(req.body, data);
      console.log(updated, "updated")
      console.log(req.body, "req Body")
      console.log(data, "data")

      if (updated) {
        await authDl.updateProfileAuditLogs(existingData,  req.body, data, user_details)
        response["status"] = "success";
        response["message"] = "Information saved successfully";
      } else if (updated === "No fields to update in Information") {
        response["status"] = "error";
        response["message"] = "No valid fields provided for update";
      } else {
        response["status"] = "error";
        response["message"] = "Something went wrong while updating Information";
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





  this.saveImage = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let user_id = req.body["id"] || user_details.user_id;
    let response = {};
    let data = { org_id, user_id };
    let image_url = await mysqlDao.storeDataToGCP(data, req);
    if (!_.isEmpty(image_url)) {
      let image_data = { image_url, user_id, org_id };
      let update_image = await authDl.imageUpdate(image_data);
      if (!_.isEmpty(update_image)) {
        response["status"] = "success";
        response["message"] = "Image uploaded successfully";
      } else {
        response["status"] = "error";
        response["message"] = "failed to upload image";
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

  this.getImage = async function (req, res) {
    let response = {};
    let validationrule = {
      user_id: "required",
    };
    let validationObj = req.params;
    let user_id = req.params.user_id;
    let isvalid = await validations.validate(validationObj, validationrule);
    if (isvalid) {
      let profile_image = await authDl.getImage(user_id);
      if (!_.isEmpty(profile_image)) {
        response["status"] = "success";
        response["data"] = profile_image;
      } else {
        response["status"] = "error";
        response["message"] = "User not found";
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

  // this.uploadDocuments = async function (req, res) {
  //   let user_details = await authDl.getDecryptToken(req);
  //   let org_id = user_details.org_id;
  //   let user_id = req.body.id;
  //   let uploadedId = req.body.user_id;
  //   let response = {};
  //   const Docname = req.file.originalname;
  //   const Docbuffer = req.file.buffer;
  //   const filetype = req.body.idType;
  //   const ID = req.body.idValue;

  //   let data = {
  //     org_id,
  //     user_id,
  //     Docname,
  //     Docbuffer,
  //     filetype,
  //     ID,
  //     uploadedId,
  //   };
  //   let Docsupload = await authDl.uploadDocuments(data);
  //   if (!_.isEmpty(Docsupload)) {
  //     response["status"] = "success";
  //     response["message"] = "Uploaded successfully";
  //   } else {
  //     response["status"] = "error";
  //     response["status"] = "File was not uploaded";
  //   }
  //   return response;
  // };

  this.uploadDocuments = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let user_id = req.body.id;
    let uploadedId = req.body.user_id;
    let response = {};

    const Docname = req.file.originalname;
    const filetype = req.body.idType;
    const ID = req.body.idValue;

    console.log("data ", req.body)
    console.log("filr------------------", req.file)
    // Upload file to GCP and get public URL
    const fileUrl = await mysqlDao.storeDocumentToGCP(
      { org_id, user_id, filetype },
      req.file
    );

    let data = {
      org_id,
      user_id,
      Docname,
      fileUrl,
      filetype,
      ID,
      uploadedId,
    };

    let Docsupload = await authDl.uploadDocuments(data);

    if (!_.isEmpty(Docsupload)) {
      response["status"] = "success";
      response["message"] = "Uploaded successfully";
    } else {
      response["status"] = "error";
      response["message"] = "File was not uploaded";
    }

    return response;
  };

  // this.deleteDocuments = async function (req, res) {
  //   let response = {};
  //   let validationrule = {
  //     id: "required",
  //   };
  //   let validationObj = req.query;
  //   let isvalid = await validations.validate(validationObj, validationrule);
  //   if (isvalid) {
  //     let user_details = await authDl.getDecryptToken(req);
  //     org_id = user_details.org_id;
  //     document_Id = req.query.id;
  //     data = { org_id, document_Id };
  //     let result = await authDl.deleteDocuments(data);
  //     if (!_.isEmpty(result) && result.affectedRows > 0) {
  //       response["status"] = "success";
  //       response["message"] = "Document deleted successfully.";
  //     } else {
  //       response["status"] = "error";
  //       response["message"] = "Failed to delete document";
  //     }
  //   } else {
  //     response["errors"] = global.errorMessage;
  //     let key =
  //       Object.keys(global.errorMessage).length > 0
  //         ? Object.keys(global.errorMessage)[0]
  //         : null;
  //     response["message"] = global.errorMessage[key]
  //       ? global.errorMessage[key].message
  //       : "Something went wrong";
  //     response["status"] = "error";
  //   }
  //   return response;
  // };

  this.deleteDocuments = async function (req, res) {
    let response = {};
    let validationrule = {
      id: "required",
    };
    let validationObj = req.query;
    let isvalid = await validations.validate(validationObj, validationrule);

    if (isvalid) {
      let user_details = await authDl.getDecryptToken(req);
      let org_id = user_details.org_id;
      let document_Id = req.query.id;
      let data = { org_id, document_Id };

      let docBody = await authDl.getDocumentById(document_Id);
      if (!_.isEmpty(docBody)) {
        await mysqlDao.deleteDocumentFromGCP(docBody[0].path);

        let result = await authDl.deleteDocuments(data);

        if (!_.isEmpty(result) && result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Document deleted successfully.";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to delete document.";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Document not found.";
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

  this.getDocuments = async function (req, res) {
    let response = {};
    let validationrule = {
      user_id: "required",
    };
    let validationObj = req.params;
    let isvalid = await validations.validate(validationObj, validationrule);
    if (isvalid) {
      let user_id = req.params.user_id;
      let get_documents = await authDl.getDocuments(user_id);
      if (!_.isEmpty(get_documents)) {
        response["status"] = "success";
        response["data"] = get_documents;
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

  this.getDocumentsForAdmin = async function (req, res) {
    let response = {};
    let validationrule = {
      user_id: "required",
    };
    let validationObj = req.params;
    let isvalid = await validations.validate(validationObj, validationrule);
    if (isvalid) {
      let user_details = await authDl.getDecryptToken(req);
      if (user_details.role_id < 3) {
        let user_id = req.params.user_id;
        let get_documents = await authDl.getDocuments(user_id);
        if (!_.isEmpty(get_documents)) {
          response["status"] = "success";
          response["data"] = get_documents;
        } else {
          response["status"] = "error";
          response["message"] = "No data found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Not authorized";
      }
    } else {
      response["errors"] = global.errorMessage;
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

  this.generateOtp = async function (email) {
    let res = {};
    let new_otp = await self.newOtp();

    let new_otp_res = await authDl.generateOtp(email, new_otp);
    if (new_otp_res && new_otp_res.insertId > 0) {
      let subject = "Password Assistance – SAM Lite";
      let message = `
                <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
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
            .otp-code {
                display: inline-block;
                background-color: #075dce;
                color: #ffffff;
                padding: 10px 20px;
                font-size: 24px;
                letter-spacing: 4px;
                border-radius: 4px;
                margin: 20px 0;
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
           
            <div class="content">
                <h1>Your OTP Code</h1>
                <p>Use the code below to complete your authentication process. This code is valid for the next 10 minutes.</p>
                 <div class="otp-code">${new_otp}</div>
                <p>If you did not request this code, please ignore this email.</p>
            </div>
            <div class="footer">
                &copy; 2024 Nubax Data Labs. All rights reserved.<br>
                3rd Cross, Bhagyanagar, Belgavi, India - 590006
            </div>
        </div>
    </body>
    </html>`;
      await emailUtils.sendEmail(email, subject, message);
      res["message"] = "Otp sent to email ";
      res["status"] = "success";
    } else {
      res["message"] = "Something Went Wrong";
      res["status"] = "error";
    }
    return res;
  };

  this.newOtp = function () {
    var digits = "123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * digits.length)];
    }
    return OTP;
  };

  this.hashPassword = async function (password, salt) {
    const hash = await bcrypt.hash(password, salt);
    return hash;
  };

  this.listOrganization = async function (req, res) {
    let response = {};
    let results = await authDl.listOrganization(req);
    if (!_.isEmpty(results)) {
      response["status"] = "success";
      response["data"] = results;
    } else {
      response["status"] = "error";
      response["message"] = "No data found";
    }
    return response;
  };

  this.updateOrganization = async function (req, res) {
    console.log(req, "req");
    let response = {};
    let validationrule = {
      id: "required",
      updatedOrgName: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let results = await authDl.updateOrganization(req.body);
      if (!_.isEmpty(results)) {
        response["status"] = "success";
        response["message"] = "Updated  organization successfully";
      } else {
        response["status"] = "error";
        response["message"] = "Failed to update organization";
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

  this.deleteOrganization = async function (req, res) {
    let response = {};
    let validationrule = {
      Id: "required",
    };
    let validationobj = req.query;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let deleteorganization = await authDl.deleteOrganization(req.query.Id);
      if (!_.isEmpty(deleteorganization)) {
        response["status"] = "success";
        response["message"] = "Organization deleted successfully";
      } else {
        response["status"] = "error";
        response["message"] = "Failed to delete organization";
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

  this.verifyDocument = async function (req, res) {
    let response = {};
    let validationrule = {
      docid: "required",
      id: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let doc_res = await authDl.verifyDocument(req.body);
      if (!_.isEmpty(doc_res)) {
        response["status"] = "success";
        response["message"] = "Document verified successfully";
      } else {
        response["status"] = "error";
        response["message"] = "failed to verify document";
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

  this.loginAlertFeature = async function (email, username) {
    console.log("email", email, "username", username);
    let res = {};
    if (email) {
      let subject = "Login from new device";
      let message = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SΛM LĪTΞ Login From A New Device</title>
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
              border-radius: 10px;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding: 20px 0;
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
              font-size: 24px;
          }
          .content p {
              color: #666666;
              font-size: 16px;
              line-height: 1.5;
          }
          .reset-link {
              display: inline-block;
              background-color: #d32f2f;
              color: #ffffff !important;;
              padding: 12px 24px;
              font-size: 16px;
              font-weight: bold;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              transition: background-color 0.3s ease;
          }
          .reset-link:hover {
              background-color: #b71c1c;
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
          <div class="content">
              <h1>Login From A New Device</h1>
              <p>Hi ${username},</p>
              <p>We noticed a login to your SAM LITE account from a new device. If this was you, please disregard the rest of this email.</p>
              <br />
              <p>If this wasn't you, please reset your password as your security is one of our highest priorities.</p>
              <br />
              <a href='${process.env.REACT_APP_API_URL}login/forgotpassword' class="reset-link">Reset My Password</a>
          </div>
          <div class="footer">
              &copy; 2024 Nubax Data Labs. All rights reserved.<br>
              3rd Cross, Bhagyanagar, Belgavi, India - 590006
          </div>
      </div>
  </body>
  </html>`;
      await emailUtils.sendEmail(email, subject, message);
    } else {
      res["message"] = "Something Went Wrong";
      res["status"] = "error";
      return res;
    }
    return res;
  };

  this.logoutUser = async function (req) {
    let response = {};
    let user_details = authDl.getDecryptToken(req);
    let user_data = await authDl.usersDetails(user_details.email);
    // console.log(user_data, "user_data");
    // console.log(user_details, "user_details");
    if (!_.isEmpty(user_data)) {
      // Delete all refresh tokens for this user (logout from all devices)
      await authDl.deleteAllUserRefreshTokens(user_data.id);

      // if (user_data.attempt === 1) {
      // await authDl.checkIsActive(user_data.id, 0);
      response["status"] = "success";
      response["message"] = "Logged out successfully";
      // } else {
      //   response["status"] = "error";
      //   response["message"] = "User is Not Login";
      // }
    } else {
      response["status"] = "error";
      response["message"] = "User not found";
    }
    return response;
  };

  this.getUsersDetails = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);
    let email = user_details.email;
    let response = {};
    let user_data = await authDl.usersDetails(email);
    if (!_.isEmpty(user_data)) {
      response["status"] = "success";
      response["data"] = user_data;
    } else {
      response["status"] = "error";
      response["message"] = "user not found";
    }
    return response;
  };

  this.getOtpForEmail = async function (req, res) {
    let response = {};

    // Validate only email
    let validationRule = {
      email: "required|email",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRule);

    if (isValid) {
      // Check if the email exists in users table
      let emailExist = await authDl.usersDetails(req.body.email);
      if (_.isEmpty(emailExist)) {
        response["status"] = "error";
        response["message"] = "Email not found.";
        return response;
      }

      // Check if the organization exists based on email
      let organizationExist = await authDl.organizationExist({
        email: req.body.email,
      });
      if (!_.isEmpty(organizationExist)) {
        // Both email & organization exist → Send OTP
        let otpResponse = await self.generateOtp(req.body.email);
        response["status"] = "success";
        response["message"] = "Otp sent successfully";
        return otpResponse;
      } else {
        // Organization does not exist → Return error
        response["status"] = "error";
        response["message"] = "No organization found for this email.";
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

  this.updateUserStatus = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);

    let validationRule = {
      user_id: "required",
      Is_Active: "required|in:0,1", // 0 = inactive, 1 = active
      org_id: "required",
    };

    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRule);
    if (isValid) {
      // Prevent user from deactivating their own account
      if (
        user_details.user_id === req.body.user_id &&
        req.body.Is_Active === 0
      ) {
        response["status"] = "error";
        response["message"] =
          "You are not allowed to deactivate your own account.";
      } else {
        let updateStatus = await authDl.updateUserStatus(req.body);

        if (updateStatus.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "User status updated successfully.";
        } else {
          response["status"] = "error";
          response["message"] =
            "Failed to update user status. Please try again.";
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
        : "Validation failed. Please check the input fields.";
      response["status"] = "error";
    }

    return response;
  };

  this.deleteUser = async function (req, res) {
    let response = {};
    let validationrule = {
      userIds: "required",
    };

    let user_details = await authDl.getDecryptToken(req);
    let validationObj = req.body;
    let isvalid = await validations.validate(validationObj, validationrule);

    if (isvalid) {
      let userIds = req.body.userIds;

      // Ensure userIds is a flat array of numbers
      if (Array.isArray(userIds)) {
        userIds = userIds.flat().map((id) => Number(id));
      } else {
        userIds = [Number(userIds)];
      }

      // Prevent deleting own account
      if (userIds.includes(Number(user_details.user_id))) {
        response["status"] = "error";
        response["message"] = "You are not allowed to delete your own account.";
        return response;
      } else {
        let results = await authDl.deleteUser({ userIds });
        if (results.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "User deleted successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to delete user";
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

  this.getOrganizationUserDetailsById = async function (req) {
    let user_details = await authDl.getDecryptToken(req);

    let response = {};
    let org_id = user_details.org_id;
    let user_Id = req.params.userId;
    let data = { org_id, user_Id };
    let user = await authDl.getOrganizationUserDetailsById(data);

    if (!_.isEmpty(user)) {
      response["status"] = "success";
      response["data"] = user;
    } else {
      response["status"] = "error";
      response["message"] = "User not found";
    }

    return response;
  };

  this.editUser = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      user_id: "required|integer",
      first_name: "required|maxLength:255",
      last_name: "required|maxLength:255",
      email: "required|email",
      role_id: "required|integer",
      designationId: "required",
      departmentId: "required",
      subdepartmentId: "required",
      designation: "required",
    };

    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let loggedInUser = authDl.getDecryptToken(req);
      let targetUserId = req.body.user_id;

      // only Superadmin (1) and Admin (2) can edit
      if (loggedInUser.role_id !== 1 && loggedInUser.role_id !== 2) {
        return { status: "error", message: "Not Authorized" };
      }
      // Get org data for email validation
      let orgData = await authDl.getorganizationDataById(loggedInUser);
      console.log(orgData, "orgData");
      req.body.website = orgData[0].company_website;

      let is_Valid_Email_Format = true;

      // Skip emailIncludesWebsite validation if designation is "Intern"
      if (req.body.designation !== "Intern") {
        is_Valid_Email_Format = await validations.emailIncludesWebsite(
          req.body.email,
          req.body.website
        );
      }

      if (!is_Valid_Email_Format) {
        return {
          status: "error",
          message: "Email should include the domain name of the organization.",
        };
      }

      // Get target user
      let targetUser = await authDl.getUserById(targetUserId);
      if (_.isEmpty(targetUser)) {
        return { status: "error", message: "User not found" };
      }

      // Restriction: Admin cannot change their own role (either downgrade or upgrade)
      if (
        loggedInUser.role_id === 2 &&
        loggedInUser.user_id == targetUserId && // editing self
        req.body.role_id != 2 // trying to set role other than Admin
      ) {
        return {
          status: "error",
          message: "Admin cannot change their own role.",
        };
      }

      // Check email uniqueness
      let existingUser = await authDl.usersDetails(req.body.email);
      if (!_.isEmpty(existingUser) && existingUser.id != targetUserId) {
        return { status: "error", message: "Email Already Exist." };
      }

      // Update sam_users
      let updateRes = await authDl.updateUserDetails(req.body, targetUserId);

      // Update sam_personal_details
      await authDl.updatePersonalDetails(
        req.body,
        targetUserId,
        loggedInUser.org_id
      );

      if (updateRes.affectedRows > 0) {
        response["status"] = "success";
        response["message"] = "User updated successfully.";
      } else {
        response["status"] = "error";
        response["message"] = "Update failed.";
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

  this.getActiveDirectoryUsers = async function (req, res) {
    let user_details = await authDl.getDecryptToken(req);

    let response = {};
    let users = await authDl.listActiveDirectoryUsers(user_details);

    if (!_.isEmpty(users)) {
      response["status"] = "success";
      response["data"] = users;
    } else {
      response["status"] = "error";
      response["message"] = "No active users found in directory";
    }

    return response;
  };

  this.getFeatures = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id === 1) {
      let get_features = await authDl.getFeatures();
      if (!_.isEmpty(get_features)) {
        response["status"] = "success";
        response["data"] = get_features;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not authorized";
    }
    return response;
  };

  this.addFeature = async function (req, res) {
    let response = {};
    let validationrule = {
      feature_name: "required",
      description: "required"
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);
      req.body.org_id = user_details.org_id;
      if (user_details.role_id === 1) {
        let result = await authDl.addFeature(req.body);
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Feature Added Successfully";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to add Feature";
        }
      } else {
        response["status"] = "error";
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

  this.assignFeature = async function (req, res) {
    let response = {};
    let validationrule = {
      features: "required",
      org_id: "required"
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = await authDl.getDecryptToken(req);

      if (user_details.role_id === 1) {
        let get_features = await authDl.getExistingFeatures(req.body);
        if (_.isEmpty(get_features)) {
          let result = await authDl.assignFeature(req.body);
          if (result.affectedRows > 0) {
            response["status"] = "success";
            response["message"] = "Feature Assigned Successfully";
          } else {
            response["status"] = "error";
            response["message"] = "Failed to Assign Feature";
          }
        } else {
          response["status"] = "error";
          response["message"] = "Organization Already Assigned";
        }
      } else {
        response["status"] = "error";
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

  this.getAssignedFeatureOrg = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    if (user_details.role_id === 1) {
      let getfeatures = await authDl.getAssignedFeatureOrg();
      if (!_.isEmpty(getfeatures)) {
        response["status"] = "success";
        response["data"] = getfeatures;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    } else {
      response["status"] = "error";
      response["message"] = "Not authorized";
    }
    return response;
  };

  this.deleteFeature = async function (req, res) {
    let response = {};
    let validationrule = {
      feature_id: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      if (user_details.role_id === 1) {
        let result = await authDl.deleteFeature(req.body);
        if (
          result.details_deleted.affectedRows > 0 ||
          result.feature_deleted.affectedRows > 0
        ) {
          response["status"] = "success";
          response["message"] = "Feature Deleted Successfully ";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Delete Feature";
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

  this.deleteAssignedFeature = async function (req, res) {
    let response = {};
    let validationrule = {
      org_id: "required",
      feature_id: "required",
    };
    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);
    if (isValid) {
      let user_details = authDl.getDecryptToken(req);
      if (user_details.role_id === 1) {
        let result = await authDl.deleteAssignedFeature(req.body);
        if (result.affectedRows > 0) {
          response["status"] = "success";
          response["message"] = "Assigned organization removed successfully ";
        } else {
          response["status"] = "error";
          response["message"] = "Failed to Delete Assigned Organization";
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

  // Refresh token api start
  this.refreshTokenRotation = async function (req, res) {
    let response = {};
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        return { status: "error", message: "Missing refresh token." };
      }

      const storedToken = await authDl.getRefreshToken(refresh_token);
      if (_.isEmpty(storedToken)) {
        return { status: "error", message: "Invalid refresh token." };
      }

      if (new Date(storedToken.expires_at) < new Date()) {
        await authDl.deleteRefreshToken(refresh_token);
        return { status: "error", message: "Refresh token expired." };
      }

      const userRow = await authDl.usersDetailsById(storedToken.user_id);
      if (_.isEmpty(userRow)) {
        return { status: "error", message: "User not found." };
      }

      // create new access and refresh tokens
      const payload = {
        user_id: userRow.id,
        org_id: userRow.org_id,
        role_id: userRow.role_id,
        user_name: userRow.username,
      };

      const newAccessToken = jwt.sign(
        { data: payload },
        process.env.JWT_SECRET || "samlite",
        { expiresIn: "24h" } //24h
      );

      const newRefreshToken = crypto.randomBytes(40).toString("hex");
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); //7 days
      // const newExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute


      await authDl.deleteRefreshToken(refresh_token);
      await authDl.saveRefreshToken(userRow.id, newRefreshToken, newExpiry);

      response.status = "success";
      response.data = {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
      response.message = "Token refreshed successfully.";
    } catch (err) {
      console.error(err);
      response.status = "error";
      response.message = "Something went wrong while refreshing token.";
    }
    return response;
  };
  // Refresh token api end


  //insert or adding eduction
  this.addEducation = async function (req) {
    let response = {};
    let validationRuleObj = {
      user_id: "required|integer",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (!isValid) {
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

    let user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    let orgData = await authDl.getorganizationDataById(user_details)
    let orgName = orgData[0].org_name
    let user_id = req.body.user_id;

    let data = { user_id, org_id }

    let Docname = null;
    let file = null;

    if (!_.isEmpty(req.file)) {
      Docname = req.file.originalname.split(".")[0];
      const fileUrl = await mysqlDao.storeEductionDocumentToGCP(
        { org_id, user_id, Docname, orgName },
        req.file
      );
      file = await encryDecrypt.encrypt(fileUrl);
    }

    const obj = {
      education_level: req.body.education_level,
      degree_name: req.body.degree_name,
      field_of_study: req.body.field_of_study,
      institute: req.body.institute,
      university_name: req.body.university_name,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      grade: req.body.grade,
      country: req.body.country,
      mode_of_study: req.body.mode_of_study,
      status: req.body.status,
      remarks: req.body.remarks,
      Docname,
      attachment_url: file,
    };


    const userEducations = await authDl.getEductionById(user_id);
    const educations = Array.isArray(userEducations) ? userEducations : [];
    const isDuplicate = educations.some(
      e => e.education_level.toLowerCase() === req.body.education_level.toLowerCase()
    );

    if (isDuplicate) {
      return { status: "error", message: "Education level already exists." };
    }
    let existingData = await authDl.getExistingEducationData(user_id)
    
    const education = await authDl.addEduction(user_id, obj);

    if (!_.isEmpty(education)) {
      await authDl.updateProfileAuditLogs(existingData, obj, data, user_details, "INSERT")
      response["status"] = "success";
      response["message"] = "Education added successfully";
      response["data"] = education;
    } else {
      response["status"] = "error";
      response["message"] = "Failed to add education";
    }

    return response;
  };



  // get Eduction By Id
  this.getEductionById = async function (req, res) {
    // let user_details = await authDl.getDecryptToken(req);
    let response = {};
    let validationRuleObj = {
      user_id: "required|integer"
    };
    let validationObj = req.params;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_id = req.params.user_id;
      let education = await authDl.getEductionById(user_id);

      if (!Array.isArray(education)) {
        education = education ? [education] : []; // convert single object or null to array
      }
      const sortedByEndDate = education.sort(
        (a, b) => new Date(b.end_date) - new Date(a.end_date)
      );

      if (!_.isEmpty(education)) {
        response["status"] = "success";
        response["data"] = sortedByEndDate;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    }
    else {
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
  }

  //download education attachment using education id 
  this.downloadEducationFileBL = async function (req) {
    const response = {};

    // Validate input
    const validationRuleObj = {
      education_id: "required|integer"
    };
    const validationObj = req.params;
    const isValid = await validations.validate(validationObj, validationRuleObj);

    if (!isValid) {
      response.status = "error";
      response.message = global.errorMessage
        ? Object.values(global.errorMessage)[0].message
        : "Invalid request";
      return response;
    }

    const education_id = req.params.education_id;

    // Fetch file from data layer
    const fileData = await authDl.downloadEductionAttachment(education_id);
    const decryptedAttachmentUrl = await encryDecrypt.decrypt(fileData.attachment_url)
    fileData.attachment_url = decryptedAttachmentUrl;

    if (_.isEmpty(fileData)) {
      return { status: "error", message: "File not found" };
    }

    // Return structured response for controller
    response.status = "success";
    response.message = "Document found."
    response.data = fileData


    return response;
  };


  // delete eduction by user_id with eduction id
  this.deleteEductionById = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      user_id: "required"
    };
    let validationObj = req.query;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let obj = req.query;
      let docBody = await authDl.checkDocument(obj);


      if (!_.isEmpty(docBody)) {
        const url = await encryDecrypt.decrypt(docBody.attachment_url);
        await mysqlDao.deleteDocumentFromGCP(url);
        let deleteEduction = await authDl.deleteEductionById(obj);
        if (!_.isEmpty(deleteEduction)) {
          response["status"] = "success";
          response["data"] = deleteEduction;
        } else {
          response["status"] = "error";
          response["message"] = "Not deleted data found";
        }
      } else {
        response["status"] = "error";
        response["message"] = "Document not found.";
      }
    }
    else {
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
  }


  //updated eduction details
  this.updateEducationDetails = async function (req, res) {
    let response = {};

    let validationRuleObj = {
      user_id: "required|integer",
      education_id: "required|integer",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_id = req.body.user_id;
      let user_details = await authDl.getDecryptToken(req);
      let education_id = req.body.education_id
      let org_id = user_details.org_id;
      let orgData = await authDl.getorganizationDataById(user_details)
      let orgName = orgData[0].org_name

      let Docname = null;
      let file = null;

      if (req.file && !_.isEmpty(req.file)) {
        const obj = req.body
        let docBody = await authDl.checkDocument(obj);
        if (docBody?.attachment_url) {
          const url = await encryDecrypt.decrypt(docBody.attachment_url);
          await mysqlDao.deleteDocumentFromGCP(url);
        }
        Docname = req.file.originalname.split(".")[0];
        const fileUrl = await mysqlDao.storeEductionDocumentToGCP(
          { org_id, user_id, Docname, orgName},
          req.file
        );
        file = await encryDecrypt.encrypt(fileUrl);
      }

      // Build update object with file data if provided
      let updateData = { ...req.body };
      if (Docname) {
        updateData.Docname = Docname;
      }
      if (file) {
        updateData.attachment_url = file;
      }

      let data = { user_id, education_id, org_id };
      // Call DL update function
      let existingData = await authDl.getExistingEducationData(data)
      let update_result = await authDl.updateEducationData(updateData, data);
      if (update_result && update_result.affectedRows > 0) {
        await authDl.updateProfileAuditLogs(existingData, req.body, data, user_details)
        response["status"] = "success";
        response["message"] = "Education details updated successfully";
      } else if (update_result === "No fields to update in sam_users_education") {
        response["status"] = "error";
        response["message"] = "No valid fields provided for update";
      } else {
        response["status"] = "error";
        response["message"] = "Something went wrong while updating education details";
      }
    }
    else {
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


  //insert or adding Family Emergency Contact
  this.addEmergencyContact = async function (req) {
    let response = {};

    try {
      let validationRuleObj = {
        user_id: "required|integer",
      };
      let validationObj = req.body;
      let isValid = await validations.validate(validationObj, validationRuleObj);

      if (isValid) {
        const user_details = await authDl.getDecryptToken(req);
        const { full_name, primary_contact_number, email_address } = req.body;
        let user_id = req.body.user_id;
        let org_id = user_details.org_id;

        let data = { user_id, org_id }

        // Check if number matches the personal number
        const personalNumber = await authDl.checkNumber(user_id);
        if (personalNumber && personalNumber.phone_number === primary_contact_number) {
          response["status"] = "error";
          response["message"] =
            "Failed to add emergency contact because that number is already used as the personal number.";
          return response;
        }

        // Check for duplicate name or number
        const checkName = await authDl.checkName(user_id);
        if (
          checkName &&
          (checkName.primary_contact_number === primary_contact_number ||
            checkName.full_name === full_name)
        ) {
          response["status"] = "error";
          response["message"] =
            "Failed to add emergency contact because the name or primary contact number is already used.";
          return response;
        }

        // Contact number validation
        const isValidPhoneNumber = (number) => /^\d{10,15}$/.test(number);
        if (!isValidPhoneNumber(primary_contact_number)) {
          response["status"] = "error";
          response["message"] = "Contact number must be valid (10–15 digits).";
          return response;
        }

        // Email validation
        const isValidEmail = (email) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
        if (email_address && !isValidEmail(email_address)) {
          response["status"] = "error";
          response["message"] = "Invalid email address format.";
          return response;
        }

        // Add emergency contact
        let existingData = await authDl.getExistingEmergencyData(user_id)
        const emergencyContact = await authDl.addEmergencyContact(req.body.user_id, req.body);

        if (emergencyContact && !_.isEmpty(emergencyContact)) {
          await authDl.updateProfileAuditLogs(existingData, req.body, data, user_details, "INSERT")
          response["status"] = "success";
          response["message"] = "Emergency contact added successfully.";
          response["data"] = emergencyContact;
        } else {
          response["status"] = "error";
          response["message"] = "Failed to add emergency contact.";
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
    } catch (err) {
      console.error("Error in addEmergencyContact:", err);
      response["status"] = "error";
      response["message"] =
        "Something went wrong while adding emergency contact.";
      response["error"] = err.message;
    }

    return response;
  };


  //get or view Family Emergency Contact
  this.getEmergencyContactById = async function (req, res) {
    let response = {};
    let validationRuleObj = {
      user_id: "required|integer",
    };
    let validationObj = req.params;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let user_id = req.params.user_id;
      let getEmergencyContact = await authDl.getEmergencyContactById(user_id);

      if (!Array.isArray(getEmergencyContact)) {
        getEmergencyContact = getEmergencyContact ? [getEmergencyContact] : [];
      }
      const sortePriority = getEmergencyContact.sort((a, b) =>
        a.priority_level.localeCompare(b.priority_level)
      );

      if (!_.isEmpty(sortePriority)) {
        response["status"] = "success";
        response["data"] = sortePriority;
      } else {
        response["status"] = "error";
        response["message"] = "No data found";
      }
    }
    else {
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
  }


  //delete Family Emergency Contact
  this.deleteEmergencyContactById = async function (req, res) {
    let response = {};

    let validationRuleObj = {
      pri_contact_id: "required",
    };
    let validationObj = req.query;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      let obj = req.query;

      let deleteEmergencyContact = await authDl.deleteEmergencyContactById(obj);

      if (!_.isEmpty(deleteEmergencyContact)) {
        response["status"] = "success";
        response["data"] = deleteEmergencyContact;
      } else {
        response["status"] = "error";
        response["message"] = "No data deleted or record not found";
      }
    }

    else {
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



  //updated Family Emergency Contact
  this.updateEmergencyContact = async function (req, res) {
    let response = {};

    let validationRuleObj = {
      user_id: "required|integer",
      pri_contact_id: "required|integer",
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);
    const user_details = await authDl.getDecryptToken(req);
    let org_id = user_details.org_id;
    

    if (isValid) {
      let user_id = req.body.user_id;
      let pri_contact_id = req.body.pri_contact_id
      // data object passed to DL
      let data = { user_id, pri_contact_id, org_id };
      // Call DL update function
      let existingData = await authDl.getExistingEmergencyData(data)
      let update_result = await authDl.updateEmergencyContact(req.body, data);
      if (update_result && update_result.affectedRows > 0) {
        await authDl.updateProfileAuditLogs(existingData, req.body, data, user_details)
        response["status"] = "success";
        response["message"] = "Emergency Contact details updated successfully";
      } else if (update_result === "No fields to update in sam_users_emergency_contact") {
        response["status"] = "error";
        response["message"] = "No valid fields provided for update";
      } else {
        response["status"] = "error";
        response["message"] = "Something went wrong while updating Emergency Contact";
      }
    }
    else {
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


  //save device token (FCM Token)
  this.saveUserFcmToken = async function (req) {
    let response = {};
    let validationRuleObj = {
      fcm_token: "required",
      device_type: "required"
    };
    let validationObj = req.body;
    let isValid = await validations.validate(validationObj, validationRuleObj);

    if (isValid) {
      const loggedInUser = authDl.getDecryptToken(req);
      const userId = loggedInUser.user_id;
      const obj = req.body;
      console.log("req token body- ", obj)
      // Save token
      const result = await authDl.saveFcmToken(userId, obj);

      if (result) {
        response.status = "success";
        response.message = "FCM token saved successfully";
      } else {
        response.status = "error";
        response.message = "Failed to save FCM token";
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


  this.getProfileAuditLogs = async function (req, res) {
    let response = {};
    let user_details = await authDl.getDecryptToken(req);
    req.body.role_id = user_details.role_id;
    if (user_details.role_id < 3) {
      let getresults = await authDl.getOrgProfileAuditLogs(user_details);
      if (!_.isEmpty(getresults)) {
        response["status"] = "success";
        response["data"] = getresults;
      } else {
        response["status"] = "error";
        response["message"] = "No Data found";
      }
    } else {
      let getresults = await authDl.getProfileAuditLogs(user_details);
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

   //////////////////////////////////////ReportingAuthority/////////////////////////////////////
  //AddReportingManager

  this.addManager = async (req) => {
  const { user_id, department_id, org_id, manager_name } = req.body;
  const user_details = await authDl.getDecryptToken(req);
  const { role_id } = user_details;

  // Validate input
  if (!user_id || !department_id || !org_id || !manager_name) {
    return { status: "error", message: "All fields are required." };
  }

  if (role_id !== 1 && role_id !== 2) {
      return { status: "error", message: "Unauthorized: Only admins can view pending issues" };
    }

  // Check if user already a manager
  const existing = await authDl.getManagerByUserId(user_id);
  if (existing.length > 0) {
    return { status: "error", message: "This user is already registered as a reporting manager." };
  }

  // Insert manager record
  const insert = await authDl.addReportingManager(user_id, department_id, org_id, manager_name);
  return { status: "success", message: "Reporting manager added successfully.", data: [user_id, department_id, org_id, manager_name] };
};


// this.assignReportingManager = async (req) => {

//   const { user_id, manager_id } = req.body;
//   const userDetails = await authDl.getDecryptToken(req);
//   const { org_id, role_id } = userDetails;

//   if (!user_id || !manager_id) {
//     return {
//       status: "error",
//       message: "user_id and manager_id required"
//     };
//   }

//   if (role_id !== 1 && role_id !== 2) {
//     return {
//       status: "error",
//       message: "Unauthorized"
//     };
//   }

//   // get manager record id from sam_reporting_manager
//   const managerRecord =
//     await authDl.getReportingManagerRecord(manager_id, org_id);

//   if (!managerRecord.length) {
//     return {
//       status: "error",
//       message: "Manager not found in reporting manager table"
//     };
//   }

//   const manager_record_id = managerRecord[0].id;

//   // update sam_users
//   await authDl.updateReportingManager(
//     user_id,
//     manager_record_id,
//     org_id
//   );

//   return {
//     status: "success",
//     message: "Reporting manager assigned successfully"
//   };

// };

this.assignReportingManager = async (req) => {
  try {
    const { user_id, manager_id1, manager_id2 } = req.body;

    const loggedInUser = await authDl.getDecryptToken(req);
    const role_id = loggedInUser.role_id;
    const org_id = loggedInUser.org_id;

    // Only Admin
    if (![1, 2].includes(role_id)) {
      return {
        status: "error",
        message: "Unauthorized: Only admins can assign reporting authorities."
      };
    }

    const userData = await authDl.getUserById(user_id, org_id);
    if (!userData.length) {
      return { status: "error", message: "User not found." };
    }

    const user = userData[0];

    // Cannot send both null
    if (!manager_id1 && !manager_id2) {
      return {
        status: "error",
        message: "Please provide at least one reporting authority."
      };
    }

    // Prevent duplicate in same request
    if (manager_id1 && manager_id2 && manager_id1 === manager_id2) {
      return {
        status: "error",
        message: "Both reporting authorities cannot be the same."
      };
    }

    const idsToValidate = [manager_id1, manager_id2].filter(Boolean);

    if (idsToValidate.length > 0) {
      const managerRecords = await authDl.getReportingManagersByIds(idsToValidate);

      if (managerRecords.length !== idsToValidate.length) {
        return {
          status: "error",
          message: "Invalid reporting authority selected."
        };
      }

      // SELF MANAGER VALIDATION
      for (let manager of managerRecords) {
        if (manager.user_id === user_id) {
          return {
            status: "error",
            message: "User cannot be assigned as their own manager."
          };
        }
      }
    }

    // Prevent overwriting existing manager unless explicitly replacing
    if (manager_id1 && user.reporting_manager_id1) {
      return {
        status: "error",
        message: "Reporting Manager 1 is already assigned."
      };
    }

    if (manager_id2 && user.reporting_manager_id2) {
      return {
        status: "error",
        message: "Reporting Manager 2 is already assigned."
      };
    }

    const updatedManager1 = manager_id1 ? manager_id1 : user.reporting_manager_id1;
    const updatedManager2 = manager_id2 ? manager_id2 : user.reporting_manager_id2;

    await authDl.updateusersManagers(
      user_id,
      updatedManager1,
      updatedManager2
    );

    return {
      status: "success",
      message: "Reporting authority assigned successfully."
    };

  } catch (error) {
    return {
      status: "error",
      message: error.message || "Something went wrong."
    };
  }
};


this.getManagersList = async (req) => {
  const userDetails = await authDl.getDecryptToken(req);
  const { org_id } = userDetails;

  if (!org_id) {
    return {
      status: "error",
      message: "Invalid token"
    };
  }

  const managers = await authDl.getManagersList(org_id);

  return {
    status: "success",
    data: managers
  };

};

this.getUsersReportingList = async (req) => {
  const userDetails = await authDl.getDecryptToken(req);
  const { org_id } = userDetails;
  if (!org_id) {
    return {
      status: "error",
      message: "Invalid token"
    };
  }
  const users = await authDl.getUsersReportingList(org_id);
  return {
    status: "success",
    data: users
  };

};

this.deleteReportingManager = async function (req) {
  try {
    const loggedInUser = await authDl.getDecryptToken(req);

    const role_id = loggedInUser.role_id;
    const org_id = loggedInUser.org_id;

    const managerId = Number(req.params.manager_id);

    if (!managerId) {
      return {
        status: "error",
        message: "Invalid manager id"
      };
    }

    if (role_id !== 1 && role_id !== 2) {
      return {
        status: "error",
        message: "Unauthorized"
      };
    }

    const manager = await authDl.getReportingManagerById(
      managerId,
      org_id
    );

    if (!manager.length) {
      return {
        status: "error",
        message: "Reporting manager not found"
      };
    }

    const assignedUsers = await authDl.checkUsersUnderManager(managerId);

    if (assignedUsers.length > 0) {
      return {
        status: "error",
        message:
          "Cannot delete. Users are assigned under this reporting manager."
      };
    }

    await authDl.DeleteReportingManager(managerId);

    return {
      status: "success",
      message: "Reporting manager deleted successfully"
    };

  } catch (error) {
    console.error("Delete Reporting Manager Error:", error);
    return {
      status: "error",
      message: "Something went wrong"
    };
  }
};

this.updateUserReportingManager = async function (req) {
  try {
    const loggedInUser = await authDl.getDecryptToken(req);

    const role_id = Number(loggedInUser.role_id);
    const org_id = loggedInUser.org_id;

    const { user_id, manager_id1, manager_id2 } = req.body;

    //  Role validation
    if (![1, 2].includes(role_id)) {
      return {
        status: "error",
        message: "Unauthorized"
      };
    }

    if (!user_id) {
      return {
        status: "error",
        message: "user_id required"
      };
    }

    const userData = await authDl.getUserById(user_id, org_id);
    if (!userData.length) {
      return {
        status: "error",
        message: "User not found"
      };
    }

    const user = userData[0];

    // At least one must be provided
    if (manager_id1 === undefined && manager_id2 === undefined) {
      return {
        status: "error",
        message: "Provide manager_id1 or manager_id2 to update"
      };
    }

    // Prevent duplicate in request
    if (manager_id1 && manager_id2 && manager_id1 === manager_id2) {
      return {
        status: "error",
        message: "Both reporting authorities cannot be the same"
      };
    }

    const idsToValidate = [manager_id1, manager_id2].filter(Boolean);

    if (idsToValidate.length > 0) {
      const managers = await authDl.getReportingManagersByIds(idsToValidate);

      if (managers.length !== idsToValidate.length) {
        return {
          status: "error",
          message: "Invalid reporting manager selected"
        };
      }

      // SELF MANAGER VALIDATION
      for (let manager of managers) {
        if (manager.user_id === user_id) {
          return {
            status: "error",
            message: "User cannot be assigned as their own manager"
          };
        }
      }
    }

    // Prevent assigning same manager already in other slot
    if (
      manager_id1 &&
      user.reporting_manager_id2 &&
      manager_id1 === user.reporting_manager_id2
    ) {
      return {
        status: "error",
        message: "Manager already assigned in slot 2"
      };
    }

    if (
      manager_id2 &&
      user.reporting_manager_id1 &&
      manager_id2 === user.reporting_manager_id1
    ) {
      return {
        status: "error",
        message: "Manager already assigned in slot 1"
      };
    }

    const updatedManager1 =
      manager_id1 !== undefined
        ? manager_id1
        : user.reporting_manager_id1;

    const updatedManager2 =
      manager_id2 !== undefined
        ? manager_id2
        : user.reporting_manager_id2;

    await authDl.updateusersManagers(
      user_id,
      updatedManager1,
      updatedManager2
    );

    return {
      status: "success",
      message: "Reporting manager updated successfully"
    };

  } catch (error) {
    console.error("Update Reporting Manager Error:", error);
    return {
      status: "error",
      message: "Something went wrong"
    };
  }
};


this.removeUserReportingManager = async function (req) {
  try {
    const loggedInUser = await authDl.getDecryptToken(req);
    const role_id = Number(loggedInUser.role_id);
    const org_id = loggedInUser.org_id;
    const { user_id, remove_manager1, remove_manager2 } = req.body;

    if (![1, 2].includes(role_id)) {
      return {
        status: "error",
        message: "Unauthorized"
      };
    }

    if (!user_id) {
      return {
        status: "error",
        message: "user_id required"
      };
    }

    if (!remove_manager1 && !remove_manager2) {
      return {
        status: "error",
        message: "Specify which manager to remove"
      };
    }

    const userData = await authDl.getUserById(user_id, org_id);

    if (!userData.length) {
      return {
        status: "error",
        message: "User not found"
      };
    }

    await authDl.removeUserManager(
      user_id,
      remove_manager1,
      remove_manager2
    );

    return {
      status: "success",
      message: "Reporting manager removed successfully"
    };

  } catch (error) {
    console.error("Remove Reporting Manager Error:", error);
    return {
      status: "error",
      message: "Something went wrong"
    };
  }
};

this.getUserAssignedManagers = async function (req) {
  try {
    const loggedInUser = await authDl.getDecryptToken(req);
    const org_id = loggedInUser.org_id;
    const user_id = loggedInUser.user_id;
    console.log(user_id);

    if (!user_id) {
      return {
        status: "error",
        message: "user_id required"
      };
    }

    const userData = await authDl.getUserById(user_id, org_id);

    if (!userData.length) {
      return {
        status: "error",
        message: "User not found"
      };
    }

    const managers =
      await authDl.getAssignedManagersByUserId(user_id, org_id);

    return {
      status: "success",
      data: managers
    };

  } catch (error) {
    console.error("Get Assigned Managers Error:", error);
    return {
      status: "error",
      message: "Something went wrong"
    };
  }
};


}

var self = (module.exports = new obj());
