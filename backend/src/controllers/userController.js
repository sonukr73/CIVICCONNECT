// src/controllers/userController.js
// Handles all logic for citizen user registration and login.

const User = require("../models/User");

// ─── Register ─────────────────────────────────────────────────────────────────
// POST /api/users/register
// What it does: Creates a new citizen account.
// How: Checks if email already exists → saves new user → returns user data.
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: "Email already registered" });
        }

        // Create and save the user (password is auto-hashed via pre-save hook)
        const user = await User.create({ name, email, password, phone });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /api/users/login
// What it does: Verifies credentials and returns user info.
// How: Finds user by email → compares password → returns user data.
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        // Compare entered password with hashed password in DB
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login };
