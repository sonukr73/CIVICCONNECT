// src/models/Complaint.js
// A Complaint is an issue reported by a citizen (User).
// Authorities can update its status.

const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: ["Roads", "Water Supply", "Electricity", "Sanitation", "Other"],
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        // New: geographical coordinates
        locationCoordinates: {
            lat: { type: Number },
            lng: { type: Number },
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        // New: URL/path for the uploaded image
        image: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        capturedAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"],
            default: "Pending",
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },
        workLogs: [{
            note: String,
            createdAt: { type: Date, default: Date.now }
        }],
        completionNote: String,
        rejectionReason: String,
        resolvedAt: Date,
        rejectedAt: Date,
        assignedOfficer: {
            type: String, // Allow simple string ID like 'o1', 'o2' or MongoDB ObjectIds
            default: null
        },
        // The citizen who filed this complaint
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",        // links to the User model
            required: true,
        },
    },
    { timestamps: true } // createdAt, updatedAt added automatically
);

module.exports = mongoose.model("Complaint", complaintSchema);
