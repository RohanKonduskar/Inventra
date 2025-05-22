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
exports.getDashboardMetrics = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Get all distinct categories
        const categoriesData = yield prisma.products.findMany({
            distinct: ["category"],
            select: { category: true },
        });
        const categories = categoriesData.map(c => c.category);
        // Step 2: Get total sales quantity for all products
        const allSalesData = yield prisma.sales.groupBy({
            by: ["productId"],
            _sum: {
                quantity: true,
            },
        });
        const salesMap = new Map(allSalesData.map(sale => { var _a; return [sale.productId, (_a = sale._sum.quantity) !== null && _a !== void 0 ? _a : 0]; }));
        // Step 3: Get all products with salesQuantity calculated
        const allProducts = yield prisma.products.findMany();
        const allProductsWithSales = allProducts.map(product => {
            var _a;
            return (Object.assign(Object.assign({}, product), { salesQuantity: (_a = salesMap.get(product.productId)) !== null && _a !== void 0 ? _a : 0 }));
        });
        // Step 4: Top 12 products across all categories (for 'All')
        const overallTopSales = [...allProductsWithSales]
            .sort((a, b) => b.salesQuantity - a.salesQuantity)
            .slice(0, 12);
        // Step 5: Top 12 products per category
        const popularProducts = categories.map(category => {
            const categoryProducts = allProductsWithSales
                .filter(p => p.category === category)
                .sort((a, b) => b.salesQuantity - a.salesQuantity)
                .slice(0, 12);
            return {
                category,
                products: categoryProducts,
            };
        });
        // Step 6: Add 'All' at the beginning
        popularProducts.unshift({
            category: "All",
            products: overallTopSales,
        });
        // Step 7: Get sales and purchases
        const sales = yield prisma.sales.findMany({
            orderBy: { timestamp: "desc" },
            include: {
                product: {
                    select: { name: true, category: true },
                },
            },
        });
        const purchases = yield prisma.purchases.findMany({
            orderBy: { timestamp: "desc" },
            include: {
                product: {
                    select: { name: true, category: true },
                },
            },
        });
        // Step 8: Return response
        res.status(200).json({
            Products: allProducts,
            popularProducts,
            Sales: sales,
            Purchases: purchases,
        });
    }
    catch (error) {
        console.error("❌ Dashboard Error:", error);
        res.status(500).json({
            message: "Error retrieving dashboard metrics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getDashboardMetrics = getDashboardMetrics;
