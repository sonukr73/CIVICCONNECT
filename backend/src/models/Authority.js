// src/models/Authority.js
// An Authority is a municipal officer or department staff
// who can view and update the status of complaints.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authoritySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true,
            // e.g. "Roads", "Water Supply", "Electricity", "Sanitation"
        },
        role: {
            type: String,
            default: "departmental officer",
            // "admin" or "departmental officer"
        },
    },
    { timestamps: true }
);

// Hash password before saving
authoritySchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords on login
authoritySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Authority", authoritySchema);
