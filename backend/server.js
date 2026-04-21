const path         = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const errorHandler = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");

const authRoutes    = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes   = require("./routes/orderRoutes");
const adminRoutes   = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes  = require("./routes/reviewRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const sellerRoutes  = require("./routes/sellerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");



const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // allow serving uploads
}));
app.use(cors({
    origin:      process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

// ── Global rate limiter ───────────────────────────────────
app.use("/api", apiLimiter);

// ── Body parsers ──────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static served uploads ─────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews",  reviewRoutes);
app.use("/api/seller/expenses", expenseRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/seller", sellerRoutes);



// ── Health check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "🌾 AgriMart API v2.0 running" });
});

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ── Centralized error handler (MUST be last) ──────────────
app.use(errorHandler);

const { connectDB } = require("./config/db");
const seedAdmin   = require("./utils/adminSeeder");

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();
    await seedAdmin();
    
    app.listen(PORT, () => {
        console.log(`🚀 AgriMart server listening on http://localhost:${PORT}`);
    });
}

startServer();
