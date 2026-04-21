const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");
const { signToken } = require("../utils/jwt");

const VALID_ROLES = ["admin", "seller", "delivery", "user"];

const AuthService = {

    // ✅ REGISTER USER
    async register({ name, email, password, phone, address, role = "user" }) {
        try {
            if (!name || !email || !password || !phone || !address) {
                throw { status: 400, message: "All fields are required" };
            }

            email = email.toLowerCase();

            const existing = await UserModel.findByEmail(email);
            if (existing) {
                throw { status: 409, message: "Email already registered" };
            }

            if (password.length < 6) {
                throw { status: 400, message: "Password must be at least 6 characters" };
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Validate role
            const finalRole = VALID_ROLES.includes(role) && role !== "admin" ? role : "user";

            const id = await UserModel.create({
                name,
                email,
                hashedPassword, // ✅ FIXED
                phone,
                address,
                role: finalRole // 🔒 secure assigned role
            });

            return {
                id,
                message: "User registered successfully"
            };

        } catch (err) {
            throw err;
        }
    },

    // ✅ LOGIN USER
    async login({ email, password }) {
        try {
            if (!email || !password) {
                throw { status: 400, message: "Email and password are required" };
            }

            email = email.trim().toLowerCase();
            password = password.trim();

            const user = await UserModel.findByEmail(email);
            if (!user) {
                throw { status: 401, message: "Invalid credentials" };
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw { status: 401, message: "Invalid credentials" };
            }

            // ✅ RBAC READY TOKEN
            const token = signToken({
                id: user.id,
                email: user.email,
                role: user.role,
                isApproved: !!user.is_approved
            });

            return {
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isApproved: !!user.is_approved,
                    isBlocked: !!user.is_blocked
                }
            };

        } catch (err) {
            throw err;
        }
    },

    // ✅ GET PROFILE (SAFE DATA ONLY)
    async getProfile(userId) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw { status: 404, message: "User not found" };
            }

            // ✅ REFRESH TOKEN TO SYNC STATUS
            const token = signToken({
                id: user.id,
                email: user.email,
                role: user.role,
                isApproved: !!user.is_approved
            });

            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                    isApproved: !!user.is_approved,
                    isBlocked: !!user.is_blocked
                }
            };

        } catch (err) {
            throw err;
        }
    },

    // ✅ UPDATE PROFILE
    async updateProfile(userId, fields) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw { status: 404, message: "User not found" };
            }

            const updates = {};

            if (fields.name) updates.name = fields.name;
            if (fields.phone) updates.phone = fields.phone;
            if (fields.address) updates.address = fields.address;

            if (Object.keys(updates).length === 0) {
                throw { status: 400, message: "No fields to update" };
            }

            await UserModel.update(userId, updates);

            const updated = await UserModel.findById(userId);

            return {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
                address: updated.address,
                role: updated.role
            };

        } catch (err) {
            throw err;
        }
    }
};

module.exports = AuthService;