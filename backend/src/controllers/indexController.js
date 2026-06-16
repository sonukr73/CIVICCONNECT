// src/controllers/indexController.js
// Controllers handle the logic for each route.
// This one just sends back a message to confirm the API is alive.

const home = (req, res) => {
    res.status(200).json({
        success: true,
        message: "CivicConnect API is running 🚀",
    });
};

module.exports = { home };
