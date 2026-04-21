const db = require("../config/db");

const ProductModel = {
    async create({ name, description, price, quantity, category, seller_id, image }) {
        try {
            const [result] = await db.query(
                `INSERT INTO products (name, description, price, quantity, category, image, seller_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, description, price, quantity, category || "General", image || null, seller_id]
            );
            return result.insertId;
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                const missing = err.message.match(/'([^']+)'/)?.[1] || "unknown column";
                throw { 
                    status: 500, 
                    message: `Database schema mismatch: Column '${missing}' is missing in 'products' table.`,
                    fix: "Please run 'mysql -u root agrimart < database/agrimart.sql' to update your tables."
                };
            }
            throw err;
        }
    },


    async getAll({ search = "", category = "", sort = "newest" } = {}) {
        try {
            let sql = `
                SELECT p.*, u.name AS seller_name,
                       COALESCE(AVG(r.rating), 0) as avgRating,
                       COUNT(r.id) as reviewCount
                FROM products p
                JOIN users u ON p.seller_id = u.id
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE 1=1
            `;
            const params = [];
            if (search) {
                sql += " AND p.name LIKE ?";
                params.push(`%${search}%`);
            }
            if (category) {
                sql += " AND p.category = ?";
                params.push(category);
            }
            sql += " GROUP BY p.id";

            if (sort === "price_low") sql += " ORDER BY p.price ASC";
            else if (sort === "price_high") sql += " ORDER BY p.price DESC";
            else sql += " ORDER BY p.id DESC";

            const [rows] = await db.query(sql, params);
            return rows;
        } catch (err) {
            return MOCK_PRODUCTS.filter(p => 
                (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
                (!category || p.category === category)
            );
        }
    },


    async findById(id) {
        try {
            const [rows] = await db.query(
                `SELECT p.*, u.name AS seller_name,
                       COALESCE(AVG(r.rating), 0) as avgRating,
                       COUNT(r.id) as reviewCount
                 FROM products p
                 JOIN users u ON p.seller_id = u.id
                 LEFT JOIN reviews r ON p.id = r.product_id
                 WHERE p.id = ?
                 GROUP BY p.id`,
                [id]
            );
            return rows[0] || null;
        } catch (err) {
            return MOCK_PRODUCTS.find(p => p.id == id) || null;
        }
    },

    async getBySeller(seller_id) {
        try {
            const [rows] = await db.query(
                "SELECT * FROM products WHERE seller_id = ? ORDER BY id DESC",
                [seller_id]
            );
            return rows;
        } catch (err) {
            return MOCK_PRODUCTS.filter(p => p.seller_id == seller_id);
        }
    },

    async update(id, fields) {
        const allowed = ["name", "description", "price", "quantity", "category", "image"];
        const updates = [];
        const params = [];
        for (const key of allowed) {
            if (fields[key] !== undefined) {
                updates.push(`${key} = ?`);
                params.push(fields[key]);
            }
        }
        if (!updates.length) return;
        params.push(id);
        await db.query(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, params);
    },

    async delete(id) {
        await db.query("DELETE FROM products WHERE id = ?", [id]);
    },

    async decrementQuantity(id, qty) {
        await db.query(
            "UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?",
            [qty, id, qty]
        );
    },

    async getCategories() {
        try {
            const [rows] = await db.query("SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category");
            return rows.map(r => r.category);
        } catch (err) {
            return [...new Set(MOCK_PRODUCTS.map(p => p.category))];
        }
    },

    async getSellerProductStats(seller_id) {
        try {
            const [rows] = await db.query(
                "SELECT COUNT(*) as totalProducts, SUM(quantity) as totalStock FROM products WHERE seller_id = ?",
                [seller_id]
            );
            return rows[0];
        } catch (err) {
            const mine = MOCK_PRODUCTS.filter(p => p.seller_id == seller_id);
            return { totalProducts: mine.length, totalStock: mine.reduce((s, p) => s + p.quantity, 0) };
        }
    }
};

const MOCK_PRODUCTS = [
    { id: 101, name: "Organic Tomatoes", description: "Farm-fresh organic tomatoes, high in Vitamin C.", price: 40.00, quantity: 50, category: "Vegetables", seller_id: 1, seller_name: "Farmer John", avgRating: 4.5, reviewCount: 12 },
    { id: 102, name: "Basmati Rice", description: "Premium long-grain aged basmati rice.", price: 120.00, quantity: 100, category: "Grains", seller_id: 1, seller_name: "Farmer John", avgRating: 4.8, reviewCount: 8 },
    { id: 103, name: "Alphonso Mangoes", description: "King of mangoes from Ratnagiri farms.", price: 600.00, quantity: 20, category: "Fruits", seller_id: 2, seller_name: "Satara Farms", avgRating: 4.9, reviewCount: 25 },
    { id: 104, name: "Natural Honey", description: "Pure forest honey, unprocessed and thick.", price: 250.00, quantity: 15, category: "Dairy", seller_id: 2, seller_name: "Satara Farms", avgRating: 4.2, reviewCount: 5 }
];

module.exports = ProductModel;

