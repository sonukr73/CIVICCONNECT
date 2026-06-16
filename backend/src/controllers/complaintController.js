// src/controllers/complaintController.js
// Handles all CRUD operations for complaints.

const Complaint = require("../models/Complaint");

// ─── Create Complaint ──────────────────────────────────────────────────────────
// POST /api/complaints
// What it does: Saves a new complaint filed by a citizen.
// Requires: title, description, category, location, userId in request body.
const createComplaint = async (req, res) => {
    try {
        const { title, description, category, location, userId, lat, lng } = req.body;

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
        if (lat && lng) {
            locationCoordinates = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            };
        }

        const complaint = await Complaint.create({
            title,
            description,
            category,
            location,
            locationCoordinates,
            image: imageUrl,
            user: userId, // the citizen who is filing this complaint
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
// What it does: Lets an authority change the status of a complaint.
// Valid statuses: "Pending", "In Progress", "Resolved"
const updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = ["Pending", "In Progress", "Resolved"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowedStatuses.join(", ")}`,
            });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true } // return the updated document, not the old one
        );

        if (!complaint) {
            return res
                .status(404)
                .json({ success: false, message: "Complaint not found" });
        }

        res.status(200).json({
            success: true,
            message: `Status updated to "${status}"`,
            complaint,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
};
