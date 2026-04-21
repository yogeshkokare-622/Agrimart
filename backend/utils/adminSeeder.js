const bcrypt = require("bcrypt");
const db = require("../config/db");

const seedAdmin = async () => {
    try {
        const email = "yogeshkokare42@gmail.com";
        const password = "123456";
        const role = "admin";
        const name = "AgriMart Admin";

        // Check if admin already exists
        const [rows] = await db.query("SELECT id, password FROM users WHERE email = ?", [email]);
        
        const hashedPassword = await bcrypt.hash(password, 10);

        if (rows.length > 0) {
            console.log("ℹ️  Admin user already exists. Updating password to ensure sync...");
            await db.query("UPDATE users SET password = ?, role = 'admin' WHERE email = ?", [hashedPassword, email]);
            console.log("✅ Admin credentials synchronized.");
            return;
        }

        console.log("🌱 Creating new Admin User...");
        
        await db.query(
            "INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, role, "0000000000", "Admin Headquarters"]
        );

        console.log("✅ Admin user seeded successfully!");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
    } catch (err) {
        console.error("❌ Admin Seeding Failed:", err.message);
    }
};

module.exports = seedAdmin;
