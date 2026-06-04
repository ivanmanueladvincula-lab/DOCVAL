import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import React, { useState, useEffect } from "react";

export default function NewDivDialog({ open, setOpen, setDivisions }) {
  const { setError } = useError();
  const [formData, setFormData] = useState({
    name: "",
    abrv: "",
    office_type: "",
    parent_office: "",
  });
  const [errors, setErrors] = useState({ name: "", abrv: "", office_type: "" });
  const [loading, setLoading] = useState(false);
  const [divisions, setDivisionsData] = useState([]);
  const [fetchingDivisions, setFetchingDivisions] = useState(false);

  // Fetch divisions on component mount
  useEffect(() => {
    if (open) {
      fetchDivisions();
    }
  }, [open]);

  const fetchDivisions = async () => {
    setFetchingDivisions(true);
    axiosInstance
      .get("/office/getAllDivision")
      .then((res) => {
        setDivisionsData(res.body);
        setFetchingDivisions(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch divisions. Please try again.", "error");
        setFetchingDivisions(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", abrv: "", office_type: "", parent_office: "" });
    setErrors({ name: "", abrv: "", office_type: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = { name: "", abrv: "", office_type: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.abrv.trim()) {
      newErrors.abrv = "Abbreviation is required";
      isValid = false;
    }

    if (!formData.office_type) {
      newErrors.office_type = "Office type is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields", "error");
      return;
    }

    console.log("Form submitted:", formData);

    setLoading(true);
    axiosInstance
      .post("/office/createDivision", formData)
      .then((res) => {
        setDivisions((prev) => [...prev, ...res.body]);
        setError("Division added successfully!", "success");
        setFormData({ name: "", abrv: "", office_type: "", parent_office: "" });
        setErrors({ name: "", abrv: "", office_type: "" });
        setTimeout(() => {
          setOpen(false);
          setLoading(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
        setError("Submission failed. Please try again.", "error");
        setLoading(false);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="new-division-dialog-title"
      aria-describedby="new-division-dialog-description"
    >
      <DialogTitle id="new-division-dialog-title">Add a New Office</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Finance Division"
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
            />
            <TextField
              label="Abbreviation"
              name="abrv"
              value={formData.abrv}
              onChange={handleInputChange}
              placeholder="e.g., FIN"
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!errors.abrv}
              helperText={errors.abrv}
              disabled={loading}
            />
            <FormControl
              required
              fullWidth
              size="small"
              error={!!errors.office_type}
            >
              <InputLabel id="office-type-label">Office Type</InputLabel>
              <Select
                labelId="office-type-label"
                label="Office Type"
                name="office_type"
                value={formData.office_type}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={loading}
              >
                <MenuItem value="internal">Internal (DICT)</MenuItem>
                <MenuItem value="external">External</MenuItem>
              </Select>
            </FormControl>

            {errors.office_type && (
              <span
                style={{
                  color: "#d32f2f",
                  fontSize: "0.75rem",
                  marginTop: "-8px",
                }}
              >
                {errors.office_type}
              </span>
            )}

            {formData.office_type === "internal" && (
              <Autocomplete
                options={divisions.filter(
                  (div) =>
                    div.office_type === "internal" && div.parent_id === null,
                )}
                getOptionLabel={(option) => option.division_name || ""}
                value={
                  divisions.find((d) => d.id === formData.parent_office) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    parent_office: newValue?.id || "",
                  }));
                }}
                fullWidth
                size="small"
                disabled={loading || fetchingDivisions}
                noOptionsText="No parent offices available"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search Parent Office (Optional)"
                  />
                )}
              />
            )}
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
