const express           = require("express");
const router            = express.Router();
const multer            = require("multer");
const path              = require("path");
const productController = require("../controllers/productController");
const { verifyToken, requireSellerOrAdmin } = require("../middlewares/authMiddleware");
const { createProductRules, updateProductRules, validate } = require("../middlewares/validators");

// Multer setup
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
        filename:    (req, file, cb) => {
            const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
            cb(null, `${Date.now()}-${safeName}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        allowed.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public
router.get("/",             productController.getAllProducts);
router.get("/categories",   productController.getCategories);
router.get("/:id",          productController.getProductById);

// Protected — any logged-in user
router.get("/my-products/list", verifyToken, productController.getMyProducts);

// Protected — seller or admin only
router.post("/",    verifyToken, requireSellerOrAdmin, upload.single("image"), createProductRules, validate, productController.createProduct);
router.put("/:id",  verifyToken, upload.single("image"), updateProductRules, validate, productController.updateProduct);
router.delete("/:id", verifyToken, productController.deleteProduct);

module.exports = router;
