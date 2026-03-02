var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var companyBl = require(__base + "/bl/companyBl.js");
var authmiddleware = require("../middleware/authmiddleware");
const companyDl = require("../dl/companyDl");
const multer = require("multer");
const storage = multer.memoryStorage(); // Storing the image in memory for this example
const upload = multer({ storage: storage }).single("file");


router.put(
  "/update_companyoverview",upload,
  errorWrap(async function (req, res, next) {
let response = await companyBl.updateCompanyOverview(req);
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
  "/getcompanyoverview",
  errorWrap(async function (req, res) {
     let response = await companyBl.getCompanyOverview(req);
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

router.put("/companyStatutory", async function (req, res, next) {
 let response = await companyBl.updateCompanyStatutory(req, res);
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

router.post("/add_department", async function (req, res, next) {
  let response = await companyBl.addDepartments(req);
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

router.put("/update_department", async function (req, res, next) {
  let response = await companyBl.updateDepartment(req);
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
});

router.get("/getorg_departments", async function (req, res, next) {
 let response = await companyBl.getOrganizationDepartments(req);
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

router.get("/getorg_designations", async function (req, res, next) {
let response = await companyBl.getOrganizationDesignations(req);  if (response) {
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

router.delete(
  "/delete_department",
  authmiddleware.verify,
  errorWrap(async function (req, res, next) {
    let response = await companyBl.deleteDepartment(req, res);
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
  "/addDesignations",
  errorWrap(async function (req, res) {
    let response = await companyBl.addDesignations(req);
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

//old function
router.get(
  "/getdropdowns",
  errorWrap(async function (req, res) {
    let response = await companyBl.getDropdowns(req);
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
 
// new function but no function is present for this in bl hence commented
// router.get(
//   "/getdropdowns",
//   errorWrap(async function (req, res) {
//     let response = await companyBl.getDepartmentDesignationDropdowns(req);
//     if (response) {
//       if (response.status != "error") {
//         res.status(200).send(response);
//       } else {
//         res.status(400).send(response);
//       }
//     } else {
//       res
//         .status(400)
//         .send({ status: "error", message: "something went wrong..." });
//     }
//   })
// );


router.delete("/deletedesignation", errorWrap(async function(req, res){
  let response=await companyBl.deleteDesignations(req)
  if(response){
    if(response.status!="error"){
      res.status(200).send(response);
    }else{
      res.status(400).send(response);
    }
  }else{
    res.status(400).send({status:"error", message:"something went wrong..."})
  }
}))


router.post("/apply_resignation", errorWrap(async function(req, res){
  let response = await companyBl.applyResignation(req)
  if(response){
    if(response.status!="error"){
      res.status(200).send(response);
    }else{
      res.status(400).send(response)
    }
  }else{
    res.status(400).send({status:"error", message:"Something went wrong..."})
  }
}))


router.get("/resigned_users", authmiddleware.verify, errorWrap(async function(req, res, next){
let response=await companyBl.getResignedUsers(req) 
 if(response){
    if(response.status!="error"){
      res.status(200).send(response);
    }else{
      res.status(400).send(response)
    }
  }else{
    res.status(400).send({status:"error", message:"something went wrong..."})
  }
}))

router.post("/offboard_users", errorWrap(async function(req, res, next){
    let response=await companyBl.offBoardUsers(req)
  if(response){
    if(response.status!="error"){
      res.status(200).send(response);
    }else{
      res.status(400).send(response)
    }
  }else{
    res.status(400).send({status:"error", message:"something went wrong..."})
  }
}))

module.exports = router;
