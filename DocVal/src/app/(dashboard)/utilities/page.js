"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  Typography,
  Card,
  CardContent,
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
    <Container maxWidth="lg" className="py-8 min-h-[80vh]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilities</h1>
          <h2 className="text-sm text-gray-600">
            Manage your utilities or create new entries
          </h2>
        </div>
      </div>

      {/* Tabs as Buttons */}
      <Stack direction="row" spacing={2} mb={3}>
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? "contained" : "outlined"}
            size="small"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
              ...(activeTab !== tab.id && {
                color: "#9CA3AF",
                borderColor: "#9CA3AF",
                "&:hover": {
                  borderColor: "#6B7280",
                  backgroundColor: "#f3f4f6",
                },
              }),
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Stack>

      {/* Tab Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <CircularProgress />
          </div>
        ) : (
          <>
            {activeTab === 0 && (
              <DivisionTab data={data} isActive={activeTab === 0} />
            )}
            {activeTab === 1 && (
              <ExternalTab data={data} isActive={activeTab === 1} />
            )}
            {activeTab === 2 && (
              <DocumentTypeTab data={data} isActive={activeTab === 2} />
            )}
            {activeTab === 3 && (
              <DocumentClassificationTab
                data={data}
                isActive={activeTab === 3}
              />
            )}
            {activeTab === 4 && (
              <AccountsTab data={data} isActive={activeTab === 4} />
            )}
          </>
        )}
      </div>
    </Container>
  );
}
