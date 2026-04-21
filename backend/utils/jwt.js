const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    throw new Error("JWT_SECRET is required in environment variables");
}

exports.signToken = (payload) => {
    return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

exports.verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};
