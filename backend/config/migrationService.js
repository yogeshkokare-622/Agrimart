const MigrationService = {
    async sync(db) {
        console.log("⚙️  Checking Database Schema...");
        try {
            // Check products table
            const [columns] = await db.query("SHOW COLUMNS FROM products");
            const columnNames = columns.map(c => c.Field);

            if (!columnNames.includes("category")) {
                console.log("🛠️ Adding 'category' column to 'products'...");
                await db.query("ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT 'General' AFTER quantity");
            }

            if (!columnNames.includes("image")) {
                console.log("🛠️ Adding 'image' column to 'products'...");
                await db.query("ALTER TABLE products ADD COLUMN image VARCHAR(255) DEFAULT NULL AFTER category");
            }

            // check reviews table
            try {
                await db.query("SELECT 1 FROM reviews LIMIT 1");
            } catch (err) {
                if (err.code === 'ER_NO_SUCH_TABLE') {
                    console.log("🛠️ Creating 'reviews' table...");
                    await db.query(`
                        CREATE TABLE reviews (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            product_id INT NOT NULL,
                            user_id INT NOT NULL,
                            rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                            comment TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            UNIQUE KEY unique_user_review (product_id, user_id),
                            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        )
                    `);
                }
            }

            // check expenses table
            try {
                await db.query("SELECT 1 FROM expenses LIMIT 1");
            } catch (err) {
                if (err.code === 'ER_NO_SUCH_TABLE') {
                    console.log("🛠️ Creating 'expenses' table...");
                    await db.query(`
                        CREATE TABLE expenses (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            seller_id INT NOT NULL,
                            title VARCHAR(255) NOT NULL,
                            amount DECIMAL(10, 2) NOT NULL,
                            category VARCHAR(100) DEFAULT 'General',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
                        )
                    `);
                }
            }

            // Check orders table for delivery columns
            try {
                const [orderCols] = await db.query("SHOW COLUMNS FROM orders");
                const orderColNames = orderCols.map(c => c.Field);
                
                if (!orderColNames.includes("delivery_person_id")) {
                    console.log("🛠️ Adding 'delivery_person_id' column to 'orders'...");
                    await db.query("ALTER TABLE orders ADD COLUMN delivery_person_id INT DEFAULT NULL AFTER seller_id");
                }
                
                if (!orderColNames.includes("status")) {
                    console.log("🛠️ Adding 'status' column to 'orders'...");
                    await db.query("ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");
                } else {
                    // Update existing status to support all logistics stages
                    console.log("🛠️ Updating 'status' enum in 'orders'...");
                    await db.query("ALTER TABLE orders MODIFY COLUMN status ENUM('Pending', 'Accepted', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Pending'");
                }


                // Check users role enum
                const [userCols] = await db.query("SHOW COLUMNS FROM users");
                const userColumnNames = userCols.map(c => c.Field);

                if (userCols.length > 0 && !userCols[0].Type.includes('delivery')) {
                    console.log("🛠️ Updating 'role' enum in 'users' to include 'delivery'...");
                    await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'seller', 'admin', 'delivery') DEFAULT 'user'");
                }

                if (!userColumnNames.includes("lat")) {
                    console.log("🛠️ Adding 'lat' and 'lng' columns to 'users'...");
                    await db.query("ALTER TABLE users ADD COLUMN lat DECIMAL(10, 8) DEFAULT NULL, ADD COLUMN lng DECIMAL(11, 8) DEFAULT NULL");
                }

                if (!userColumnNames.includes("is_available")) {
                    console.log("🛠️ Adding 'is_available' column to 'users'...");
                    await db.query("ALTER TABLE users ADD COLUMN is_available TINYINT(1) DEFAULT 1");
                }

                if (!userColumnNames.includes("is_blocked")) {
                    console.log("🛠️ Adding 'is_blocked' column to 'users'...");
                    await db.query("ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) DEFAULT 0");
                }

                if (!userColumnNames.includes("is_approved")) {
                    console.log("🛠️ Adding 'is_approved' column to 'users'...");
                    await db.query("ALTER TABLE users ADD COLUMN is_approved TINYINT(1) DEFAULT 1"); // Default 1 for normal users, sellers will need approval
                }


            } catch (err) {
                console.error("❌ Migration Failed:", err.message);
            }



            console.log("✅ Database Schema is up to date!");
        } catch (err) {
            console.error("❌ Schema Sync Failed:", err.message);
        }
    }
};


module.exports = MigrationService;
