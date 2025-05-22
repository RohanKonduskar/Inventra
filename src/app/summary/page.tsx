"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/app/(components)/Navbar";
import "./style.css";

interface SummaryData {
  category: string;
  soldQuantity: number;
  purchasedQuantity: number;
  earning: number;
  spending: number;
}

const Summary = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState(false);

  const periods = ["Today", "This Week", "This Month"];

  const fetchSummaryData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNoData(false);

      const response = await fetch(
        `http://localhost:8000/summary?period=${encodeURIComponent(selectedPeriod)}&category=${encodeURIComponent(selectedCategory)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data: SummaryData[] = await response.json();

      if (!data || data.length === 0) {
        setNoData(true);
        setSummaryData([]);
        return;
      }

      setSummaryData(data);
    } catch (error) {
      setError("Error fetching summary data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, selectedCategory]);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  // Combine data for "All" categories
  const combinedData =
    selectedCategory === "All"
      ? summaryData.reduce(
          (acc, item) => {
            acc.soldQuantity += item.soldQuantity;
            acc.purchasedQuantity += item.purchasedQuantity;
            acc.earning += item.earning;
            acc.spending += item.spending;
            return acc;
          },
          {
            soldQuantity: 0,
            purchasedQuantity: 0,
            earning: 0,
            spending: 0,
          }
        )
      : null;

  return (
    <div className="summary-page">
      <Navbar onCategoryChange={(category) => setSelectedCategory(category)} />

      <div className="header">
        <h1>Summary</h1>
        <p>A representation of summary over time.</p>
      </div>

      <div className="summary-container">
        <div className="period-selector">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            {periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : noData ? (
          <div>
            <br />
            <br />
            No data available for this selection
          </div>
        ) : (
          <div>
            {selectedCategory === "All" ? (
              <div className="summary-data">
                <div className="summary-card">
                  <h3>Sold Quantity</h3>
                  <p>{combinedData?.soldQuantity}</p>
                </div>
                <div className="summary-card">
                  <h3>Purchased Quantity</h3>
                  <p>{combinedData?.purchasedQuantity}</p>
                </div>
                <div className="summary-card">
                  <h3>Earning</h3>
                  <p>₹{combinedData?.earning.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                  <h3>Spending</h3>
                  <p>₹{combinedData?.spending.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              summaryData.map((data) => (
                <div key={data.category} className="summary-data">
                  <div className="summary-card">
                    <h3>Sold Quantity</h3>
                    <p>{data.soldQuantity}</p>
                  </div>
                  <div className="summary-card">
                    <h3>Purchased Quantity</h3>
                    <p>{data.purchasedQuantity}</p>
                  </div>
                  <div className="summary-card">
                    <h3>Earning</h3>
                    <p>₹{data.earning.toFixed(2)}</p>
                  </div>
                  <div className="summary-card">
                    <h3>Spending</h3>
                    <p>₹{data.spending.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
