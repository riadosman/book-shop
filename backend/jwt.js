const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
// Mock user database
const users = [
  { id: 1, username: "user1", password: "password1" },
  { id: 2, username: "user2", password: "password2" },
];

// Route for user authentication
app.post("/login", (req, res) => {
  // Mock user authentication logic (you would replace this with your actual authentication logic)
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const payload = { userId: user.id, username: user.username };
  const secretKey = "the web token";
  const options = { expiresIn: "1h" };
  const token = jwt.sign(payload, secretKey, options);

  // Return the token to the client
  res.json({ token });
});
// Middleware function to verify JWT token
function verifyToken(req, res, next) {
  // Get the token from the request headers
  const token = req.headers.authorization;

  // Check if token is provided
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. Token is required." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token.replace("Bearer ", ""), "the web token");
    req.user = decoded; // Attach the decoded payload to the request object
    next(); // Move to the next middleware
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
}

// Protected route example
app.get("/protected", verifyToken, (req, res) => {
  // Access the decoded payload attached to the request object
  const userId = req.user.userId;
  res.json({ message: `Protected route accessed by user ${userId}.` });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
