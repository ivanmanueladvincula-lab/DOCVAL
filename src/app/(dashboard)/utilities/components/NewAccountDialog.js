import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import {
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import React, { useState, useEffect } from "react";

export default function NewAccountDialog({ open, setOpen, setAccounts }) {
  const { setError } = useError();
  const [formData, setFormData] = useState({
    f_name: "",
    m_name: "",
    l_name: "",
    email: "",
    role: [],
    division_id: "",
  });
  const [divisions, setDivisions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({
    f_name: "",
    m_name: "",
    l_name: "",
    email: "",
    role: "",
    division_id: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Fetch divisions
      axiosInstance
        .get("/office/getAllDivision")
        .then((res) => {
          const internal = res.body.filter(
            (div) =>
              div.office_type.toLowerCase() === "internal" &&
              div.parent_id !== null,
          );
          setDivisions(internal);
          //
        })
        .catch((err) => {
          console.error(err);
        });

      axiosInstance
        .get("/roles/getAllRoles")
        .then((res) => {
          // console.log("Fetched roles:", res.body);
          setRoles(res.body);
        })
        .catch((err) => {
          setError("Failed to fetch roles. Please try again.");
          console.error(err);
        });
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setFormData({
      f_name: "",
      m_name: "",
      l_name: "",
      email: "",
      role: [],
      division_id: "",
    });
    setErrors({
      f_name: "",
      m_name: "",
      l_name: "",
      email: "",
      role: "",
      division_id: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      const nextValue = typeof value === "string" ? value.split(",") : value;
      setFormData((prev) => ({
        ...prev,
        [name]: nextValue,
      }));
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
      return;
    }
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
    const newErrors = {
      f_name: "",
      m_name: "",
      l_name: "",
      email: "",
      role: "",
      division_id: "",
    };
    let isValid = true;

    if (!formData.f_name.trim()) {
      newErrors.f_name = "First name is required";
      isValid = false;
    }

    if (!formData.m_name.trim()) {
      newErrors.m_name = "Middle name is required";
      isValid = false;
    }

    if (!formData.l_name.trim()) {
      newErrors.l_name = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.role || formData.role.length === 0) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    if (!formData.division_id) {
      newErrors.division_id = "Division is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const generatePassword = (email) => {
    // Extract the part before @ symbol and take first 3 characters
    // const emailPrefix = email.split("@")[0].slice(0, 3).toUpperCase();
    // const emailPrefix = email.split("@")[0].toUpperCase();
    // remove special characters from emailPrefix
    const emailPrefix = email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

    // Generate a random 4-digit number
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    // Generate a random special character
    const specialChars = ["@", "#", "$", "&"];
    const randomSpecial =
      specialChars[Math.floor(Math.random() * specialChars.length)];

    // Combine all parts to create password
    const password = `#${emailPrefix}123`;

    return password;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    let password = generatePassword(formData.email);
    axiosInstance
      .post("/auth/register", {
        f_name: formData.f_name,
        m_name: formData.m_name,
        l_name: formData.l_name,
        email: formData.email,
        role: formData.role,
        password: password,
        division: formData.division_id,
      })
      .then((res) => {
        // console.log("Account created:", res);
        setAccounts((prev) => [
          ...prev,
          {
            id: res.body[0].id,
            full_name: res.body[0].full_name,
            email: res.body[0].email,
            division_name: res.body[0].division,
            role: res.body[0].role,
          },
        ]);
        setFormData({
          f_name: "",
          m_name: "",
          l_name: "",
          email: "",
          role: [],
          division_id: "",
        });
        setErrors({
          f_name: "",
          m_name: "",
          l_name: "",
          email: "",
          role: "",
          division_id: "",
        });
        if (res.status === 210) {
          setError(res.message, "warning");
        } else {
          setError("Account added successfully!", "success");
        }

        setTimeout(() => {
          setOpen(false);
          setLoading(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err.message, err);
        setError(
          err.message || "Submission failed. Please try again.",
          "error",
        );
        setLoading(false);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="new-account-dialog-title"
    >
      <DialogTitle id="new-account-dialog-title">Add a New Account</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="First Name"
              name="f_name"
              value={formData.f_name}
              onChange={handleInputChange}
              placeholder="e.g., John"
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!errors.f_name}
              helperText={errors.f_name}
              disabled={loading}
            />
            <TextField
              label="Middle Name"
              name="m_name"
              value={formData.m_name}
              onChange={handleInputChange}
              placeholder="e.g., James"
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!errors.m_name}
              helperText={errors.m_name}
              disabled={loading}
            />
            <TextField
              label="Last Name"
              name="l_name"
              value={formData.l_name}
              onChange={handleInputChange}
              placeholder="e.g., Doe"
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!errors.l_name}
              helperText={errors.l_name}
              disabled={loading}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., john@example.com"
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />
            <FormControl
              fullWidth
              size="small"
              error={!!errors.role}
              disabled={loading}
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
                multiple
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((roleId) => {
                      const role = roles.find((r) => r.id === roleId);
                      return (
                        <Chip
                          key={roleId}
                          label={role?.name || roleId}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                <MenuItem value="" disabled>
                  <em>Select a role</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && (
                <p
                  style={{
                    color: "#d32f2f",
                    fontSize: "0.75rem",
                    marginTop: "4px",
                  }}
                >
                  {errors.role}
                </p>
              )}
            </FormControl>
            <Autocomplete
              options={divisions}
              getOptionLabel={(option) => option.division_name || ""}
              value={
                divisions.find((d) => d.id === formData.division_id) || null
              }
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  division_id: newValue?.id || "",
                }));
              }}
              fullWidth
              size="small"
              noOptionsText="No divisions available"
              renderInput={(params) => (
                <TextField {...params} placeholder="Search Division" />
              )}
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
