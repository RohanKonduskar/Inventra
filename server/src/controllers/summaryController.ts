import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSummary = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Explicitly type the query parameters
    const { period, category } = req.query as { period?: string; category?: string };

    if (!period) {
      return res.status(400).json({ message: "Period is required" });
    }

    let startDate: Date;
    let endDate: Date = new Date();
    const currentDate = new Date();

    switch (period) {
      case "Today":
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        break;

      case "This Week": {
        const currentDay = currentDate.getDay();
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - daysToMonday,
          0, 0, 0, 0
        );
        endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + 6,
          23, 59, 59, 999
        );
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
    const salesData = await prisma.sales.findMany({
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
    const purchaseData = await prisma.purchases.findMany({
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
    const categorySummary: Record<
      string,
      { soldQuantity: number; purchasedQuantity: number; earning: number; spending: number }
    > = {};

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
    const summaryData = Object.keys(categorySummary).map((category) => ({
      category,
      ...categorySummary[category],
    }));

    return res.json(summaryData);
  } catch (error) {
    console.error("Error retrieving summary data:", error);
    return res.status(500).json({ message: "Error retrieving summary data" });
  }
};
