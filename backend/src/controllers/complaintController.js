// src/controllers/complaintController.js
// Handles all CRUD operations for complaints.

const Complaint = require("../models/Complaint");
const { validateImageLocation } = require("../services/aiValidationService");

// ─── Create Complaint ──────────────────────────────────────────────────────────
// POST /api/complaints
// What it does: Saves a new complaint filed by a citizen.
// Requires: title, description, category, location, userId in request body.
const createComplaint = async (req, res) => {
    try {
        const { title, description, category, location, userId, lat, lng, latitude, longitude, priority, capturedAt } = req.body;

        if (!userId) {
            return res
                .status(400)
                .json({ success: false, message: "userId is required" });
        }

        // Process image path if a file was uploaded
        let imageUrl = null;
        if (req.file) {
            // Build the public URL for the image
            const protocol = req.protocol; // http or https
            const host = req.get("host"); // localhost:5000
            imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        // Process location coordinates if provided
        let locationCoordinates = undefined;
        const finalLat = latitude ? parseFloat(latitude) : (lat ? parseFloat(lat) : undefined);
        const finalLng = longitude ? parseFloat(longitude) : (lng ? parseFloat(lng) : undefined);
        if (finalLat !== undefined && finalLng !== undefined) {
            locationCoordinates = {
                lat: finalLat,
                lng: finalLng,
            };
        }

        let finalCapturedAt = capturedAt ? new Date(capturedAt) : undefined;
        if (imageUrl && !finalCapturedAt) {
            finalCapturedAt = new Date();
        }

        // Call AI Validation service if we have coordinates and image path
        let aiValidationResult = null;
        if (imageUrl && finalLat !== undefined && finalLng !== undefined) {
            const imagePath = req.file ? req.file.path : imageUrl;
            aiValidationResult = await validateImageLocation(imagePath, finalLat, finalLng);
            console.log("[AI Geotag Validation Result]", aiValidationResult);
        }

        let initialAdminNotes = "";
        if (aiValidationResult) {
            initialAdminNotes = `[AI Geotag Verification: ${aiValidationResult.matchesLocation ? 'PASSED' : 'FAILED'} (Confidence: ${(aiValidationResult.confidence * 100).toFixed(0)}%) - ${aiValidationResult.message}]`;
        }

        const complaint = await Complaint.create({
            title,
            description,
            category,
            location,
            locationCoordinates,
            latitude: finalLat,
            longitude: finalLng,
            image: imageUrl,
            imageUrl: imageUrl,
            capturedAt: finalCapturedAt,
            user: userId, // the citizen who is filing this complaint
            priority: priority || "Medium",
            adminNotes: initialAdminNotes
        });

        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            complaint,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get All Complaints ────────────────────────────────────────────────────────
// GET /api/complaints
// What it does: Returns all complaints, newest first.
// populate("user") fills in the user's name and email instead of just the ID.
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("user", "name email phone") // show user info, not just ID
            .sort({ createdAt: -1 });             // newest complaints first

        res.status(200).json({
            success: true,
            count: complaints.length,
            complaints,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Single Complaint ──────────────────────────────────────────────────────
// GET /api/complaints/:id
// What it does: Returns one complaint by its MongoDB ID.
const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id).populate(
            "user",
            "name email phone"
        );

        if (!complaint) {
            return res
                .status(404)
                .json({ success: false, message: "Complaint not found" });
        }

        res.status(200).json({ success: true, complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Update Complaint Status ───────────────────────────────────────────────────
// PATCH /api/complaints/:id/status
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, officerId, completionNote, rejectionReason } = req.body;

        const allowedStatuses = ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowedStatuses.join(", ")}`,
            });
        }

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res
                .status(404)
                .json({ success: false, message: "Complaint not found" });
        }

        // Security check: only assigned officer can change status (if assigned)
        if (complaint.assignedOfficer && complaint.assignedOfficer !== officerId) {
            return res.status(403).json({
                success: false,
                message: "Security Warning: Only the assigned officer can update this complaint's status."
            });
        }

        // Workflow validation:
        // Pending/Assigned -> In Progress -> Resolved or Rejected
        const current = complaint.status;
        if (status === "In Progress" && current !== "Assigned" && current !== "Pending") {
            return res.status(400).json({ success: false, message: "Invalid transition. Status must be Assigned or Pending to move to In Progress." });
        }
        if ((status === "Resolved" || status === "Rejected") && current !== "In Progress") {
            return res.status(400).json({ success: false, message: "Invalid transition. Status must be In Progress before resolving or rejecting." });
        }
        if (status === "Assigned" && current !== "Pending") {
            return res.status(400).json({ success: false, message: "Cannot revert status back to Assigned." });
        }

        // Require notes and store timestamps/metadata
        if (status === "Resolved") {
            if (!completionNote) {
                return res.status(400).json({ success: false, message: "Completion note is required to mark as Resolved." });
            }
            complaint.completionNote = completionNote;
            complaint.resolvedAt = new Date();
        }

        if (status === "Rejected") {
            if (!rejectionReason) {
                return res.status(400).json({ success: false, message: "Rejection reason is required to mark as Rejected." });
            }
            complaint.rejectionReason = rejectionReason;
            complaint.rejectedAt = new Date();
        }

        complaint.status = status;
        await complaint.save();

        res.status(200).json({
            success: true,
            message: `Status updated to "${status}" successfully`,
            complaint,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Add Work Log ──────────────────────────────────────────────────────────────
// PATCH /api/complaints/:id/log
const addComplaintLog = async (req, res) => {
    try {
        const { note, officerId } = req.body;
        if (!note) {
            return res.status(400).json({ success: false, message: "Work log note is required." });
        }

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        // Security check
        if (complaint.assignedOfficer && complaint.assignedOfficer !== officerId) {
            return res.status(403).json({
                success: false,
                message: "Security Warning: Only the assigned officer can add logs to this complaint."
            });
        }

        complaint.workLogs.push({
            note,
            createdAt: new Date()
        });

        await complaint.save();

        res.status(200).json({
            success: true,
            message: "Work log added successfully",
            complaint
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Officer's Complaints ──────────────────────────────────────────────────
// GET /api/officer/complaints
const getOfficerComplaints = async (req, res) => {
    try {
        const { officerId } = req.query;
        if (!officerId) {
            return res.status(400).json({ success: false, message: "officerId is required in query parameters." });
        }

        const complaints = await Complaint.find({ assignedOfficer: officerId })
            .populate("user", "name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: complaints.length,
            complaints
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Update Complaint (General) ───────────────────────────────────────────────
// PATCH /api/complaints/:id
const updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }
        res.status(200).json({ success: true, message: "Complaint updated successfully", complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    addComplaintLog,
    getOfficerComplaints,
    updateComplaint,
};

