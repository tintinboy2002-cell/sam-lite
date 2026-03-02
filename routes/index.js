var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('*', async function (req, res, next) {
	isJS = req.baseUrl.includes(".js");
	isCss = req.baseUrl.includes(".css");
	isWoff2 = req.baseUrl.includes(".woff2");
	isWoff = req.baseUrl.includes(".woff");
	isTtf = req.baseUrl.includes(".ttf");
	if (req.baseUrl == "/manifest.json") {
		res.sendFile(__base + "/public/manage/build/manifest.json");
		return;
	}else if (req.baseUrl == "/favicon.ico") {
		res.sendFile(__base + "/public/manage/build/favicon.ico");
		return;
	}/* else if (req.baseUrl == "/ngsw-worker.js") {
		res.sendFile(__base + "/public/manage/dist/ngsw-worker.js");
		return;
	}else if (req.baseUrl == "/runtime.js") {
		res.sendFile(__base + "/public/manage/dist/runtime.js");
		return;
	}else if (req.baseUrl == "/polyfills.js") {
		res.sendFile(__base + "/public/manage/dist/polyfills.js");
		return;
	} else if (req.baseUrl == "/vendor.js") {
		res.sendFile(__base + "/public/manage/dist/vendor.js");
		return;
	} else if (req.baseUrl == "/main.js") {
		res.sendFile(__base + "/public/manage/dist/main.js");
		return;
	} else if (req.baseUrl == "common.js"){
		res.sendFile(__base + "/public/manage/dist/common.js");
		return;
	} */
	else if (isJS || isCss || isWoff2 || isWoff || isTtf){
		res.sendFile(__base + "/public/manage/build" + req.baseUrl);
		return;
	}
	res.sendFile(__base + '/public/manage/build/index.html');
});
module.exports = router;