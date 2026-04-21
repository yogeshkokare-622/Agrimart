const ProductModel = require("../models/productModel");

const ProductService = {
    async createProduct({ name, description, price, quantity, category, seller_id, image }) {
        if (!name || !description || !price || !quantity) {
            throw { status: 400, message: "Name, description, price, and quantity are required" };
        }
        if (isNaN(price) || price <= 0) {
            throw { status: 400, message: "Price must be a positive number" };
        }
        if (!Number.isInteger(Number(quantity)) || quantity < 0) {
            throw { status: 400, message: "Quantity must be a non-negative integer" };
        }
        const id = await ProductModel.create({ name, description, price, quantity, category, seller_id, image });
        return { id, message: "Product created successfully" };
    },

    async getAllProducts({ search, category, sort } = {}) {
        return ProductModel.getAll({ search, category, sort });
    },


    async getProductById(id) {
        const product = await ProductModel.findById(id);
        if (!product) throw { status: 404, message: "Product not found" };
        return product;
    },

    async getMyProducts(seller_id) {
        return ProductModel.getBySeller(seller_id);
    },

    async updateProduct(id, seller_id, role, fields) {
        const product = await ProductModel.findById(id);
        if (!product) throw { status: 404, message: "Product not found" };
        if (product.seller_id !== seller_id && role !== "admin") {
            throw { status: 403, message: "Forbidden: you don't own this product" };
        }
        await ProductModel.update(id, fields);
        return { message: "Product updated successfully" };
    },

    async deleteProduct(id, seller_id, role) {
        const product = await ProductModel.findById(id);
        if (!product) throw { status: 404, message: "Product not found" };
        if (product.seller_id !== seller_id && role !== "admin") {
            throw { status: 403, message: "Forbidden: you don't own this product" };
        }
        await ProductModel.delete(id);
        return { message: "Product deleted successfully" };
    },

    async getCategories() {
        return ProductModel.getCategories();
    }
};

module.exports = ProductService;
