import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

// Interfaces for database schema
export interface Product {
  price: any;
  rating: any;
  productId: string;
  name: string;
  stockQuantity: number;
  // quantity:number;
  restocks: number; // New field to store the calculated restocks
  category:string;
  imageUrl: string | StaticImport;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  category:string;
  imageUrl: string | StaticImport;
}


export interface Sales{
  timestamp: string | number | Date;
  salesId:string;
  productId:string;
  quantity:number;
  unitPrice:number;
  totalAmount:number;
}

export interface Purchases{
  purchaseId:string;
  productId:string;
  quntity:number;
  unitCost:number;
  totalCost:number;
  timestamp: string | number | Date;
}


export interface SummaryData {
  Products: Product[];
  soldQuantity: number;
  purchasedQuantity: number;
  earning: number;
  spending: number;
  category: string;
}

export interface DashboardMetrics {
  Products: Product[];
  PopularItems: never[];
  popularProducts:{ category: string; products: Product[] }[]
  Sales:Sales[];
  Purchases:Purchases[];
  salesQuantity:number;
}

// Interface for restocks, similar to Product but with a focus on restock details
export interface Restock {
  productId: string; // ID of the product being restocked
  name: string; // Name of the product
  stockQuantity: number; // Current stock quantity of the product
  restocks: number; // The number of times the product has been restocked
}

// API Configuration
export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000' }), // Updated to backend base URL
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Summary", "Restocks"],
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),

    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),

    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),

    
    getSummaryByPeriod: build.query<SummaryData, string>({
      query: (period) => ({
        url: `/summary`, // Updated to match backend route
        params: { period },
      }),
      providesTags: ["Summary"],
    }),

    // New endpoint for fetching restocked products
    getRestocks: build.query<Restock[], void>({
      query: () => "/restocks", // New route to fetch restocked products
      providesTags: ["Restocks"],
    }),
  }),
});

// Hooks for components
export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useGetSummaryByPeriodQuery,
  useGetRestocksQuery, // New hook for getting restocks
} = api;
