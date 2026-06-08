import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Divider,
  Box,
  Chip,
} from "@mui/material";
import React, { useState } from "react";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

export default function ConfirmExternalDocumentDialog({
  open,
  setOpen,
  formData,
  onConfirm,
}) {
  const { setError } = useError();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    console.log("Submitting external document...", formData);

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });

    const fileBase64 = await toBase64(formData.file);

    // Submit external document
    axiosInstance
      .post("/document/createFile", {
        reference_no: formData.refno,
        title: formData.title,
        doc_type: formData.type,
        doc_class: formData.classification,
        sender_office: formData.sender_office,
        receiving_office: formData.receiving_office,
        sender_person: formData.sender_person,
        sender_email: formData.sender_email,
        sender_phone: formData.sender_phone,
        base64_data: fileBase64,
        office_type: formData.office_type,
      })
      .then((res) => {
        onConfirm();
        setLoading(false);
        setError("Document submitted for evaluation successfully!", "success");
      })
      .catch((error) => {
        console.error("Error submitting external document:", error);
        setLoading(false);
        setError(
          error.message || "An error occurred while submitting the document.",
          "error",
        );
      });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="confirm-external-document-dialog-title"
    >
      <DialogTitle id="confirm-external-document-dialog-title">
        Confirm External Document Submission
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Document Details Section */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Document Details
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Reference No.:
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formData.refno || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Title:
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formData.title || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Classification:
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formData.classification_name || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Document Type:
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formData.type_name || "—"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Sender Details Section */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Sender Information
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Sender Office:
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formData.sender_office_name || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Contact Person:
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formData.sender_person || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Email:
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formData.sender_email || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Phone:
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formData.sender_phone || "—"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Receiving Office Section */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Receiving Office
            </Typography>
            <Typography variant="body2" fontWeight="500">
              {formData.receiving_office_name || "—"}
            </Typography>
          </Box>

          <Divider />

          {/* File Section */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Attached File
            </Typography>
            <Chip
              label={`${formData.file?.name ?? "—"} (${(
                (formData.file?.size ?? 0) /
                (1024 * 1024)
              ).toFixed(2)} MB)`}
              variant="outlined"
              icon={<PictureAsPdfRoundedIcon color="error" />}
              sx={{ borderStyle: "dashed", bgcolor: "#f7f7f7ff" }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Stack
          direction="row"
          sx={{ width: "100%" }}
          justifyContent="space-between"
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            size="small"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            size="small"
            color="success"
            disabled={loading}
            loading={loading}
            disableElevation
          >
            Confirm
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
