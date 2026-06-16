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
        // New: URL/path for the uploaded image
        image: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Resolved"],
            default: "Pending", // every new complaint starts as Pending
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
