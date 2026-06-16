// src/models/User.js
// Defines the shape of a User document in MongoDB.
// A "user" is a citizen who submits complaints.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
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
        phone: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            default: "user", // always "user" for citizens
        },
    },
    { timestamps: true } // adds createdAt and updatedAt automatically
);

// Before saving, hash the password if it was changed
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare login password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
