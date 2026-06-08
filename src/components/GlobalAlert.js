"use client";

import { Alert, Snackbar } from "@mui/material";
import { useError } from "@/helper/ErrorContext";
import { useEffect, useState } from "react";

export default function GlobalAlert() {
  const { errorData, clearError } = useError();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    clearError();
  };

  return (
    <Snackbar
      open={errorData.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={handleClose} severity={errorData.severity}>
        {errorData.message}
      </Alert>
    </Snackbar>
  );
}
