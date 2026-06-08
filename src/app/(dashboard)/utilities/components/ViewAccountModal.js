"use client";

import {
  Autocomplete,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Typography,
  Stack,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useState, useEffect } from "react";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";

export default function ViewAccountModal({ data, setData, setAccounts }) {
  const { setError } = useError();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [userStatus, setUserStatus] = useState("");
  const [divOption, setDivOption] = useState([]);
  const [roleOption, setRoleOption] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [oldData, setOldData] = useState({
    firstName: "", middleName: "", lastName: "",
    email: "", divisionName: "", divisionId: "", role: [],
  });
  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "",
    email: "", divisionName: "", divisionId: "", role: [],
  });

  useEffect(() => {
    if (data.open && data.userId) {
      setLoading(true);
      setSelectedDivision(null);
      axiosInstance
        .get("/office/getAllDivision")
        .then(async (res) => {
          const options = res.body.filter(
            (division) =>
              division.office_type === "internal" &&
              division.parent_id !== null
          );
          setDivOption(options);
          await fetchUserDetails();
        })
        .catch((err) => {
          setError("Failed to fetch divisions. Please try again.");
          handleClose();
          setLoading(false);
        });

      axiosInstance
        .get("/roles/getAllRoles")
        .then((res) => setRoleOption(res.body))
        .catch(() => setError("Failed to fetch roles. Please try again."));
    }
  }, [data.open, data.userId]);

  const fetchUserDetails = async () => {
    axiosInstance
      .post("/user/getUserDetail", { userId: data.userId })
      .then((res) => {
        const user = res.body;
        const parsedRole = (() => {
          try {
            return Array.isArray(user.role) ? user.role : JSON.parse(user.role);
          } catch {
            return [];
          }
        })();
        const roleIds = Array.isArray(parsedRole)
          ? parsedRole.map((role) => role.id).filter(Boolean)
          : [];

        // ✅ Store status
        setUserStatus(user.status || "");

        setFormData({
          firstName: user.f_name || "",
          middleName: user.m_name || "",
          lastName: user.l_name || "",
          email: user.email || "",
          divisionName: user.division_name || "",
          divisionId: user.division_id || "",
          role: roleIds,
        });
        setOldData({
          firstName: user.f_name || "",
          middleName: user.m_name || "",
          lastName: user.l_name || "",
          email: user.email || "",
          divisionName: user.division_name || "",
          divisionId: user.division_id || "",
          role: roleIds,
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch user details");
        handleClose();
        setLoading(false);
      });
  };

  // ✅ Assign division handler
  const handleAssignDivision = () => {
    if (!selectedDivision) {
      setError("Please select a division first", "warning");
      return;
    }
    setAssignLoading(true);
    axiosInstance
      .post("/user/assignDivision", {
        user_id: data.userId,
        division_id: selectedDivision.id,
      })
      .then((res) => {
        setError("Division assigned successfully!", "success");
        // Update accounts list
                setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === data.userId
              ? { 
                  ...acc, 
                  division_name: selectedDivision.division_name,
                  status: "Active"  // ✅ update status too
                }
              : acc
          )
        );
        setAssignLoading(false);
        handleClose();
      })
      .catch((err) => {
        setError(err.message || "Failed to assign division.", "error");
        setAssignLoading(false);
      });
  };

  const handleClose = () => {
    setData({ ...data, open: false });
    setIsEditing(false);
    setUserStatus("");
    setSelectedDivision(null);
  };

  const handleEdit = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    if (!formData.firstName.trim()) { setError("First name is required", "warning"); return; }
    if (!formData.lastName.trim()) { setError("Last name is required", "warning"); return; }
    if (!formData.email.trim()) { setError("Email is required", "warning"); return; }
    if (!formData.divisionId) { setError("Division is required", "warning"); return; }

    const changes = {};
    Object.keys(formData).forEach((key) => {
      if (key === "role") {
        if (JSON.stringify(formData.role) !== JSON.stringify(oldData.role))
          changes[key] = formData[key];
        return;
      }
      if (formData[key] !== oldData[key]) changes[key] = formData[key];
    });

    if (Object.keys(changes).length === 0) {
      setError("No changes made", "warning");
      setIsEditing(false);
      return;
    }

    setLoading(true);
    const updateData = { userId: data.userId };
    if (formData.firstName !== oldData.firstName) updateData.newFName = formData.firstName;
    if (formData.middleName !== oldData.middleName) updateData.newMName = formData.middleName;
    if (formData.lastName !== oldData.lastName) updateData.newLName = formData.lastName;
    if (formData.email !== oldData.email) updateData.newEmail = formData.email;
    if (formData.divisionId !== oldData.divisionId) updateData.newDiv = formData.divisionId;
    if (JSON.stringify(formData.role) !== JSON.stringify(oldData.role))
      updateData.newRole = formData.role;

    axiosInstance
      .post("/user/editUser", updateData)
      .then((res) => {
        setError(res.message, "success");
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === data.userId ? res.body : acc))
        );
        setIsEditing(false);
        handleClose();
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to update user. Please try again.");
        setLoading(false);
      });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      setFormData({ ...formData, [name]: typeof value === "string" ? value.split(",") : value });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Pending user — show assign division UI
  const isPending = userStatus === "Pending";

  return (
    <Dialog open={data.open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Account Details</Typography>
            {/* ✅ Status badge */}
            {userStatus && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                isPending ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}>
                {userStatus}
              </span>
            )}
          </Stack>
          <IconButton onClick={handleClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>

            {/* ✅ Pending Alert + Assign Division */}
            {isPending && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  This account is pending activation. Please assign a division.
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Autocomplete
                    options={divOption}
                    size="small"
                    getOptionLabel={(option) => option.division_name || ""}
                    value={selectedDivision}
                    onChange={(_, newValue) => setSelectedDivision(newValue)}
                    noOptionsText="No divisions available"
                    renderInput={(params) => (
                      <TextField {...params} label="Select Division" placeholder="Search division" />
                    )}
                    sx={{ minWidth: 260 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    disableElevation
                    disabled={assignLoading || !selectedDivision}
                    onClick={handleAssignDivision}
                  >
                    {assignLoading ? <CircularProgress size={16} color="inherit" /> : "Assign"}
                  </Button>
                </Stack>
              </Alert>
            )}

            {/* Edit button — only show for Active users */}
            {!isPending && (
              <Button
                onClick={handleEdit}
                variant="contained"
                size="small"
                color={isEditing ? "error" : "warning"}
                startIcon={isEditing ? <CloseRoundedIcon /> : <EditRoundedIcon />}
                disableElevation
                disabled={loading}
              >
                {isEditing ? "Cancel Edit" : "Edit"}
              </Button>
            )}

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>Name</Typography>
            <Stack direction="row" spacing={2}>
              <TextField label="First Name" name="firstName" value={formData.firstName}
                onChange={handleChange} disabled={!isEditing} fullWidth size="small" variant="outlined" />
              <TextField label="Middle Name" name="middleName" value={formData.middleName}
                onChange={handleChange} disabled={!isEditing} fullWidth size="small" variant="outlined" />
            </Stack>
            <TextField label="Last Name" name="lastName" value={formData.lastName}
              onChange={handleChange} disabled={!isEditing} fullWidth size="small" variant="outlined" />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>Email</Typography>
            <TextField label="Email" name="email" value={formData.email}
              onChange={handleChange} disabled={!isEditing} fullWidth size="small" variant="outlined" type="email" />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>Division</Typography>
            <Autocomplete
              options={divOption}
              size="small"
              getOptionLabel={(option) => option.division_name || ""}
              value={divOption.find((d) => d.id === formData.divisionId) || null}
              onChange={(_, newValue) => {
                setFormData((prev) => ({ ...prev, divisionId: newValue?.id || "" }));
              }}
              disabled={!isEditing}
              noOptionsText="No divisions available"
              renderInput={(params) => (
                <TextField {...params} label="Division" placeholder="Search Division" />
              )}
              fullWidth
            />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>Role</Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                name="role" labelId="role-label" label="Role"
                value={formData.role} onChange={handleChange}
                disabled={!isEditing} size="small" fullWidth variant="outlined" multiple
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((roleId) => {
                      const role = roleOption.find((r) => r.id === roleId);
                      return <Chip key={roleId} label={role?.name || roleId} size="small" />;
                    })}
                  </Box>
                )}
              >
                {roleOption.map((role) => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {isEditing && !isPending && (
          <Button onClick={handleSave} variant="contained" color="success" size="small" disableElevation>
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}