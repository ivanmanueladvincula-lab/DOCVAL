"use client";

import React from "react";
import { Dialog, CircularProgress, Box, Typography } from "@mui/material";
import { useLoading } from "@/helper/LoadingContext";

export default function LoadingDialog({ open }) {
  return (
    <Dialog
      open={open}
      onClose={() => {}} // Prevent closing on backdrop click
      disableEscapeKeyDown // Prevent closing with Escape key
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          minWidth: "300px",
        }}
      >
        <CircularProgress
          size={50}
          thickness={3}
          sx={{ mb: 2, color: "#3b82f6" }}
        />
        <Typography variant="body2" color="text.disabled">
          Loading...
        </Typography>
      </Box>
    </Dialog>
  );
}
