// models/ApiKey.js
const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
    key: { type: String, required: true },
    limit: { type: Number, default: parseInt(process.env.API_KEY_LIMIT) }
});

module.exports = mongoose.model("ApiKey", apiKeySchema);
