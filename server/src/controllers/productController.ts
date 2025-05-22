import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: {
        name: {
          contains: search,
        },
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, name, price, rating, stockQuantity,category,imageUrl,} = req.body;
  
    const product = await prisma.products.create({
      data: {
        productId,
        name,
        price,
        rating,
        stockQuantity,
        category,
        imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
};

// import { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export const getProducts = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const search = req.query.search?.toString();

//     // Step 1: Fetch products with optional search filter
//     const products = await prisma.products.findMany({
//       where: search
//         ? {
//             name: {
//               contains: search,
//               mode: "insensitive",
//             },
//           }
//         : undefined,
//     });

//     // Step 2: Get total quantity sold per product
//     const salesData = await prisma.sales.groupBy({
//       by: ["productId"],
//       _sum: {
//         quantity: true,
//       },
//     });

//     // Step 3: Create a map from productId to totalSoldQuantity
//     const salesMap = new Map(
//       salesData.map((sale) => [sale.productId, sale._sum.quantity ?? 0])
//     );

//     // Step 4: Attach totalSoldQuantity to each product
//     const enrichedProducts = products.map((product) => ({
//       ...product,
//       totalSoldQuantity: salesMap.get(product.productId) || 0,
//     }));

//     res.json(enrichedProducts);
//   } catch (error) {
//     console.error("❌ Error retrieving products:", error);
//     res.status(500).json({ message: "Error retrieving products" });
//   }
// };

// export const createProduct = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const {
//       productId,
//       name,
//       price,
//       rating,
//       stockQuantity,
//       category,
//       imageUrl,
//     } = req.body;

//     const product = await prisma.products.create({
//       data: {
//         productId,
//         name,
//         price,
//         rating,
//         stockQuantity,
//         category,
//         imageUrl,
//       },
//     });
//     res.status(201).json(product);
//   } catch (error) {
//     console.error("❌ Error creating product:", error);
//     res.status(500).json({ message: "Error creating product" });
//   }
// };
