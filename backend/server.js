// server.js — The entry point of the entire backend application.
// This file:
//   1. Loads environment variables from .env
//   2. Creates the Express app
//   3. Sets up middleware (cors, json parsing)
//   4. Mounts routes: /, /api/users, /api/authorities, /api/complaints
//   5. Connects to MongoDB
//   6. Starts listening on the specified port

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const indexRouter = require("./src/routes/index");
const userRoutes = require("./src/routes/userRoutes");
const authorityRoutes = require("./src/routes/authorityRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");

// Load environment variables from .env file
dotenv.config();

// Create the Express application
const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
// cors() — allows the React frontend (on a different port) to talk to this API
app.use(cors());

// express.json() — lets us read JSON data sent in request bodies
app.use(express.json());

// Serve static files from the 'uploads' folder
// So http://localhost:5000/uploads/file.jpg will work
app.use("/uploads", express.static("uploads"));

// ─── Routes ───────────────────────────────────────────────────────────────────
// Health check route
app.use("/", indexRouter);

// API routes — each module gets its own URL prefix
app.use("/api/users", userRoutes);           // POST /api/users/register, /login
app.use("/api/authorities", authorityRoutes); // POST /api/authorities/register, /login
app.use("/api/complaints", complaintRoutes); // POST, GET, PATCH /api/complaints

// ─── 404 Handler ──────────────────────────────────────────────────────────────
// Catches any request to a route that doesn't exist
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// First connect to MongoDB, then start listening for requests
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
