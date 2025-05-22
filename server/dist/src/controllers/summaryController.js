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
exports.getSummary = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Explicitly type the query parameters
        const { period, category } = req.query;
        if (!period) {
            return res.status(400).json({ message: "Period is required" });
        }
        let startDate;
        let endDate = new Date();
        const currentDate = new Date();
        switch (period) {
            case "Today":
                startDate = new Date(currentDate.setHours(0, 0, 0, 0));
                break;
            case "This Week": {
                const currentDay = currentDate.getDay();
                const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - daysToMonday, 0, 0, 0, 0);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59, 999);
                break;
            }
            case "This Month":
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                break;
            default:
                return res.status(400).json({ message: "Invalid period" });
        }
        // Ensure category is always a string
        const categoryFilter = category && category !== "All" ? category : undefined;
        // Query sales data filtered by category
        const salesData = yield prisma.sales.findMany({
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
                product: categoryFilter ? { category: categoryFilter } : undefined,
            },
            include: {
                product: true,
            },
        });
        // Query purchase data filtered by category
        const purchaseData = yield prisma.purchases.findMany({
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
                product: categoryFilter ? { category: categoryFilter } : undefined,
            },
            include: {
                product: true,
            },
        });
        // Group data by category
        const categorySummary = {};
        salesData.forEach((sale) => {
            const categoryName = sale.product.category || "Other";
            if (!categorySummary[categoryName]) {
                categorySummary[categoryName] = { soldQuantity: 0, purchasedQuantity: 0, earning: 0, spending: 0 };
            }
            categorySummary[categoryName].soldQuantity += sale.quantity;
            categorySummary[categoryName].earning += sale.totalAmount;
        });
        purchaseData.forEach((purchase) => {
            const categoryName = purchase.product.category || "Other";
            if (!categorySummary[categoryName]) {
                categorySummary[categoryName] = { soldQuantity: 0, purchasedQuantity: 0, earning: 0, spending: 0 };
            }
            categorySummary[categoryName].purchasedQuantity += purchase.quantity;
            categorySummary[categoryName].spending += purchase.totalCost;
        });
        // Convert to array format for frontend
        const summaryData = Object.keys(categorySummary).map((category) => (Object.assign({ category }, categorySummary[category])));
        return res.json(summaryData);
    }
    catch (error) {
        console.error("Error retrieving summary data:", error);
        return res.status(500).json({ message: "Error retrieving summary data" });
    }
});
exports.getSummary = getSummary;
