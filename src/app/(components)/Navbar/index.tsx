"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { LogOut, Menu, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["All", "Shoes", "T-Shirts", "Sports Helmets", "Joggers", "Watches"];

const Navbar = ({ onCategoryChange }: { onCategoryChange: (category: string) => void }) => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const router = useRouter();

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const category = event.target.value;
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handleLogout = () => {
    // ✅ If you store login state in localStorage or cookies, clear it here
    // localStorage.removeItem("token") or cookies.delete() if using cookies

    router.push('http://localhost:3000'); // 👈 Redirect to login page
  };

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-3 py-2 border rounded bg-white text-gray-800"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">

      {/* <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button> */}
       <div
        onClick={handleLogout}
      >
        <LogOut className="cursor-pointer text-gray-500" /> {/* Logout Icon */}
      </div> 

        <button onClick={toggleDarkMode}>
          {isDarkMode ? (
            <Sun className="text-gray-500" size={24} />
          ) : (
            <Moon className="text-gray-500" size={24} />
          )}
        </button>


        <Link href="/settings">
          <Settings className="cursor-pointer text-gray-500" size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
