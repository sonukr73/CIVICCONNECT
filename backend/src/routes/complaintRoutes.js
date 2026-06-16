// src/routes/complaintRoutes.js
// Defines URL paths for complaint operations.

const express = require("express");
const router = express.Router();
const {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
} = require("../controllers/complaintController");
const upload = require("../config/upload");

// POST   /api/complaints          →  Submit a new complaint (with image)
router.post("/", upload.single("image"), createComplaint);

// GET    /api/complaints          →  Get all complaints
router.get("/", getAllComplaints);

// GET    /api/complaints/:id      →  Get a single complaint by ID
router.get("/:id", getComplaintById);

// PATCH  /api/complaints/:id/status  →  Update status (Pending / In Progress / Resolved)
router.patch("/:id/status", updateComplaintStatus);

module.exports = router;
