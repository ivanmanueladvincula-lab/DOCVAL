import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useError } from "@/helper/ErrorContext";
import axiosInstance from "@/helper/Axios";

export default function EditDocumentClassificationDialog({
  data,
  setData,
  setClassifications,
}) {
  const { setError } = useError();
  const [formData, setFormData] = useState({
    name: "",
  });
  const [errors, setErrors] = useState({ name: "" });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setFormData({ name: "" });
    setData((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (formData.name.trim() === "") {
      setErrors({ name: "Classification name is required." });
      return;
    }

    setLoading(true);
    axiosInstance
      .post("/document/editDocClass", {
        docClassId: data.id,
        newName: formData.name.trim(),
      })
      .then((res) => {
        // Update classifications list
        const newRecord = res.body;
        setClassifications((prev) =>
          prev.map((classification) =>
            classification.id === data.id
              ? { ...classification, name: newRecord.name }
              : classification
          )
        );
        setError("Document classification updated successfully!", "success");
        setTimeout(() => {
          setLoading(false);
          handleClose();
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
        setError(
          "Failed to update document classification. Please try again.",
          "error"
        );
        setLoading(false);
      });
  };

  return (
    <Dialog
      open={data.open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-classification-dialog-title"
    >
      <DialogTitle id="edit-classification-dialog-title">
        Edit Document Classification
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Classification name: {data.classificationName}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Confidential"
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
            />
          </Stack>
        </form>
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
            onClick={handleSubmit}
            type="submit"
            autoFocus
            color="success"
            size="small"
            variant="contained"
            disableElevation
            disabled={loading}
          >
            {loading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <span>Submitting...</span>
              </Stack>
            ) : (
              "Submit"
            )}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
