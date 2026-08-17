const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const pool = require("../db");
const { authenticateToken, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /auth/signup
 * Register a new user
 */
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // Check existing user
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
      [name.trim(), cleanEmail, hashedPassword]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to create account. Please try again." });
  }
});

/**
 * POST /auth/login
 * Log in an existing user
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Authentication failed. Please try again." });
  }
});

/**
 * POST /auth/google
 * Authenticate or register a user via Google OAuth ID Token
 */
router.post("/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Google credential token is required." });
  }

  try {
    let payload;

    // First attempt verification using google-auth-library
    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const client = new OAuth2Client({ clientId: process.env.GOOGLE_CLIENT_ID });
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (err) {
        console.warn("Google library verification notice, falling back to tokeninfo API:", err.message);
      }
    }

    // Fallback/direct tokeninfo verification via Google OAuth API
    if (!payload) {
      const googleRes = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
      payload = googleRes.data;
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google OAuth token." });
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    const name = payload.name || payload.given_name || cleanEmail.split("@")[0];

    // Find or register user
    let userResult = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    let user;
    if (userResult.rows.length === 0) {
      const randomPassword = await bcrypt.hash(`google_oauth_${Date.now()}_${Math.random()}`, 10);
      const newUserRes = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
        [name, cleanEmail, randomPassword]
      );
      user = newUserRes.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Generate app JWT session token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Google authentication successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Google Auth error:", err);
    return res.status(401).json({ error: "Google authentication failed: " + (err.response?.data?.error_description || err.message) });
  }
});

/**
 * GET /auth/me
 * Get active authenticated user details
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Fetch me error:", err);
    res.status(500).json({ error: "Failed to fetch user details." });
  }
});

module.exports = router;
