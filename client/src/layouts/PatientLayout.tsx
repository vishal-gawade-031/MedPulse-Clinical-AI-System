import React from "react";
import { Outlet } from "react-router-dom";
import { EmergencyBar } from "../components/layout/EmergencyBar";
import { Navbar } from "../components/layout/Navbar";
import { DisclaimerBanner } from "../components/layout/DisclaimerBanner";
import { Footer } from "../components/layout/Footer";

export const PatientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-clinical-bg text-clinical-text">
      <EmergencyBar />
      <Navbar />
      <DisclaimerBanner />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
