"use client";

import { useState, useEffect } from "react";
import { SearchIcon } from "lucide-react";
import Header from "@/app/(components)/Header";
import Navbar from "@/app/(components)/Navbar";
import { StaticImageData } from "next/image";

interface Product {
  productId: string;
  name: string;
  category: string;
  stockQuantity: number;
  salesQuantity: number;
  restocks: number;
  imageUrl: string;
}

const Restocks = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestocks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const queryParam =
          selectedCategory !== "All"
            ? `?category=${encodeURIComponent(selectedCategory)}`
            : "";
        const response = await fetch(`http://localhost:8000/restocks${queryParam}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch restocks");

        setProducts(data);
      } catch (error: any) {
        console.error("Error fetching restocks:", error);
        setError(error.message || "Error fetching restocks");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestocks();
  }, [selectedCategory]);

  // Filter by search term and sales quantity > 25% of stock
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.salesQuantity > 0.25 * product.stockQuantity
  );

  return (
    <div className="mx-auto pb-5 w-full">
      <Navbar onCategoryChange={setSelectedCategory} />

      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search restocked products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Header name={`${selectedCategory} Top Restock Products`} />
      </div>

      {isLoading && <div className="py-4 text-center">Loading...</div>}
      {error && <div className="text-center text-red-500 py-4">{error}</div>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between">
          {filteredProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No products found</div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.productId} className="border shadow rounded-md p-4 max-w-full w-full mx-auto">
                <div className="flex flex-col items-center">
                  <img
                    src={
                      typeof product.imageUrl === "string"
                        ? product.imageUrl
                        : (product.imageUrl as StaticImageData).src
                    }
                    alt={product.name}
                    width="150"
                    height="150"
                    className="mb-3 rounded-2xl w-36 h-36"
                  />
                  <h3 className="text-lg text-gray-900 font-semibold">{product.name}</h3>
                  <p className="text-gray-800">Category: {product.category}</p>
                  <p className="text-gray-800">Stock: {product.restocks}</p>
                  <p className="text-blue-600 font-bold">Restocks: {product.salesQuantity}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Restocks;
