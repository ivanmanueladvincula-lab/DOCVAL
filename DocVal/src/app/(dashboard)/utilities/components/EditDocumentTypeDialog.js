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

export default function EditDocumentTypeDialog({
  data,
  setData,
  setDocumentTypes,
}) {
  const { setError } = useError();
  const [formData, setFormData] = useState({
    name: "",
  });
  const [errors, setErrors] = useState({ name: "" });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setFormData({ name: "" });
    setErrors({ name: "" });
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
    // Add your submit logic here
    // console.log("data:", data);
    // console.log("Form submitted with data:", formData);
    // Validation
    if (formData.name.trim() === "") {
      setErrors({ name: "Document type name is required." });
      return;
    }

    setLoading(true);
    axiosInstance
      .post("/document/editDocType", {
        docTypeId: data.id,
        newName: formData.name.trim(),
      })
      .then((res) => {
        // Update document types list
        const updatedType = res.body;
        setDocumentTypes((prev) =>
          prev.map((type) => (type.id === data.id ? updatedType : type))
        );
        setError("Document type updated successfully!", "success");
        setLoading(false);
        handleClose();
      })
      .catch((err) => {
        setError("Failed to update document type. Please try again.", "error");
        setLoading(false);
      });
  };

  return (
    <Dialog
      open={data.open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-document-type-dialog-title"
    >
      <DialogTitle id="edit-document-type-dialog-title">
        Edit Document Type
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Document type name: {data.documentTypeName}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Invoice"
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
