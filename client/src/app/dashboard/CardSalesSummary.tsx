// //in finaluse code
// import { useGetDashboardMetricsQuery } from "@/state/api";
// import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { Sales, Product } from "@/state/api";

// // Generate last 5 dates
// const generateLastFiveDates = () => {
//   const dates = [];
//   for (let i = 4; i >= 0; i--) {
//     const date = new Date();
//     date.setDate(date.getDate() - i);
//     dates.push(date.toISOString().split("T")[0]);
//   }
//   return dates;
// };

// // Calculate sales summary
// const calculateSalesSummary = (sales: Sales[], products: Product[], selectedCategory: string) => {
//   if (!Array.isArray(sales) || !Array.isArray(products)) {
//     console.warn("Invalid sales or products data received:", { sales, products });
//     return [];
//   }

//   console.log("🛍️ Selected Category:", selectedCategory);
//   console.log("📊 Sales Data:", sales);
//   console.log("📦 Products Data (Before Mapping):", products);

//   const productMap = products.reduce((acc, product) => {
//     if (product.productId && product.category) {
//       acc[String(product.productId)] = product.category;
//     }
//     return acc;
//   }, {} as Record<string, string>);

//   console.log("🗺️ Product Map (productId → category):", productMap);

//   const filteredSales = selectedCategory === "All"
//     ? sales
//     : sales.filter((sale) => productMap[String(sale.productId)] === selectedCategory);

//   console.log("🔍 Filtered Sales:", filteredSales);

//   const lastFiveDates = generateLastFiveDates();
//   const dailySummary: Record<string, { totalValue: number }> = lastFiveDates.reduce(
//     (acc, date) => {
//       acc[date] = { totalValue: 0 };
//       return acc;
//     }, {} as Record<string, { totalValue: number }>
//   );

//   filteredSales.forEach((sale) => {
//     if (!sale.timestamp) return;
    
//     const saleDate = new Date(sale.timestamp).toISOString().split("T")[0];
//     if (lastFiveDates.includes(saleDate)) {
//       dailySummary[saleDate].totalValue += sale.totalAmount || 0;
//     }
//   });

//   return lastFiveDates.map((date, index) => {
//     const totalValue = dailySummary[date].totalValue;
//     let changePercentage = 0;

//     if (index > 0) {
//       const prevTotal = dailySummary[lastFiveDates[index - 1]].totalValue;
//       changePercentage = prevTotal > 0 ? ((totalValue - prevTotal) / prevTotal) * 100 : 0;
//     }

//     return { date, totalValue, changePercentage };
//   });
// };

// const CardSalesSummary = ({ selectedCategory }: { selectedCategory: string }) => {
//   const { data, isLoading, isError, error } = useGetDashboardMetricsQuery();
//   const [processedData, setProcessedData] = useState<Array<{
//     date: string, 
//     totalValue: number, 
//     changePercentage: number
//   }>>([]);

//   useEffect(() => {
//     if (data) {
//       try {
//         console.log("🚀 API Response:", data);

//         if (!data.Products || !Array.isArray(data.Products)) {
//           console.warn("⚠️ `Products` is missing or not an array in API response:", data.Products);
//         }

//         const sales = Array.isArray(data?.Sales) ? data.Sales : [];
//         const products = Array.isArray(data?.Products) ? data.Products : [];

//         const result = calculateSalesSummary(sales, products, selectedCategory);
//         setProcessedData(result);
//       } catch (err) {
//         console.error("❌ Failed to process sales data:", err);
//         setProcessedData([]);
//       }
//     }
//   }, [data, selectedCategory]);

//   const salesSummary = processedData;
//   const lastDataPoint = salesSummary.length > 0 ? salesSummary[salesSummary.length - 1] : null;
//   const totalValueSum = salesSummary.reduce((acc, curr) => acc + curr.totalValue, 0);
//   const hasData = salesSummary.length > 0;
//   const averageChangePercentage = hasData
//     ? salesSummary.reduce((acc, curr) => acc + (curr.changePercentage || 0), 0) / salesSummary.length
//     : 0;

//   if (isError) {
//     return (
//       <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl p-5">
//         <div className="flex items-center text-red-500">
//           <AlertTriangle className="w-5 h-5 mr-2" />
//           Failed to fetch sales data: {error instanceof Error ? error.message : String(error)}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
//       {isLoading ? (
//         <div className="m-5">Loading sales data...</div>
//       ) : !hasData ? (
//         <div className="m-5">
//           <div className="text-amber-500 flex items-center">
//             <AlertTriangle className="w-5 h-5 mr-2" />
//             No sales data available for this category in the last 5 days
//           </div>
//         </div>
//       ) : (
//         <>
//           <h2 className="text-lg font-semibold mb-2 px-7 pt-5">Sales Summary</h2><hr></hr>

//           <div className="mb-4 mt-7 px-7">
//             <p className="text-xs text-gray-400">Sales</p>
//             <div className="flex items-center">
//               <p className="text-2xl font-bold">
//                 {lastDataPoint && !isNaN(lastDataPoint.totalValue)
//                   ? `₹${lastDataPoint.totalValue.toLocaleString("en")}`
//                   : "₹0.00"}
//               </p>
//               {lastDataPoint && !isNaN(lastDataPoint.changePercentage) && lastDataPoint.changePercentage !== 0 && (
//                 <p
//                   className={`text-sm ${
//                     lastDataPoint.changePercentage >= 0 ? "text-green-500" : "text-red-500"
//                   } flex ml-3`}
//                 >
//                   {lastDataPoint.changePercentage >= 0 ? (
//                     <TrendingUp className="w-5 h-5 mr-1" />
//                   ) : (
//                     <TrendingDown className="w-5 h-5 mr-1" />
//                   )}
//                   {lastDataPoint.changePercentage.toFixed(2)}%
//                 </p>
//               )}
//             </div>
//           </div><hr></hr>

