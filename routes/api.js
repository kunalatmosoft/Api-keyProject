const express = require("express");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const ApiKey = require("../models/ApiKey");
const cacheClient = require("../cache/cacheClient");

const router = express.Router();

// Path to data.json file
const dataPath = path.join(__dirname, "../data.json");

// Load data from JSON file
const getData = () => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        console.log("Data loaded from data.json:", data);
        return data;
    } catch (err) {
        console.error("Error reading data.json file:", err);
        return null;
    }
};

// Connection check route (no API key required)
router.get("/check-connections", async (req, res) => {
    try {
        // Check MongoDB connection
        const apiKeyTest = await ApiKey.findOne();
        const mongoStatus = apiKeyTest ? "MongoDB connected" : "MongoDB not connected";

        // Check Redis connection
        const testKey = "test_connection";
        await cacheClient.set(testKey, "Redis connected", "EX", 60); // 1-minute expiration
        const redisStatus = await cacheClient.get(testKey);

        res.json({
            mongodb: mongoStatus,
            redis: redisStatus ? "Redis connected" : "Redis not connected",
        });
    } catch (err) {
        console.error("Connection check failed:", err);
        res.status(500).json({ error: "Connection check failed" });
    }
});

// Middleware to validate API key and check limits
router.use(async (req, res, next) => {
    const apiKey = req.query.api_key;
    if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
    }

    try {
        const key = await ApiKey.findOne({ key: apiKey });
        if (!key) {
            return res.status(403).json({ error: "Invalid API key" });
        }

        // Check remaining limit
        if (key.limit <= 0) {
            return res.status(429).json({ error: "API limit exhausted. Upgrade your plan or try later." });
        }

        // Deduct one API call from the limit
        key.limit -= 1;
        await key.save();

        // Attach API key details to the request
        req.apiKeyDetails = key;
        next();
    } catch (err) {
        console.error("Error validating API key:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,                // 10 requests per 5 minutes
    message: "Rate limit exceeded. Try again later.",
});

// Apply the rate limiter before your routes
router.use(limiter);

// Log remaining rate limit count to the CLI for each request
router.use((req, res, next) => {
    if (req.rateLimit) {
        console.log(`Remaining Requests: ${req.rateLimit.remaining}`); // Log remaining rate limit count
    }
    next();
});

// Main data route
router.get("/data", async (req, res) => {
    const cacheKey = "api_data";

    try {
        // First, try to get data from Redis cache
        const cachedData = await cacheClient.get(cacheKey);

        // If cache exists and is not expired, serve data from Redis
        if (cachedData) {
            console.log("Serving data from Redis cache");
            return res.json(JSON.parse(cachedData));
        }

        // If no cached data or expired cache, load from JSON file
        const data = getData();
        if (!data) {
            return res.status(500).json({ error: "Failed to load data from JSON" });
        }

        // Cache the data in Redis for 30 minutes (1800 seconds)
        await cacheClient.set(cacheKey, JSON.stringify(data), {
            EX: 1800, // Cache expires after 30 minutes
        });
        console.log("Data fetched from JSON and cached in Redis");

        // Return the data
        res.json(data);
    } catch (err) {
        console.error("Error in /data route:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;

/* const express = require("express");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const ApiKey = require("../models/ApiKey");
const cacheClient = require("../cache/cacheClient");

const router = express.Router();

// Path to data.json file
const dataPath = path.join(__dirname, "../data.json");

// Load data from JSON file
const getData = () => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        console.log("Data loaded from data.json:", data);
        return data;
    } catch (err) {
        console.error("Error reading data.json file:", err);
        return null;
    }
};

// Middleware to validate API key
router.use(async (req, res, next) => {
    const apiKey = req.query.api_key;
    if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
    }

    try {
        const key = await ApiKey.findOne({ key: apiKey });
        if (!key) {
            return res.status(403).json({ error: "Invalid API key" });
        }
        next();
    } catch (err) {
        console.error("Error validating API key:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,                   // 10 requests per 15 minutes
    message: "Rate limit exceeded. Try again later.",
});
router.use(limiter);

// Main data route
router.get("/data", async (req, res) => {
    const cacheKey = "api_data";

    try {
        // First, try to get data from Redis cache
        const cachedData = await cacheClient.get(cacheKey);
        
        if (cachedData) {
            console.log("Serving data from Redis cache");
            return res.json(JSON.parse(cachedData));
        }

        // If no cached data, load from JSON file
        const data = getData();
        if (!data) {
            return res.status(500).json({ error: "Failed to load data from JSON" });
        }

        // Cache the data in Redis for 1 hour
        await cacheClient.set(cacheKey, JSON.stringify(data), {
            EX: 3600 // Set expiration time (1 hour)
        });
        console.log("Data fetched from JSON and cached in Redis");

        // Return the data
        res.json(data);
    } catch (err) {
        console.error("Error in /data route:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
 */
/* const express = require("express");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const ApiKey = require("../models/ApiKey");
const cacheClient = require("../cache/cacheClient");

const router = express.Router();

// Path to data.json file
const dataPath = path.join(__dirname, "../data.json");

// Load data from JSON file
const getData = () => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        console.log("Data loaded from data.json:", data);
        return data;
    } catch (err) {
        console.error("Error reading data.json file:", err);
        return null;
    }
};

// Connection check route (no API key required)
router.get("/check-connections", async (req, res) => {
    try {
        // Check MongoDB connection
        const apiKeyTest = await ApiKey.findOne();
        const mongoStatus = apiKeyTest ? "MongoDB connected" : "MongoDB not connected";

        // Check Redis connection
        const testKey = "test_connection";
        await cacheClient.set(testKey, "Redis connected", 'EX', 60); // 1-minute expiration
        const redisStatus = await cacheClient.get(testKey);

        res.json({
            mongodb: mongoStatus,
            redis: redisStatus ? "Redis connected" : "Redis not connected",
        });
    } catch (err) {
        console.error("Connection check failed:", err);
        res.status(500).json({ error: "Connection check failed" });
    }
});

// Middleware to validate API key
router.use(async (req, res, next) => {
    const apiKey = req.query.api_key;
    if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
    }

    try {
        const key = await ApiKey.findOne({ key: apiKey });
        if (!key) {
            return res.status(403).json({ error: "Invalid API key" });
        }
        next();
    } catch (err) {
        console.error("Error validating API key:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,  // 5 minutes
    max: 10,                   // 10 requests per 15 minutes
    message: "Rate limit exceeded. Try again later.",
});

// Apply the rate limiter before your routes
router.use(limiter);

// Log remaining rate limit count to the CLI for each request
router.use((req, res, next) => {
    if (req.rateLimit) {
        console.log(`Remaining Requests: ${req.rateLimit.remaining}`);  // Log remaining rate limit count
    }
    next();
});

// Main data route
router.get("/data", async (req, res) => {
    const cacheKey = "api_data";

    try {
        // First, try to get data from Redis cache
        const cachedData = await cacheClient.get(cacheKey);

        // If cache exists and is not expired, serve data from Redis
        if (cachedData) {
            console.log("Serving data from Redis cache");
            return res.json(JSON.parse(cachedData));
        }

        // If no cached data or expired cache, load from JSON file
        const data = getData();
        if (!data) {
            return res.status(500).json({ error: "Failed to load data from JSON" });
        }

        // Cache the data in Redis for 30 minutes (1800 seconds)
        await cacheClient.set(cacheKey, JSON.stringify(data), {
            EX: 1800, // Cache expires after 30 minutes
        });
        console.log("Data fetched from JSON and cached in Redis");

        // Return the data
        res.json(data);
    } catch (err) {
        console.error("Error in /data route:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
 */
