"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestocks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRestocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { category } = req.query;
        // Ensure category is a string
        if (Array.isArray(category))
            category = category[0];
        const categoryFilter = typeof category === "string" && category !== "All" ? category : undefined;
        // Get total sales grouped by productId
        const salesData = yield prisma.sales.groupBy({
            by: ["productId"],
            _sum: {
                quantity: true,
            },
        });
        // Create a map of productId to salesQuantity
        const salesMap = new Map(salesData.map((sale) => { var _a; return [sale.productId, (_a = sale._sum.quantity) !== null && _a !== void 0 ? _a : 0]; }));
        // Fetch products with optional category filter
        const allProducts = yield prisma.products.findMany({
            where: categoryFilter ? { category: categoryFilter } : undefined,
            select: {
                productId: true,
                name: true,
                category: true,
                stockQuantity: true,
                imageUrl: true,
            },
        });
        // Merge salesQuantity and restocks info
        const productsWithRestocks = allProducts.map((product) => {
            var _a;
            const salesQuantity = (_a = salesMap.get(product.productId)) !== null && _a !== void 0 ? _a : 0;
            const restocks = Math.max(product.stockQuantity - salesQuantity, 0); // prevent negatives
            return Object.assign(Object.assign({}, product), { salesQuantity,
                restocks });
        });
        // Sort by salesQuantity (popular) and return top 12
        const top12 = productsWithRestocks
            .sort((a, b) => b.salesQuantity - a.salesQuantity)
            .slice(0, 12);
        return res.status(200).json(top12);
    }
    catch (error) {
        console.error("Error fetching restocked popular products:", error);
        return res.status(500).json({
            message: "Error fetching restocked popular products",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.getRestocks = getRestocks;
