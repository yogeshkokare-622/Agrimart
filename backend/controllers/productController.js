const ProductService = require("../services/productService");

exports.createProduct = async (req, res, next) => {
    try {
        const { name, description, price, quantity, category } = req.body;
        const seller_id = req.userId;
        const image = req.file ? req.file.filename : null;
        const result = await ProductService.createProduct({
            name, description, price, quantity, category, seller_id, image
        });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

exports.getAllProducts = async (req, res, next) => {
    try {
        const { search, category, sort } = req.query;
        const products = await ProductService.getAllProducts({ search, category, sort });
        res.json(products || []);
    } catch (err) {

        console.error("❌ GET ALL PRODUCTS ERROR:", err);
        next(err);
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const product = await ProductService.getProductById(req.params.id);
        res.json(product);
    } catch (err) {
        next(err);
    }
};

exports.getMyProducts = async (req, res, next) => {
    try {
        const products = await ProductService.getMyProducts(req.userId);
        res.json(products);
    } catch (err) {
        next(err);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const { name, description, price, quantity, category } = req.body;
        const image = req.file ? req.file.filename : undefined;
        const fields = { name, description, price, quantity, category, image };
        // Remove undefined keys so model doesn't try to set them
        Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k]);
        const result = await ProductService.updateProduct(
            req.params.id, req.userId, req.user.role, fields
        );
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const result = await ProductService.deleteProduct(
            req.params.id, req.userId, req.user.role
        );
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await ProductService.getCategories();
        res.json(Array.isArray(categories) ? categories : []);
    } catch (err) {
        console.error("❌ GET CATEGORIES ERROR:", err);
        next(err);
    }
};
