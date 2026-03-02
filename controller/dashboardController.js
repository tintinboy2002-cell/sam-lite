var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var DashBoardBl = require(__base + "/bl/dashboardBl.js");

router.get(
    "/birthday-list",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.getTodayBirthdayList(req);
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
    "/work-anniversary-list",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.getTodayWorkAnniversaryList(req);
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
    "/new-joiners-list",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.getNewJoinersList(req);
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
    "/quick-links/add",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.addQuickLink(req);
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
    "/quick-links-edit",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.editQuickLink(req);
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

router.delete(
    "/quick-links-delete",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.deleteQuickLinks(req);
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
    "/quick-links/list",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.getQuickLinksList(req);
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
    "/widget-panels",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.getWidgetPanelList(req);
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
    "/widget-panels/toggle-active/:id",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.toggleWidgetActive(req);
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
    "/widget-panels/order-update",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.updateWidgetOrder(req);
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
    "/upcoming-festivals",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.getUpcomingFestivals(req);
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
    "/send-birthday-mail",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.sendBirthdayMail(req);
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
    "/today-leave-members",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.getTodayLeaveMembers(req);
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
    "/daily-thoughts",
    errorWrap(async function (req, res, next) {
        const response = await DashBoardBl.getDailyThought(req);
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

module.exports = router;