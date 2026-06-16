// src/routes/userRoutes.js
// Defines URL paths for citizen user actions.

const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/userController");

// POST /api/users/register  →  Create new citizen account
router.post("/register", register);

// POST /api/users/login  →  Login as citizen
router.post("/login", login);

module.exports = router;
