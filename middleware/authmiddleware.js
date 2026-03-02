const jwt = require("jsonwebtoken");
const tokenSecret = "samlite";

exports.verify = (req, res, next) => {
  var token = req.headers["tokenid"];
  if (token == "" || token == null) {
    res.status(403).json({ error: "please provide a valid token" });
  } else {
    jwt.verify(token, tokenSecret, (err, value) => {
      if (err) {
        res.status(500).json({ error: "failed to authenticate token" });
        return;
      }
      next();
    });
  }
};
