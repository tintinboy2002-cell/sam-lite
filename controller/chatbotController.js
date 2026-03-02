var express = require("express");
var router = express.Router();
var errorWrap = require(__base + "/errormiddleware.js");
var chatbotBl = require(__base + "/bl/chatbotBl.js");


// const router = express.Router();
router.post(
    "/ask-chatbot",
    errorWrap(async function (req, res) {
        let response = await chatbotBl.askChatbot(req);
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(400).send({ error: "Failed to get chatbot response" });
        }
    })
);

module.exports = router;