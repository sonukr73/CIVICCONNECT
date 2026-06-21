// src/controllers/authorityController.js
// Handles registration and login for Authority accounts (municipal officers).

const Authority = require("../models/Authority");

// ─── Register ─────────────────────────────────────────────────────────────────
// POST /api/authorities/register
// What it does: Creates a new authority account with a department.
const register = async (req, res) => {
    try {
        const { name, email, password, department, role } = req.body;

        // Check if email already taken
        const existing = await Authority.findOne({ email });
        if (existing) {
            return res
                .status(400)
                .json({ success: false, message: "Email already registered" });
        }

        const authority = await Authority.create({ name, email, password, department, role: role || "departmental officer" });

        res.status(201).json({
            success: true,
            message: "Authority registered successfully",
            authority: {
                _id: authority._id,
                name: authority.name,
                email: authority.email,
                department: authority.department,
                role: authority.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /api/authorities/login
// What it does: Verifies authority credentials.
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const authority = await Authority.findOne({ email });
        if (!authority) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await authority.matchPassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        // Use stored role, or fall back to the role sent from the frontend
        const authorityRole = authority.role || role || "departmental officer";

        res.status(200).json({
            success: true,
            message: "Login successful",
            authority: {
                _id: authority._id,
                name: authority.name,
                email: authority.email,
                department: authority.department,
                role: authorityRole,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/authorities
const getAuthorities = async (req, res) => {
    try {
        const authorities = await Authority.find({}, "-password");
        res.status(200).json({ success: true, authorities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/authorities/:id
const deleteAuthority = async (req, res) => {
    try {
        const { id } = req.params;
        await Authority.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Authority deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, getAuthorities, deleteAuthority };
