import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

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
      setError(
        "You must acknowledge that this action cannot be undone.",
        "error",
      );
      return;
    }

    setLoading(true);
    axiosInstance
      .post("/user/deleteAccount", { userId: data.userId })
      .then((res) => {
        setAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account.id !== data.userId),
        );
        setError("Account deleted successfully!", "success");
        setTimeout(() => {
          setLoading(false);
          handleClose();
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete the account. Please try again.";
        setError(message, "error");
        setLoading(false);
      });
  };

  return (
    <Dialog
      open={data.open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="delete-account-dialog-title"
    >
      <DialogTitle id="delete-account-dialog-title">
        Confirm Deletion
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Are you sure you want to delete this account?
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Account: <strong>{data.email}</strong>
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={loading}
            />
          }
          label="I understand this action cannot be undone"
        />
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Button
            onClick={handleClose}
            color="error"
            size="small"
            variant="outlined"
            disableElevation
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            autoFocus
            color="error"
            size="small"
            variant="contained"
            disableElevation
            disabled={loading || !acknowledged}
          >
            {loading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <span>Deleting...</span>
              </Stack>
            ) : (
              "Delete"
            )}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
