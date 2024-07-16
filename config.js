// config.js
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8080,
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  openaiApiKey: process.env.OPENAI_API_KEY,
};