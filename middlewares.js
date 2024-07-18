// middlewares.js
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("./config");

const authenticateToken = (req, res, next) => {
  const token = req.query.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


module.exports = { authenticateToken };
