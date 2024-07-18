require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Post = require("./models/Post");
const nodemailer = require("nodemailer");

const app = express();

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const secret =
  process.env.JWT_SECRET || "casd34r5h56u7juhybtve23456789i7juhytbgv8ik7juy";

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Remove useFindAndModify option
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

app.use(cors({ credentials: true, origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(cookieParser());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

// User Registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json(error);
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({ error: "User not found" });
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(400).json({ error: "Wrong credentials" });
    }
    // Generate JWT token
    const token = jwt.sign({ username, id: userDoc._id }, secret);
    // Set the token in a cookie
    res.cookie("token", token, { httpOnly: true }).json({
      id: userDoc._id,
      username,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Profile
app.get("/profile", authenticateToken, (req, res) => {
  res.json(req.user);
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token").json("Logout successful");
});

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// New route for creating posts
app.post(
  "/createPost",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description, content, tag } = req.body;
      const image = req.file ? req.file.buffer.toString("base64") : "";
      const post = await Post.create({
        title,
        description,
        content,
        image,
        tag,
      });
      res.json(post);
    } catch (err) {
      console.error("Create post error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find({ tag: "past" }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get upcoming posts
app.get("/upcoming-posts", async (req, res) => {
  try {
    const upcomingPosts = await Post.find({ tag: "upcoming" })
      .sort({ createdAt: -1 })
      .limit(3);
    res.json(upcomingPosts);
  } catch (error) {
    console.error("Error fetching upcoming posts:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single post page
app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(postDoc);
  } catch (error) {
    console.error("Error fetching post:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update post
app.put(
  "/post/:id",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, content, tag } = req.body;

      let updatedPost;

      if (req.file) {
        const image = req.file.buffer.toString("base64");
        updatedPost = await Post.findByIdAndUpdate(
          id,
          { title, description, content, tag, image },
          { new: true }
        );
      } else {
        updatedPost = await Post.findByIdAndUpdate(
          id,
          { title, description, content, tag },
          { new: true }
        );
      }

      res.json(updatedPost);
    } catch (err) {
      console.error("Update post error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Delete post
app.delete("/post/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "acesoham322@gmail.com",
    pass: process.env.EMAIL_PASS || "your-email-password",
  },
});

app.post("/mail", async (req, res) => {
  const { name, email, msg } = req.body;
  const mailOptions = {
    from: process.env.EMAIL_USER || "acesoham322@gmail.com",
    to: "pratham03d@gmail.com",
    subject: email,
    text: msg,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ error: "Failed to send email" });
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
