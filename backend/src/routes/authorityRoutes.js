// src/routes/authorityRoutes.js
// Defines URL paths for authority (municipal officer) actions.

const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authorityController");

// POST /api/authorities/register  →  Create new authority account
router.post("/register", register);

// POST /api/authorities/login  →  Login as authority
router.post("/login", login);

module.exports = router;
