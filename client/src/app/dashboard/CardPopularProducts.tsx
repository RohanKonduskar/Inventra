import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "../(components)/Rating";
// import Image from "next/image";
import { useGetDashboardMetricsQuery } from "@/state/api";
import { StaticImageData } from "next/image";

const CardPopularProducts = ({ selectedCategory }: { selectedCategory: string }) => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  const popularProducts: { category: string; products: any[] }[] =
    Array.isArray(dashboardMetrics?.popularProducts)
      ? dashboardMetrics.popularProducts
      : [];

  // Fix: Directly find the selected category products, including "All"
  const categoryProducts =
    popularProducts.find((group) => group.category === selectedCategory)?.products || [];

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">Popular Products</h3>
          <hr />
          <div className="overflow-auto h-full">
            {categoryProducts.length > 0 ? (
              categoryProducts.map((product: any) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between gap-3 px-5 py-7 border-b"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        typeof product.imageUrl === "string"
                          ? product.imageUrl
                          : (product.imageUrl as StaticImageData).src
                      }
                      alt={product.name}
                      width="48"
                      height="48"
                      className="rounded-lg w-14 h-14"
                    />
                    <div className="flex flex-col justify-between gap-1">
                      <div className="font-bold text-gray-700">{product.name}</div>
                      <div className="flex text-sm items-center">
                        <span className="font-bold text-blue-500 text-xs">
                          ₹{product.price}
                        </span>
                        <span className="mx-2">|</span>
                        <Rating rating={product.rating || 0} />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs flex items-center">
                    <button className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    {Math.round(product.salesQuantity)} Sold
                  </div>
                </div>
              ))
            ) : (
              <div className="m-5 text-gray-500 text-center">
                No products available for this category.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;
