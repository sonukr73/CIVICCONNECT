// src/routes/authorityRoutes.js
// Defines URL paths for authority (municipal officer) actions.

const express = require("express");
const router = express.Router();
const { register, login, getAuthorities, deleteAuthority } = require("../controllers/authorityController");

// POST /api/authorities/register  →  Create new authority account
router.post("/register", register);

// POST /api/authorities/login  →  Login as authority
router.post("/login", login);

// GET /api/authorities  →  Get all authorities
router.get("/", getAuthorities);

// DELETE /api/authorities/:id  →  Delete an authority
router.delete("/:id", deleteAuthority);

module.exports = router;
