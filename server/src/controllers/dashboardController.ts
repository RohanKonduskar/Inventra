import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Step 1: Get all distinct categories
    const categoriesData = await prisma.products.findMany({
      distinct: ["category"],
      select: { category: true },
    });

    const categories = categoriesData.map(c => c.category);

    // Step 2: Get total sales quantity for all products
    const allSalesData = await prisma.sales.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
    });

    const salesMap = new Map<string, number>(
      allSalesData.map(sale => [sale.productId, sale._sum.quantity ?? 0])
    );

    // Step 3: Get all products with salesQuantity calculated
    const allProducts = await prisma.products.findMany();
    const allProductsWithSales = allProducts.map(product => ({
      ...product,
      salesQuantity: salesMap.get(product.productId) ?? 0,
    }));

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
    const sales = await prisma.sales.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        product: {
          select: { name: true, category: true },
        },
      },
    });

    const purchases = await prisma.purchases.findMany({
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

  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    res.status(500).json({
      message: "Error retrieving dashboard metrics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
