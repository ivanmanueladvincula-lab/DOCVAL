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

export default function DeleteDocumentClassificationDialog({
  deleteDocClass,
  setDeleteDocClass,
  setClassifications,
}) {
  const { setError } = useError();
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleClose = () => {
    setDeleteDocClass((prev) => ({
      ...prev,
      open: false,
    }));
    setAcknowledged(false);
  };

  const handleDelete = () => {
    if (!acknowledged) {
      setError(
        "You must acknowledge that this action cannot be undone.",
        "error"
      );
      return;
    }

    setLoading(true);
    axiosInstance
      .post("/document/deleteDocClass", { docClassId: deleteDocClass.docClassId })
      .then((res) => {
        setClassifications((prevClassifications) =>
          prevClassifications.filter(
            (docClass) => docClass.id !== deleteDocClass.docClassId
          )
        );
        setError("Document classification deleted successfully!", "success");
        setTimeout(() => {
          setLoading(false);
          handleClose();
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to delete the document classification. Please try again.", "error");
        setLoading(false);
      });
  };

  return (
    <Dialog
      open={deleteDocClass.open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="delete-docclass-dialog-title"
    >
      <DialogTitle id="delete-docclass-dialog-title">
        Confirm Deletion
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Are you sure you want to delete this document classification?
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Classification name: <strong>{deleteDocClass.docClassName}</strong>
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
