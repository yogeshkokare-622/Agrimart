const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || "agrimart",
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Function to connect and sync
const connectDB = async () => {
    try {
        const conn = await pool.getConnection();
        console.log("✅ MySQL Connected successfully to", process.env.DB_NAME);
        conn.release();
        
        // Auto-sync schema
        const MigrationService = require("./migrationService");
        await MigrationService.sync(pool);
        return true;
    } catch (err) {
        console.error("⚠️ MySQL Connection Warning:");
        console.error("  Error:", err.message);
        global.dbError = err;
        return false;
    }
};

module.exports = pool;
module.exports.connectDB = connectDB;
