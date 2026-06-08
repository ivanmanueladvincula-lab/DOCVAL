"use client";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import LoadingScreen from "@/components/LoadingScreen";
import React, { useEffect, useState, useRef } from "react";
import {
  Card, CardContent, TextField, Button, Typography,
  Box, Divider, Avatar, IconButton, CircularProgress, Stack,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";

export default function Profile() {
  const { session, status, isChecking } = useProtectedRoute();
  const { setError } = useError();
  const fileInputRef = useRef(null);
  const [profileImg, setProfileImg] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [personalFormData, setPersonalFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    curPass: "",
    newPass: "",
    conPass: "",
  });
  const [personalLoading, setPersonalLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setPersonalFormData({
        firstname: session.user.f_name || "",
        middlename: session.user.m_name || "",
        lastname: session.user.l_name || "",
      });
      // ✅ Fetch profile image from DB since it's not in session
      fetchProfileImg();
    }
  }, [session]);

  // ✅ Fetch latest profile image from DB
  const fetchProfileImg = async () => {
    if (!session?.user?.id) return;
    axiosInstance
      .post("/user/getUserDetail", { userId: session.user.id })
      .then((res) => {
        setProfileImg(res.body?.profile_img || null);
      })
      .catch(() => {});
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    setProfileImg(previewUrl);

    setImgLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", session?.user?.id);

    try {
      const res = await fetch("/api/user/updateProfileImg", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // ✅ Set the Cloudinary URL after upload
      setProfileImg(data.url);
      setError("Profile image updated!", "success");
    } catch (err) {
      setError(err.message || "Failed to upload image.", "error");
      setImgLoading(false);
    } finally {
      setImgLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!personalFormData.firstname.trim() || !personalFormData.lastname.trim()) {
      setError("First and last name are required", "warning");
      return;
    }
    setPersonalLoading(true);
    axiosInstance
      .post("/user/editUser", {
        userId: session?.user?.id,
        newFName: personalFormData.firstname,
        newMName: personalFormData.middlename,
        newLName: personalFormData.lastname,
      })
      .then(() => {
        setError("Profile updated successfully!", "success");
        setPersonalLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to update profile.", "error");
        setPersonalLoading(false);
      });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordFormData.newPass !== passwordFormData.conPass) {
      setError("New passwords do not match", "warning");
      return;
    }
    if (passwordFormData.newPass.length < 8) {
      setError("Password must be at least 8 characters", "warning");
      return;
    }
    setPasswordLoading(true);
    axiosInstance
      .post("/auth/password/reset", {
        userId: session?.user?.id,
        currentPassword: passwordFormData.curPass,
        newPassword: passwordFormData.newPass,
      })
      .then(() => {
        setError("Password changed successfully!", "success");
        setPasswordFormData({ curPass: "", newPass: "", conPass: "" });
        setPasswordLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to change password.", "error");
        setPasswordLoading(false);
      });
  };

  const handleChangePersonal = (e) => {
    const { name, value } = e.target;
    setPersonalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePass = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isChecking) return <LoadingScreen />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Profile Image Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 1 }}>
            Profile Photo
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Stack direction="row" alignItems="center" spacing={3}>
            <Box position="relative">
              <Avatar
                src={profileImg}
                sx={{ width: 100, height: 100, fontSize: 36 }}
              >
                {!profileImg && (session?.user?.f_name?.[0]?.toUpperCase() || "U")}
              </Avatar>
              <IconButton
                onClick={handleImageClick}
                disabled={imgLoading}
                sx={{
                  position: "absolute", bottom: 0, right: 0,
                  backgroundColor: "#1976d2", color: "#fff",
                  width: 30, height: 30,
                  "&:hover": { backgroundColor: "#1565c0" },
                }}
              >
                {imgLoading
                  ? <CircularProgress size={14} color="inherit" />
                  : <PhotoCameraIcon sx={{ fontSize: 16 }} />
                }
              </IconButton>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {session?.user?.full_name || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session?.user?.email || ""}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session?.user?.division || ""}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3, mt: 1 }} />
          <form onSubmit={handleUpdateProfile}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="First Name"
                name="firstname"
                size="small"
                fullWidth
                value={personalFormData.firstname}
                onChange={handleChangePersonal}
                required
              />
              <TextField
                label="Middle Name"
                name="middlename"
                size="small"
                fullWidth
                value={personalFormData.middlename}
                onChange={handleChangePersonal}
              />
              <TextField
                label="Last Name"
                name="lastname"
                size="small"
                fullWidth
                value={personalFormData.lastname}
                onChange={handleChangePersonal}
                required
              />
              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={personalLoading}
              >
                {personalLoading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} color="inherit" />
                    <span>Updating...</span>
                  </Stack>
                ) : "Update Profile"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#000" }}>
            Change Password
          </Typography>
          <Divider sx={{ mb: 3, mt: 1 }} />
          <form onSubmit={handleChangePassword}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Current Password"
                type="password"
                name="curPass"
                size="small"
                fullWidth
                value={passwordFormData.curPass}
                onChange={handleChangePass}
                required
              />
              <TextField
                label="New Password"
                type="password"
                name="newPass"
                size="small"
                fullWidth
                value={passwordFormData.newPass}
                onChange={handleChangePass}
                required
              />
              <TextField
                label="Confirm New Password"
                type="password"
                name="conPass"
                size="small"
                fullWidth
                value={passwordFormData.conPass}
                onChange={handleChangePass}
                required
              />
              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} color="inherit" />
                    <span>Changing...</span>
                  </Stack>
                ) : "Change Password"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}