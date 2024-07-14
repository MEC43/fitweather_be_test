// middlewares.js
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
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

const corsOptions = {
  credentials: true,
  origin: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"],
};

const setupMiddlewares = (app) => {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());
};

module.exports = { authenticateToken, setupMiddlewares };
