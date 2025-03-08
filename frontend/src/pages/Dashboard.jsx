import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Ecommerce from "./Ecommerce";
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import ThemeSettings from "../components/ThemeSettings";

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState(true);
  const [themeSettings, setThemeSettings] = useState(false);
  const [currentColor, setCurrentColor] = useState("#1A202C"); // Default color

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      {/* Settings Button */}
      <div className="fixed right-4 bottom-4 z-50">
        <TooltipComponent content="Settings" position="Top">
          <button
            type="button"
            onClick={() => setThemeSettings(true)}
            style={{ background: currentColor, borderRadius: "50%" }}
            className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
          >
            <FiSettings />
          </button>
        </TooltipComponent>
      </div>

      {/* Sidebar */}
      {activeMenu && (
        <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className={
        activeMenu
          ? "dark:bg-main-dark-bg bg-main-bg min-h-screen md:ml-72 w-full"
          : "bg-main-bg dark:bg-main-dark-bg w-full min-h-screen flex-2"
      }>
        <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
          <Navbar />
        </div>

        <div>
          {themeSettings && <ThemeSettings />}
          <Routes>
            <Route path="/myprofile" element={<Ecommerce />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
