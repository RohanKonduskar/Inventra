import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Define types
interface Purchase {
  productId: string | number;
  timestamp: string;
  totalCost?: number;
  quantity?: number;
  unitCost?: number;
}

interface Product {
  productId: string | number;
  category: string;
}

interface PurchaseSummary {
  date: string;
  totalPurchased: number;
  totalQuantity: number;
  changePercentage: number;
}

const generateLastSevenDates = (): string[] => {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

const calculatePurchaseSummary = (
  purchases: Purchase[],
  products: Product[],
  selectedCategory: string
): PurchaseSummary[] => {
  if (!Array.isArray(purchases) || !Array.isArray(products)) {
    console.warn("Invalid purchases or products data received:", { purchases, products });
    return [];
  }

  const productMap: Record<string, string> = products.reduce((acc: Record<string, string>, product) => {
    if (product.productId && product.category) {
      acc[String(product.productId)] = product.category;
    }
    return acc;
  }, {});

  const filteredPurchases =
    selectedCategory === "All"
      ? purchases
      : purchases.filter((purchase) => productMap[String(purchase.productId)] === selectedCategory);

  const lastSevenDates = generateLastSevenDates();
  const dailySummary: Record<string, { totalPurchased: number; totalQuantity: number }> = lastSevenDates.reduce(
    (acc, date) => {
      acc[date] = { totalPurchased: 0, totalQuantity: 0 };
      return acc;
    },
    {} as Record<string, { totalPurchased: number; totalQuantity: number }>
  );

  filteredPurchases.forEach((purchase) => {
    if (!purchase.timestamp) return;
    const purchaseDate = new Date(purchase.timestamp).toISOString().split("T")[0];
    if (lastSevenDates.includes(purchaseDate)) {
      const cost =
        purchase.totalCost ?? (purchase.quantity && purchase.unitCost ? purchase.quantity * purchase.unitCost : 0);
      const quantity = purchase.quantity ?? 0;
      dailySummary[purchaseDate].totalPurchased += cost;
      dailySummary[purchaseDate].totalQuantity += quantity;
    }
  });

  return lastSevenDates.map((date, index) => {
    const totalPurchased = dailySummary[date]?.totalPurchased ?? 0;
    const totalQuantity = dailySummary[date]?.totalQuantity ?? 0;

    let changePercentage = 0;
    if (index > 0) {
      const prevTotal = dailySummary[lastSevenDates[index - 1]]?.totalPurchased ?? 0;
      changePercentage = prevTotal > 0 ? ((totalPurchased - prevTotal) / prevTotal) * 100 : 0;
    }

    return {
      date,
      totalPurchased,
      totalQuantity,
      changePercentage: parseFloat(changePercentage.toFixed(2)),
    };
  });
};

// ✅ Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const purchased = payload.find((p: any) => p.name === "totalPurchased");
    const quantity = payload.find((p: any) => p.name === "totalQuantity");
    console.log(quantity);

    return (
      <div className="bg-white border shadow rounded-md px-3 py-2 text-sm">
        <p className="font-semibold text-gray-800">{label}</p>
        {purchased && (
          <p className="text-blue-600">
            Purchased: ₹{purchased.value.toLocaleString("en")}
          </p>
        )}
        {quantity && (
          <p className="text-green-600">
            Quantity: {quantity.value.toLocaleString("en")}
          </p>
        )}
      </div>
    );
  }

  return null;
};

const CardPurchaseSummary = ({ selectedCategory }: { selectedCategory: string }) => {
  const { data, isLoading, isError, error } = useGetDashboardMetricsQuery();
  const [processedData, setProcessedData] = useState<PurchaseSummary[]>([]);

  useEffect(() => {
    if (data) {
      try {
        const purchases: Purchase[] = (Array.isArray(data?.Purchases) ? data.Purchases : []).map((purchase) => ({
          ...purchase,
          timestamp: new Date(purchase.timestamp).toISOString(),
        }));
        const products: Product[] = Array.isArray(data?.Products) ? data.Products : [];
        const result = calculatePurchaseSummary(purchases, products, selectedCategory);
        setProcessedData(result);
      } catch (err) {
        console.error("❌ Failed to process purchase data:", err);
        setProcessedData([]);
      }
    }
  }, [data, selectedCategory]);

  const purchaseSummary = processedData;
  const lastDataPoint = purchaseSummary.length > 0 ? purchaseSummary[purchaseSummary.length - 1] : null;
  const hasData = purchaseSummary.length > 0;

  if (isError) {
    return (
      <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl p-5">
        <div className="flex items-center text-red-500">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Failed to fetch purchase data: {error instanceof Error ? error.message : String(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">Loading purchase data...</div>
      ) : !hasData ? (
        <div className="m-5">
          <div className="text-amber-500 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            No purchase data available for this category in the last 7 days
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-2 px-7 pt-5">Purchase Summary</h2>
          <hr />

          <div className="mb-4 mt-7 px-7">
            <p className="text-xs text-gray-400">Purchased</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">
                {lastDataPoint && !isNaN(lastDataPoint.totalPurchased)
                  ? `₹${(lastDataPoint.totalPurchased as number).toLocaleString("en")}`
                  : "₹0.00"}
              </p>
              {lastDataPoint && !isNaN(lastDataPoint.changePercentage) && lastDataPoint.changePercentage !== 0 && (
                <p
                  className={`text-sm ${
                    lastDataPoint.changePercentage >= 0 ? "text-green-500" : "text-red-500"
                  } flex ml-3`}
                >
                  {lastDataPoint.changePercentage >= 0 ? (
                    <TrendingUp className="w-5 h-5 mr-1" />
                  ) : (
                    <TrendingDown className="w-5 h-5 mr-1" />
                  )}
                  {lastDataPoint.changePercentage.toFixed(2)}%
                </p>
              )}
            </div>
          </div>

          <hr />

          <ResponsiveContainer width="100%" height={350} className="px-7">
            <AreaChart data={purchaseSummary}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value: number) => `₹${(value / 1000).toFixed(2)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalPurchased"
                stroke="#3182ce"
                fill="#8884d8"
                dot={{ r: 3 }}
              />
              <Area
                type="monotone"
                dataKey="totalQuantity"
                stroke="transparent"
                fill="transparent"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;
