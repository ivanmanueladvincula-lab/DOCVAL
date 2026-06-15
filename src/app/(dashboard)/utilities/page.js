"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Container,
} from "@mui/material";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import { useLoading } from "@/helper/LoadingContext";
import DivisionTab from "@/app/(dashboard)/utilities/components/tabs/DivisionTab";
import DocumentTypeTab from "./components/tabs/DocumentTypeTab";
import DocumentClassificationTab from "./components/tabs/DocumentClassificationTab";
import AccountsTab from "./components/tabs/AccountsTab";
import ExternalTab from "./components/tabs/ExternalTab";

export default function utilities() {
  const { session, status, isChecking } = useProtectedRoute();
  const { startLoading, stopLoading } = useLoading();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isChecking) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [isChecking, startLoading, stopLoading]);

  const tabs = [
    { label: "DICT Offices", id: 0 },
    { label: "External Offices", id: 1 },
    { label: "Document Type", id: 2 },
    { label: "Document Classification", id: 3 },
    { label: "Accounts", id: 4 },
  ];

  return (
    // Added Tailwind dark mode text classes to the main container
    <Container maxWidth="lg" className="py-8 min-h-[80vh] text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Utilities</h1>
          <h2 className="text-sm text-gray-600 dark:text-gray-400">
            Manage your utilities or create new entries
          </h2>
        </div>
      </div>

      {/* Modern Segmented Control for Tabs (replaces the outlined buttons) */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg min-w-max w-fit">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <CircularProgress />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {activeTab === 0 && <DivisionTab data={data} isActive={activeTab === 0} />}
            {activeTab === 1 && <ExternalTab data={data} isActive={activeTab === 1} />}
            {activeTab === 2 && <DocumentTypeTab data={data} isActive={activeTab === 2} />}
            {activeTab === 3 && <DocumentClassificationTab data={data} isActive={activeTab === 3} />}
            {activeTab === 4 && <AccountsTab data={data} isActive={activeTab === 4} />}
          </div>
        )}
      </div>
    </Container>
  );
}