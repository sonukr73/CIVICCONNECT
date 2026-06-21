// src/config/seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Authority = require("../models/Authority");

// Load backend environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedAuthorities = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is not defined in the environment variables.");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected.");

        // We define the Admin and the predefined officers
        const authoritiesToSeed = [
            {
                name: "System Admin",
                email: "admin.gov.in",
                password: "Admin@123",
                department: "Admin",
                role: "admin",
            },
            {
                name: "Rajesh Sharma",
                email: "rajesh.gov.in",
                password: "rajesh@123",
                department: "Roads",
                role: "departmental officer",
            },
            {
                name: "Priya Mehta",
                email: "priya.gov.in",
                password: "priya@123",
                department: "Water Supply",
                role: "departmental officer",
            },
            {
                name: "Amit Singh",
                email: "amit.gov.in",
                password: "amit@123",
                department: "Electricity",
                role: "departmental officer",
            },
            {
                name: "Sunita Rao",
                email: "sunita.gov.in",
                password: "sunita@123",
                department: "Sanitation",
                role: "departmental officer",
            },
            {
                name: "Vikram Patel",
                email: "vikram.gov.in",
                password: "vikram@123",
                department: "Other",
                role: "departmental officer",
            },
        ];

        console.log("Seeding authorities...");
        // Clear existing authorities to avoid stale accounts
        await Authority.deleteMany({});
        console.log("Cleared existing authorities.");

        for (const auth of authoritiesToSeed) {
            console.log(`Creating new authority: ${auth.email}`);
            await Authority.create(auth);
        }

        console.log("🎉 Seeding authorities complete successfully!");
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedAuthorities();
