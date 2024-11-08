// Load the Redis package
const redis = require("redis");

// Create the Redis client using the connection details (you can keep the password, host, and port directly in the file or from the environment variables)
const client = redis.createClient({
    password: 'OhYHJ7lHcgVtXN4jjZJzbe3P7T2Zxnou',
    socket: {
        host: 'redis-12879.c80.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 12879
    }
});

// Handle connection errors
client.connect().catch(function(err) {
    console.error("Error connecting to Redis:", err);
});

// Log any Redis client errors
client.on("error", function(err) {
    console.error("Redis Client Error", err);
});

// Export the Redis client
module.exports = client;
