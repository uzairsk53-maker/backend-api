const productService = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/response');
const { addProductSchema, updateProductSchema } = require('../validators/product.validator');

class ProductController {
    async addProduct(req, res) {
        try {
            const { error, value } = addProductSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            const product = await productService.addProduct(value);
            return successResponse(res, product, 'Product added successfully', 201);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async updateProduct(req, res) {
        try {
            const { error, value } = updateProductSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            const product = await productService.updateProduct(req.params.id, value);
            return successResponse(res, product, 'Product updated successfully');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async deleteProduct(req, res) {
        try {
            await productService.deleteProduct(req.params.id);
            return successResponse(res, null, 'Product deleted successfully');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getProductList(req, res) {
        try {
            const data = await productService.getProductList(req.query);
            return successResponse(res, data, 'Products retrieved successfully');
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new ProductController();