//           <ResponsiveContainer width="100%" height={350} className="px-7">
//             <BarChart
//               data={salesSummary.map((item) => ({
//                 ...item,
//                 dateLabel: new Date(item.date).toLocaleDateString("en-US", {
//                   month: "numeric",
//                   day: "numeric",
//                 }),
//               }))}
//             >
//               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//               <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
//               <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fontSize: 12 }} />
//               <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]} />
//               <Bar dataKey="totalValue" fill="#3182ce" barSize={20} radius={[10, 10, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </>
//       )}
//     </div>
//   );
// };

// export default CardSalesSummary;

import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sales, Product } from "@/state/api";

// Generate last 5 dates
const generateLastFiveDates = () => {
  const dates = [];
  for (let i = 4; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

// Calculate sales summary with quantity
const calculateSalesSummary = (
  sales: Sales[],
  products: Product[],
  selectedCategory: string
) => {
  if (!Array.isArray(sales) || !Array.isArray(products)) {
    console.warn("Invalid sales or products data received:", { sales, products });
    return [];
  }

  const productMap = products.reduce((acc, product) => {
    if (product.productId && product.category) {
      acc[String(product.productId)] = product.category;
    }
    return acc;
  }, {} as Record<string, string>);

  const filteredSales =
    selectedCategory === "All"
      ? sales
      : sales.filter(
          (sale) => productMap[String(sale.productId)] === selectedCategory
        );

  const lastFiveDates = generateLastFiveDates();
  const dailySummary: Record<string, { totalValue: number; totalQuantity: number }> =
    lastFiveDates.reduce((acc, date) => {
      acc[date] = { totalValue: 0, totalQuantity: 0 };
      return acc;
    }, {} as Record<string, { totalValue: number; totalQuantity: number }>);

  filteredSales.forEach((sale) => {
    if (!sale.timestamp) return;

    const saleDate = new Date(sale.timestamp).toISOString().split("T")[0];
    if (lastFiveDates.includes(saleDate)) {
      dailySummary[saleDate].totalValue += sale.totalAmount || 0;
      dailySummary[saleDate].totalQuantity += sale.quantity || 0;
    }
  });

  return lastFiveDates.map((date, index) => {
    const { totalValue, totalQuantity } = dailySummary[date];
    let changePercentage = 0;

    if (index > 0) {
      const prevTotal = dailySummary[lastFiveDates[index - 1]].totalValue;
      changePercentage = prevTotal > 0 ? ((totalValue - prevTotal) / prevTotal) * 100 : 0;
    }

    return { date, totalValue, totalQuantity, changePercentage };
  });
};

// ✅ Custom tooltip for hover
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-sm text-blue-500">
          <span className="font-medium">Sales:</span> ₹{data.totalValue.toLocaleString()}
        </p>
        <p className="text-sm text-green-600">
          <span className="font-medium">Quantity:</span> {data.totalQuantity}
        </p>
      </div>
    );
  }

  return null;
};

const CardSalesSummary = ({ selectedCategory }: { selectedCategory: string }) => {
  const { data, isLoading, isError, error } = useGetDashboardMetricsQuery();
  const [processedData, setProcessedData] = useState<
    Array<{
      date: string;
      totalValue: number;
      totalQuantity: number;
      changePercentage: number;
    }>
  >([]);

  useEffect(() => {
    if (data) {
      try {
        const sales = Array.isArray(data?.Sales) ? data.Sales : [];
        const products = Array.isArray(data?.Products) ? data.Products : [];

        const result = calculateSalesSummary(sales, products, selectedCategory);
        setProcessedData(result);
      } catch (err) {
        console.error("❌ Failed to process sales data:", err);
        setProcessedData([]);
      }
    }
  }, [data, selectedCategory]);

  const salesSummary = processedData;
  const lastDataPoint =
    salesSummary.length > 0 ? salesSummary[salesSummary.length - 1] : null;
  const hasData = salesSummary.length > 0;

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">Loading sales data...</div>
      ) : isError ? (
        <div className="m-5 text-red-500 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Failed to fetch sales data:{" "}
          {error instanceof Error ? error.message : String(error)}
        </div>
      ) : !hasData ? (
        <div className="m-5 text-amber-500 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          No sales data available for this category in the last 5 days
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-2 px-7 pt-5">Sales Summary</h2>
          <hr />

          <div className="mb-4 mt-7 px-7">
            <p className="text-xs text-gray-400">Sales</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">
                ₹
                {lastDataPoint && !isNaN(lastDataPoint.totalValue)
                  ? lastDataPoint.totalValue.toLocaleString("en")
                  : "0.00"}
              </p>
              {lastDataPoint &&
                !isNaN(lastDataPoint.changePercentage) &&
                lastDataPoint.changePercentage !== 0 && (
                  <p
                    className={`text-sm ${
                      lastDataPoint.changePercentage >= 0
                        ? "text-green-500"
                        : "text-red-500"
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
            <BarChart
              data={salesSummary.map((item) => ({
                ...item,
                dateLabel: new Date(item.date).toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                }),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `₹${value / 1000}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="totalValue"
                fill="#3182ce"
                barSize={20}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;
