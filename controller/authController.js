var express = require("express");
var router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const tokenSecret = "samlite";
var authBl = require(__base + "/bl/authBl.js");
var errorWrap = require(__base + "/errormiddleware.js");
const multer = require("multer");

var authmiddleware = require("../middleware/authmiddleware");
const storage = multer.memoryStorage(); // Storing the image in memory for this example
const upload = multer({ storage: storage }).single("file");

function generateToken(user) {
  return jsonwebtoken.sign({ data: user }, tokenSecret, { expiresIn: "24h" });
}

router.post(
  "/organizationRegister",
  errorWrap(async function (req, res, next) {
    global.requestParams = req;
    let response = await authBl.organizationRegister(req, res);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.post(
  "/getotp",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getOtp(req, res);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.post(
  "/login",
  errorWrap(async function (req, res, next) {
    global.requestParams = req;
    let response = await authBl.checkLogin(req, res);
    if (response) {
      if (response.status != "error") {
        let user_name = response.data.user_name;
        let tokenId = generateToken(response.data);
        let role_id = response.data.role_id;
        let org_id = response.data.org_id;
        let user_id = response.data.user_id;
        let accessmodule = response.data.accessmodule;
        let role = "";
        if (role_id === 1) {
          role = "Superadmin";
        } else if (role_id === 2) {
          role = "Admin";
        } else {
          role = "betauser";
        }
        response.data = {};
        response.data.user_id = user_id;
        response.data.accessmodule = accessmodule;
        response.data.org_id = org_id;
        response.data.tokenid = tokenId;
        response.data.role_id = role_id;
        response.data.role = role;
        response.data.user_name = user_name;
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res.status(400).send({
        status: "error",
        message: "Something went wrong...",
      });
    }
  })
);

router.post(
  "/verifyotp",
  errorWrap(async function (req, res, next) {
    let response = await authBl.verifyOtp(req.body);
    {
      if (response) {
        if (response.status != "error") {
          res.status(200).send(response);
        } else {
          res.status(400).send(response);
        }
      } else {
        res
          .status(400)
          .send({ status: "error", message: "Something went wrong..." });
      }
    }
  })
);

router.put(
  "/ResetPassword",
  errorWrap(async function (req, res, nex) {
    let response = await authBl.updatePassword(req.body);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.post(
  "/getOtpForgotPassword",
  errorWrap(async function (req, res, nex) {
    let response = await authBl.getOtpForgotPassword(req, res);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.get(
  "/OrganizationUsers",
  errorWrap(async function (req, res, next) {
    let response = await authBl.organizationUsers(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.post(
  "/CreateUser",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    global.requestParams = req;
    let response = await authBl.createUser(req, res);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else if (response.status != "error2") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.get(
  "/getprofiledetails/:user_id",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.getProfileDetails(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res.status(400).send({
        status: "error",
        message: "something went wrong...",
      });
    }
  })
);

router.put(
  "/updateprofiledetails",

  errorWrap(async function (req, res, next) {
    let response = await authBl.updateProfileDetails(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.post(
  "/saveimage",
  upload,
  errorWrap(async function (req, res, next) {
    let response = await authBl.saveImage(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.get(
  "/getimage",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getImage(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.post(
  "/uploadDocs",
  upload,
  errorWrap(async function (req, res, next) {
    let response = await authBl.uploadDocuments(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.get(
  "/getdocuments/:user_id",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getDocuments(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.get(
  "/getdocumentsadmin/:user_id",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getDocumentsForAdmin(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.delete(
  "/deletedocs",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.deleteDocuments(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong..." });
    }
  })
);

router.get(
  "/list-organizations",
  errorWrap(async function (req, res, next) {
    let response = await authBl.listOrganization(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.put(
  "/updateorganization",
  errorWrap(async function (req, res, next) {
    let response = await authBl.updateOrganization(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.delete(
  "/delete-organization",
  errorWrap(async function (req, res, next) {
    let response = await authBl.deleteOrganization(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.post(
  "/verifydocument",
  errorWrap(async function (req, res, next) {
    console.log("req", req.body);
    let response = await authBl.verifyDocument(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong..." });
    }
  })
);

router.get("/logout", authmiddleware.verify, errorWrap(async function (req, res, next) {
  global.requestParams = req;
  let response = await authBl.logoutUser(req, res);
  if (response) {
    if (response.status != "error") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  } else {
    res
      .status(400)
      .send({ status: "error", message: "Something went wrong..." });
  }
})
);


router.get(
  "/getUserDetails",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getUsersDetails(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.post(
  "/getOtpForEmail",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getOtpForEmail(req, res);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res.status(400).send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.put(
  "/updateUserStatus",
  errorWrap(async function (req, res, next) {
    let response = await authBl.updateUserStatus(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res.status(400).send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.post(
  "/delete_user",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.deleteUser(req);
    if (response) {
      if (response.status !== "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong..." });
    }
  })
);

router.get(
  "/OrgUserDetailById/:userId",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getOrganizationUserDetailsById(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.put(
  "/editUser",
  errorWrap(async function (req, res, next) {
    let response = await authBl.editUser(req, res);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.get(
  "/Directory/ActiveUsers",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getActiveDirectoryUsers(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.get(
  "/getFeatures",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getFeatures(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.post("/add-feature", errorWrap(async function (req, res) {
  let response = await authBl.addFeature(req)
  if (response) {
    if (response.status != "error") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response)
    }
  } else {
    res.status(400).send({ status: "error", message: "Something went wrong..." })
  }
}))

router.post("/assign-features", errorWrap(async function (req, res) {
  let response = await authBl.assignFeature(req)
  if (response) {
    if (response.status != "error") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response)
    }
  } else {
    res.status(400).send({ status: "error", message: "Something went wrong..." })
  }
}))

router.get(
  "/getAssignedFeatureOrg",
  errorWrap(async function (req, res, next) {
    let response = await authBl.getAssignedFeatureOrg(req);
    if (response) {
      if (response != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);

router.post("/delete-feature", async function (req, res, next) {
  let response = await authBl.deleteFeature(req, res);
  if (response) {
    if (response.status != "error") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  } else {
    res
      .status(400)
      .send({ status: "error", message: "Something went wrong..." });
  }
});


router.post("/delete-assigned-feature", async function (req, res, next) {
  let response = await authBl.deleteAssignedFeature(req, res);
  if (response) {
    if (response.status != "error") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  } else {
    res
      .status(400)
      .send({ status: "error", message: "Something went wrong..." });
  }
});

router.post(
  "/refresh-token",
  errorWrap(async function (req, res, next) {
    global.requestParams = req;
    let response = await authBl.refreshTokenRotation(req, res);
    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);

//insert or adding eduction
router.post(
  "/add-education", upload,
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.addEducation(req);
    if (response) {
      if (response.status !== "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong..." });
    }
  })
);


router.get(
  "/education/:user_id",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.getEductionById(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);


router.get(
  "/education/download/:education_id",
  authmiddleware.verify,
  errorWrap(async (req, res) => {

    // Call BL layer
    const response = await authBl.downloadEducationFileBL(req);

    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);



// delete eduction by user_id with eduction id
router.delete(
  "/delete_education",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.deleteEductionById(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong..." });
    }
  })
);


//updated eduction details
router.put(
  "/update_education",
  upload,
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.updateEducationDetails(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);



//insert or adding Family Emergency Contact
router.post(
  "/add_emergency_contact",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.addEmergencyContact(req);
    if (response) {
      if (response.status !== "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong..." });
    }
  })
);

//get or view Family Emergency Contact
router.get(
  "/emergency_contact/:user_id",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.getEmergencyContactById(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);

//delete Family Emergency Contact
router.delete(
  "/delete_emergency_contact",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    console.log('-----------------', req.body)
    let response = await authBl.deleteEmergencyContactById(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong..." });
    }
  })
);


//updated Family Emergency Contact
router.put(
  "/update_emergency_contact",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.updateEmergencyContact(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "something went wrong......." });
    }
  })
);


router.get(
  "/get-profile-audit-logs",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.getProfileAuditLogs(req);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res
        .status(400)
        .send({ status: "error", message: "Something went wrong..." });
    }
  })
);


//save device token (FCM Token)
router.post(
  "/save_fcm_token",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await authBl.saveUserFcmToken(req);
    if (response) {
      if (response.status !== "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res.status(400).send({
        status: "error",
        message: "Something went wrong...",
      });
    }
  })
)

//////////////////////////////////////ReportingAuthority/////////////////////////////////////
//AddReportingManager
router.post(
  "/add-manager",
  errorWrap(async function (req, res, next) {
    let response = await authBl.addManager(req, res);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res.status(400).send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.post(
  "/assign-reporting-manager",
  errorWrap(async function (req, res, next) {
    let response = await authBl.assignReportingManager(req, res);
    if (response) {
      if (response.status != "error") {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } else {
      res.status(400).send({ status: "error", message: "Something went wrong..." });
    }
  })
);

router.get(
  "/get-managers-list",
  errorWrap(async function (req, res, next) {

    const response = await authBl.getManagersList(req);

    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }

  })
);

router.get(
  "/get-users-reporting-list",
  errorWrap(async function (req, res, next) {

    const response = await authBl.getUsersReportingList(req);

    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }

  })
);


router.delete(
  "/deleteReportingManager/:manager_id",
  errorWrap(async function (req, res, next) {
    let response = await authBl.deleteReportingManager(req);

    if (response.status !== "error") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);

router.put(
  "/updateUserReportingManager",
  errorWrap(async function (req, res, next) {
    let response = await authBl.updateUserReportingManager(req);

    if (response.status !== "error") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);


router.put(
  "/removeUserReportingManager",
  errorWrap(async function (req, res, next) {
    let response = await authBl.removeUserReportingManager(req);

    if (response.status !== "error") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }
  })
);

router.get(
  "/get-User-Assigned-Managers",
  errorWrap(async function (req, res, next) {

    const response = await authBl.getUserAssignedManagers(req);

    if (response.status === "success") {
      res.status(200).send(response);
    } else {
      res.status(400).send(response);
    }

  })
);



module.exports = router;
