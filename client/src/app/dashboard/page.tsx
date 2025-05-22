"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import CardPopularProducts from "./CardPopularProducts";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import Navbar from "@/app/(components)/Navbar"; // Adjust path if needed

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const router = useRouter();

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div>
      <Navbar onCategoryChange={handleCategoryChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto gap-10 pb-4 custom-grid-rows">
        <CardPopularProducts selectedCategory={selectedCategory} />
        <CardSalesSummary selectedCategory={selectedCategory} />
        <CardPurchaseSummary selectedCategory={selectedCategory} />
      </div>
    </div>
  );
};

export default Dashboard;
