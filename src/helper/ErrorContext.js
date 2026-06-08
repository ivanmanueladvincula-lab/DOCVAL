"use client";

import { createContext, useContext, useState } from "react";

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
  const [errorData, setErrorData] = useState({
    open: false,
    message: "",
    severity: "info", // "error", "warning", "info", "success"
  });

  const setError = (message, severity = "error") => {
    setErrorData({
      open: true,
      message,
      severity,
    });
  };

  const clearError = () => {
    setErrorData({
      open: false,
      // message: "",
      // severity: "info",
    });
  };

  return (
    <ErrorContext.Provider value={{ errorData, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within ErrorProvider");
  }
  return context;
}
