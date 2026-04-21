const AuthService = require("../services/authService");

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, address, role } = req.body;
        const result = await AuthService.register({ name, email, password, phone, address, role });
        res.status(201).json({ success: true, message: "User registered successfully", ...result });
    } catch (err) {
        console.error('❌ REGISTER ERROR:', err.message, err.code || err.sqlState);
        console.error('Stack:', err.stack?.split('\\n')[0]);
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login({ email, password });
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const { user, token } = await AuthService.getProfile(req.userId);
        res.json({ success: true, user, token });
    } catch (err) {
        next(err);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address } = req.body;
        const updated = await AuthService.updateProfile(req.userId, { name, phone, address });
        res.json({ success: true, message: "Profile updated successfully", user: updated });
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
};
