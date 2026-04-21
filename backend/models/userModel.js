const db = require("../config/db");

const UserModel = {
    async findByEmail(email) {
        try {
            const [rows] = await db.query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );
            return rows[0] || null;
        } catch (err) {
            if (err.code === 'ER_NO_SUCH_TABLE') return null;
            throw err;
        }
    },


    async findById(id) {
        try {
            const [rows] = await db.query(
                "SELECT id, name, email, phone, address, role, is_approved, is_blocked, created_at FROM users WHERE id = ?",
                [id]
            );
            return rows[0] || null;
        } catch (err) {
            if (err.code === 'ER_NO_SUCH_TABLE') return null;
            throw err;
        }
    },


    async create({ name, email, hashedPassword, phone, address, role = "user" }) {
        try {
            const [result] = await db.query(
                "INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)",
                [name, email, hashedPassword, phone, address, role]
            );
            return result.insertId;
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                throw { status: 409, message: "Email already exists" };
            }
            throw err;
        }
    },

    async getAll() {
        const [rows] = await db.query(
            "SELECT id, name, email, phone, address, role, created_at FROM users ORDER BY id DESC"
        );
        return rows;
    },

    async update(id, fields) {
        const allowed = ["name", "phone", "address"];
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
        await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
    },

    async getDeliveryPartners() {
        const [rows] = await db.query(
            "SELECT id, name, email, phone FROM users WHERE role = 'delivery'"
        );
        return rows;
    }

};

module.exports = UserModel;
