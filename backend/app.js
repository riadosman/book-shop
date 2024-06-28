const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Use cors middleware
app.use(cors());

require("dotenv").config(); // Load environment variables from .env file

const password = process.env.PASSWORD;

// Connect to MongoDB
const uri = `mongodb+srv://riadosman:${password}@cluster0.qs04zik.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });

// Define Mongoose schema and model for books
const Book = require(__dirname + "/models/books.js");
const User = require(__dirname + "/models/users.js");

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Book app</h1>");
});

app.post("/api/users/signup", async (req, res) => {
  try {
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post("/api/users/login", async (req, res) => {
  try {
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const passwordMatch = await bcrypt.compare(req.body.password, existingUser.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    res.json({ message: "Login successful", user: existingUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});
// POST endpoint to add a new book
app.post("/api/books", async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.json(newBook);
    console.log(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.get("/api/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});
app.delete("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Book.findByIdAndDelete(id);
    res.json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete book" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
