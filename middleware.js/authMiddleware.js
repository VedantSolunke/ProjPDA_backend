// authMiddleware.js

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate a random JWT secret key
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Use a consistent JWT secret key, for example, load it from environment variables or a configuration file.
const jwtSecretKey =
  process.env.JWT_SECRET_KEY ||
  "casd34r5h56u7juhybtve23456789i7juhytbgv8ik7juy";
console.log("Using JWT Secret Key:", jwtSecretKey);

exports.authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};
