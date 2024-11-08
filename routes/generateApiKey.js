const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const ApiKey = require("../models/ApiKey");

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

// Create an express router for API key generation
const router = express.Router();

// Route to show the API key generation form
router.get("/", (req, res) => {
    res.render("generateApiKey", { apiKey: null });
});

// Route to handle API key generation and display it
router.post("/generate", async (req, res) => {
    try {
        const key = uuidv4();
        const limit = process.env.API_KEY_LIMIT || 100;

        const apiKey = new ApiKey({ key, limit });
        await apiKey.save();

        res.render("generateApiKey", { apiKey: key });
    } catch (err) {
        console.error("Error generating API key:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
