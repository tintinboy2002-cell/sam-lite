const express = require("express");
const app = express();
var authmiddleware = require("../middleware/authmiddleware");
// const controller = require("../controller/mailController");

// router.post("/upload", controller.upload);
// router.get("/files", controller.getListFiles);
// router.get("/files/:name", controller.download);
var authController = require(__base + "/controller/authController.js");
var attendenceController = require(__base +
  "/controller/attendenceController.js");
var companyController = require(__base + "/controller/companyController.js");
var workweekController = require(__base + "/controller/workweekController.js");
var holidayController = require(__base + "/controller/holidayController.js");
 var leaveManagementController = require(__base +
  "/controller/leaveManagementController.js");
var payrollController = require(__base + "/controller/payrollController.js");
var dashboardController = require(__base +  "/controller/dashboardController.js");
var chatbotController = require(__base + "/controller/chatbotController.js");
var nubaxPortalController = require(__base + "/controller/nubaxPortalController.js");

var announcementController =require(__base + "/controller/announcementController.js");
var configController = require(__base + "/controller/configController.js");
var announcementController =require(__base + "/controller/announcementController.js");
var workfromhomeController =require(__base + "/controller/wfhController.js")



app.use("/auth", authController);
app.use("/attendence", authmiddleware.verify, attendenceController);
app.use("/company", authmiddleware.verify, companyController);
app.use("/workweek", authmiddleware.verify, workweekController);
app.use("/holiday", authmiddleware.verify, holidayController);
app.use("/leaves", authmiddleware.verify, leaveManagementController);
app.use("/payroll", authmiddleware.verify, payrollController);
app.use("/dashboard", authmiddleware.verify, dashboardController);
app.use("/chatbot", authmiddleware.verify, chatbotController);
app.use("/nubax-portal", nubaxPortalController);
app.use("/announcement", authmiddleware.verify, announcementController);
app.use("/config", authmiddleware.verify, configController);
app.use("/announcement", authmiddleware.verify, announcementController);
app.use("/remote-work", authmiddleware.verify, workfromhomeController)



module.exports = app;
