import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRestocks = async (req: Request, res: Response): Promise<Response> => {
  try {
    let { category } = req.query;

    // Ensure category is a string
    if (Array.isArray(category)) category = category[0];
    const categoryFilter = typeof category === "string" && category !== "All" ? category : undefined;

    // Get total sales grouped by productId
    const salesData = await prisma.sales.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
    });

    // Create a map of productId to salesQuantity
    const salesMap = new Map<string, number>(
      salesData.map((sale) => [sale.productId, sale._sum.quantity ?? 0])
    );

    // Fetch products with optional category filter
    const allProducts = await prisma.products.findMany({
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
      const salesQuantity = salesMap.get(product.productId) ?? 0;
      const restocks = Math.max(product.stockQuantity - salesQuantity, 0); // prevent negatives

      return {
        ...product,
        salesQuantity,
        restocks,
      };
    });

    // Sort by salesQuantity (popular) and return top 12
    const top12 = productsWithRestocks
      .sort((a, b) => b.salesQuantity - a.salesQuantity)
      .slice(0, 12);

    return res.status(200).json(top12);
  } catch (error) {
    console.error("Error fetching restocked popular products:", error);
    return res.status(500).json({
      message: "Error fetching restocked popular products",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
