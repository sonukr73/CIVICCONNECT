// src/routes/index.js
// Routes define which URL paths map to which controller functions.

const express = require("express");
const router = express.Router();
const { home } = require("../controllers/indexController");

// GET /  →  calls the home() function in indexController
router.get("/", home);

module.exports = router;
