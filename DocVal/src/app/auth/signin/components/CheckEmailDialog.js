import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function CheckEmailDialog({ open, setOpen }) {
  const { setError } = useError();
  const route = useRouter();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({ email: "" });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setFormData({ email: "" });
    setErrors({ email: "" });
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: "" });

    // basic validation
    if (formData.email.trim() === "") {
      setErrors({ email: "Email is required" });
      setLoading(false);
      return;
    }

    // send otp
    axiosInstance
      .post("/auth/password/send_otp", { email: formData.email })
      .then((res) => {
        // console.log("OTP sent response:", res.body);
        setError(
          "OTP sent to your email. Redirecting to reset password...",
          "success",
        );
        setTimeout(() => {
          const params = new URLSearchParams();
          params.set("user_id", res.body.user_id);

          route.push(`/auth/resetPassword?${params.toString()}`); //pass user id from response of api
          setLoading(false);
          setOpen(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Error sending OTP:", err);
        setError(err.message, "error");
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="check-email-dialog-title"
    >
      <DialogTitle id="check-email-dialog-title">
        Forgot Password - Check Your Email
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter your email address associated with your account. We will
          send you an OTP to reset your password.
        </DialogContentText>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., user@example.com"
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!errors.email}
              helperText={errors.email}
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
