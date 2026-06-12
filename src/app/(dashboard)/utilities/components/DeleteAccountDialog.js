"use client";
import React, { useState } from "react";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import { CircularProgress } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function DeleteAccountDialog({ data, setData, setAccounts }) {
  const { setError } = useError();
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleClose = () => {
    setData((prev) => ({
      ...prev,
      open: false,
    }));
    setAcknowledged(false);
  };

  const handleDelete = () => {
    if (!acknowledged) {
      setError("You must acknowledge that this action cannot be undone.", "error");
      return;
    }

    setLoading(true);
    axiosInstance
      .post("/user/deleteAccount", { userId: data.userId })
      .then((res) => {
        setAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account.id !== data.userId)
        );
        setError("Account deleted successfully!", "success");
        setTimeout(() => {
          setLoading(false);
          handleClose();
        }, 1500);
      })
      .catch((err) => {
        // Extract the detailed 409 message we sent from the backend
        const serverMessage = err.response?.data?.message || "You Cannot Delete This Account. Please contact support.";
        // Show that specific message to the user
        setError(serverMessage, "error");
        setLoading(false);
        handleClose(); // Close the modal so they can clearly read the error toast
      });
  };

  if (!data.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header (Red Warning Theme) */}
        <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-800/30 flex items-center gap-3">
          <WarningAmberRoundedIcon className="text-red-600 dark:text-red-500" />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400 tracking-tight">
            Confirm Deletion
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 text-slate-700 dark:text-slate-300 space-y-5">
          <p className="text-sm font-medium">
            Are you sure you want to delete this account? This action will permanently remove all access credentials from the system.
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Target Account</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 break-all">{data.email}</p>
          </div>

          <label className="flex items-start gap-3 mt-4 cursor-pointer group">
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-red-600 bg-white border-slate-300 rounded focus:ring-red-600 dark:focus:ring-red-500 dark:ring-offset-slate-900 dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
              />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors select-none">
              I understand that deleting this account is permanent and cannot be undone.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || !acknowledged}
            className="flex items-center justify-center min-w-[130px] px-4 py-2 text-sm font-bold text-white bg-red-600 dark:bg-red-500 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <CircularProgress size={16} color="inherit" />
                Deleting...
              </span>
            ) : (
              "Delete Account"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}