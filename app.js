// app.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const generateApiKeyRoutes = require("./routes/generateApiKey");
const apiRoutes = require("./routes/api");
const cors = require('cors');

// Enable CORS for all routes

// Load environment variables
dotenv.config();
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

const app = express();

app.use(cors());  // Allow all domains to access
app.use(express.static("public"));

// Set the view engine to EJS
app.set("view engine", "ejs");
// Routes
app.use("/api", apiRoutes);
app.use("/generateApiKey", generateApiKeyRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


