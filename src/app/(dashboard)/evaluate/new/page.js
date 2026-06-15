"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Chip,
  IconButton,
  Autocomplete,
  Alert,
  InputAdornment,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import KeyboardBackspaceRoundedIcon from "@mui/icons-material/KeyboardBackspaceRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import axiosInstance from "@/helper/Axios";
import { useRouter } from "next/navigation";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import { useError } from "@/helper/ErrorContext";
import LoadingDialog from "@/components/LoadingDialog";
import ConfirmExternalDocumentDialog from "./components/ConfirmExternalDocumentDialog";

// Reusable styling for MUI inputs to adapt to Tailwind Dark Mode
const inputSx = {
  "& .MuiInputBase-root": { color: "inherit" },
  "& .MuiInputLabel-root": { color: "inherit", opacity: 0.7 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "currentColor", opacity: 0.3 },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "currentColor", opacity: 0.5 },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563EB", opacity: 1 },
  "& .MuiSvgIcon-root": { color: "inherit", opacity: 0.7 },
};

// Reusable styling for MUI Dropdown Menus
const dropdownPaperProps = {
  className: "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700",
};

export default function NewFile() {
  const { session, status } = useProtectedRoute();
  const { setError } = useError();
  const router = useRouter();
  const abortControllerRef = useRef(null);
  const [formData, setFormData] = useState({
    refno: "",
    title: "",
    classification: "",
    classification_name: "",
    type: "",
    type_name: "",
    office_type: "internal",
    sender_office: "",
    sender_office_name: "",
    sender_person: "",
    sender_email: "",
    sender_phone: "",
    file: null,
    receiving_office: "",
    receiving_office_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [refLoading, setRefLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [classifications, setClassifications] = useState([]);
  const [types, setTypes] = useState([]);
  const [offices, setOffices] = useState([]);
  const [internalOffices, setInternalOffices] = useState([]);
  const [validation, setValidation] = useState({
    file: { valid: true, message: "" },
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const generateRefNo = async () => {
    setRefLoading(true);
    try {
      const res = await axiosInstance.get("/document/generateRefNo");
      setFormData((prev) => ({ ...prev, refno: res.body }));
    } catch (err) {
      console.error("Error generating reference number:", err);
      setError("Error generating reference number", "error");
    } finally {
      setRefLoading(false);
    }
  };

  useEffect(() => {
    generateRefNo();
  }, []);

  const validateFile = (file) => {
    if (!file) return { valid: false, message: "No file selected" };
    if (file.type !== "application/pdf") {
      return { valid: false, message: "Only PDF files are allowed" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `File size must be less than 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      };
    }
    return { valid: true, message: "" };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setValidation({ file: { valid: true, message: "" } });
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        setFormData((prev) => ({ ...prev, file }));
      } else {
        setValidation({ file: validation });
        setError(validation.message, "error");
      }
    }
  };

  const submitExternal = () => {
    setConfirmDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      setValidation({ file: { valid: false, message: "Please upload a file" } });
      return;
    }

    if (formData.office_type === "external") {
      submitExternal();
      return;
    }

    abortControllerRef.current = new AbortController();

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });

    const fileBase64 = await toBase64(formData.file).catch(() => {
      setError("Error reading file", "error");
    });

    setLoading(true);
    axiosInstance
      .post(
        "/document/generateReport",
        {
          base64_data: fileBase64,
          document_type: formData.type_name || formData.type,
        },
        { signal: abortControllerRef.current.signal },
      )
      .then((res) => {
        const request = indexedDB.open("docval_db", 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("reports")) {
            db.createObjectStore("reports", { keyPath: "id" });
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("reports", "readwrite");
          const store = transaction.objectStore("reports");
          const reportId = `report_${Date.now()}`;

          store.put({
            id: reportId,
            file_base64: fileBase64,
            report_data: res.body,
            timestamp: Date.now(),
          });

          sessionStorage.setItem(
            "newReportData",
            JSON.stringify({
              ...formData,
              file_name: formData.file.name,
              report_id: reportId,
              generation_date: new Date().toISOString().split("T")[0],
            }),
          );

          router.push(`/evaluate/report`);
          setLoading(false);
        };

        request.onerror = () => {
          setError("Error storing report data", "error");
          setLoading(false);
        };
      })
      .catch((err) => {
        if (err.name === "CanceledError") {
          setError("Request cancelled", "info");
        } else {
          setError("Error evaluating file", "error");
        }
        setLoading(false);
      });
  };

  const handleReset = () => {
    setFormData({
      refno: formData.refno,
      title: "",
      classification: "",
      classification_name: "",
      type: "",
      type_name: "",
      office_type: "internal",
      sender_office: "",
      sender_office_name: "",
      sender_person: "",
      sender_email: "",
      sender_phone: "",
      file: null,
      receiving_office: "",
      receiving_office_name: "",
    });
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  useEffect(() => {
    axiosInstance.get("/document/getAllDocClass").then((res) => setClassifications(res.body)).catch(() => setError("Error fetching classifications", "error"));
    axiosInstance.get("/document/getAllDocType").then((res) => setTypes(res.body)).catch(() => setError("Error fetching types", "error"));
    axiosInstance.get("/office/getAllDivision").then((res) => {
      setOffices(res.body);
      setInternalOffices(res.body.filter((o) => o.office_type === "internal" && o.parent_id !== null));
    }).catch(() => setError("Error fetching divisions", "error"));
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const handleDocumentDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
    const handleDocumentDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (e.clientX === 0 && e.clientY === 0) setDragOver(false); };
    const handleDocumentDrop = (e) => {
      e.preventDefault(); e.stopPropagation(); setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const v = validateFile(file);
        if (v.valid) setFormData((prev) => ({ ...prev, file }));
        else setError(v.message, "error");
      }
    };
    document.addEventListener("dragover", handleDocumentDragOver);
    document.addEventListener("dragleave", handleDocumentDragLeave);
    document.addEventListener("drop", handleDocumentDrop);
    return () => {
      document.removeEventListener("dragover", handleDocumentDragOver);
      document.removeEventListener("dragleave", handleDocumentDragLeave);
      document.removeEventListener("drop", handleDocumentDrop);
    };
  }, []);

  let filteredOffices = useMemo(() => {
    setFormData((prev) => ({ ...prev, sender_office: "" }));
    if (formData.office_type === "internal") {
      return offices.filter((o) => o.office_type === "internal" && o.parent_id !== null);
    } else {
      return offices.filter((o) => o.office_type === "external" && o.parent_id === null);
    }
  }, [formData.office_type, offices]);

  return (
    <Container maxWidth="md" sx={{ py: 6 }} className="text-slate-900 dark:text-slate-100">
      <Card 
        sx={{ borderRadius: 2, bgcolor: "transparent", backgroundImage: "none" }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <IconButton onClick={() => router.back()} size="small" sx={{ color: "inherit" }}>
              <KeyboardBackspaceRoundedIcon />
            </IconButton>
            <Typography variant="h4" component="h1" className="font-bold text-slate-900 dark:text-white">
              Upload new document
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Typography variant="body1" className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm">
                Document Upload
              </Typography>
              
              {validation.file.valid === false && (
                <Alert severity="error" className="dark:bg-red-900/20 dark:text-red-400 dark:border dark:border-red-900/50">
                  {validation.file.message}
                </Alert>
              )}

              {formData.file ? (
                <Chip
                  label={`${formData.file.name} (${(formData.file.size / (1024 * 1024)).toFixed(2)} MB)`}
                  variant="outlined"
                  icon={<PictureAsPdfRoundedIcon color="error" />}
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-5"
                  onDelete={() => setFormData({ ...formData, file: null })}
                  sx={{ "& .MuiChip-deleteIcon": { color: "inherit", opacity: 0.7, "&:hover": { opacity: 1 } } }}
                />
              ) : (
                <Box
                  component="label"
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <input type="file" hidden onChange={handleFileChange} accept=".pdf" />
                  <CloudUploadIcon className="text-blue-600 dark:text-blue-500 text-5xl mb-2" />
                  <Typography variant="body1" className="font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Drag and drop or click to upload
                  </Typography>
                  <Typography variant="caption" className="text-slate-500 dark:text-slate-400">
                    PDF (Max 10MB)
                  </Typography>
                </Box>
              )}

              <Typography variant="body1" className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm pt-2">
                Document Details
              </Typography>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Reference No."
                  name="refno"
                  value={formData.refno}
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        {refLoading ? (
                          <CircularProgress size={16} sx={{ color: "inherit" }} />
                        ) : (
                          <IconButton size="small" onClick={generateRefNo} title="Regenerate" sx={{ color: "inherit" }}>
                            <AutorenewRoundedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    ...inputSx,
                    "& .MuiInputBase-input": { color: "#2563EB", fontWeight: 700 }, // Keep the blue emphasis
                  }}
                />
                <TextField
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., My Document"
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  sx={inputSx}
                />
              </Stack>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Autocomplete
                  options={classifications}
                  size="small"
                  getOptionLabel={(option) => option.name || ""}
                  value={classifications.find((c) => c.id === formData.classification) || null}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, classification: newValue ? newValue.id : "", classification_name: newValue ? newValue.name : "" });
                  }}
                  noOptionsText="No classifications available"
                  componentsProps={{ paper: dropdownPaperProps }}
                  renderInput={(params) => <TextField {...params} label="Classification" placeholder="Search Classification" required sx={inputSx} />}
                  fullWidth
                />
                <Autocomplete
                  options={types}
                  size="small"
                  getOptionLabel={(option) => option.name || ""}
                  value={types.find((t) => t.id === formData.type) || null}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, type: newValue ? newValue.id : "", type_name: newValue ? newValue.name : "" });
                  }}
                  noOptionsText="No types available"
                  componentsProps={{ paper: dropdownPaperProps }}
                  renderInput={(params) => <TextField {...params} label="Type of Document" placeholder="Search Type" required sx={inputSx} />}
                  fullWidth
                />
              </Stack>

              <Typography variant="body1" className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm pt-2">
                Sender Details
              </Typography>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {session?.user?.role.some((role) => role.name === "CRRU" || role.name === "crru" || role.name === "Admin" || role.name === "admin") && (
                  <FormControl fullWidth size="small" sx={{ flex: 1, ...inputSx }} required>
                    <InputLabel id="office-type-label" sx={{ color: "inherit" }}>Office Type</InputLabel>
                    <Select 
                      labelId="office-type-label" 
                      label="Office Type" 
                      name="office_type" 
                      onChange={handleInputChange} 
                      value={formData.office_type}
                      MenuProps={{ PaperProps: dropdownPaperProps }}
                    >
                      <MenuItem value="internal">Internal (DICT)</MenuItem>
                      <MenuItem value="external">External</MenuItem>
                    </Select>
                  </FormControl>
                )}
                
                <Autocomplete
                  options={filteredOffices}
                  size="small"
                  sx={{ flex: 2 }}
                  getOptionLabel={(option) => option.division_name || ""}
                  filterOptions={(options, state) => {
                    const inputValue = state.inputValue.toLowerCase();
                    return options.filter((option) =>
                      option.division_name.toLowerCase().includes(inputValue) ||
                      (option.division_abrv && option.division_abrv.toLowerCase().includes(inputValue))
                    );
                  }}
                  value={offices.find((d) => d.id === formData.sender_office) || null}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, sender_office: newValue ? newValue.id : "", sender_office_name: newValue ? newValue.division_name : "" });
                  }}
                  noOptionsText={`No ${formData.office_type === "internal" ? "division" : "office"} available`}
                  componentsProps={{ paper: dropdownPaperProps }}
                  renderInput={(params) => <TextField {...params} label="Sender Office" placeholder="Search Sender Office" required sx={inputSx} />}
                  fullWidth
                />
                
                {session?.user?.role.some((role) => role.name === "CRRU" || role.name === "crru" || role.name === "Admin" || role.name === "admin") && formData.office_type === "external" && (
                  <Autocomplete
                    options={internalOffices}
                    size="small"
                    sx={{ flex: 2 }}
                    getOptionLabel={(option) => option.division_name || ""}
                    filterOptions={(options, state) => {
                      const inputValue = state.inputValue.toLowerCase();
                      return options.filter((option) =>
                        option.division_name.toLowerCase().includes(inputValue) ||
                        (option.division_abrv && option.division_abrv.toLowerCase().includes(inputValue))
                      );
                    }}
                    value={internalOffices.find((d) => d.id === formData.receiving_office) || null}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, receiving_office: newValue ? newValue.id : "", receiving_office_name: newValue ? newValue.division_name : "" });
                    }}
                    noOptionsText="No internal offices available"
                    componentsProps={{ paper: dropdownPaperProps }}
                    renderInput={(params) => <TextField {...params} label="Receiving Office" placeholder="Search Receiving Office" required sx={inputSx} />}
                    fullWidth
                  />
                )}
              </Stack>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Email" name="sender_email" value={formData.sender_email} onChange={handleInputChange} placeholder="e.g., john@example.com" fullWidth type="email" variant="outlined" size="small" required sx={inputSx} />
                <TextField label="Contact Person" name="sender_person" value={formData.sender_person} onChange={handleInputChange} placeholder="e.g., John Doe" fullWidth variant="outlined" size="small" required sx={inputSx} />
                <TextField label="Phone Number" name="sender_phone" value={formData.sender_phone} onChange={handleInputChange} placeholder="e.g., 0917*******" fullWidth variant="outlined" size="small" required sx={inputSx} />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2 }}>
                <Button type="button" variant="outlined" color="error" fullWidth onClick={handleReset} disabled={loading} sx={{ py: 1 }}>
                  Reset
                </Button>
                <Button type="submit" variant="contained" fullWidth loading={loading} disableElevation sx={{ py: 1, bgcolor: "#2563EB", "&:hover": { bgcolor: "#1d4ed8" } }}>
                  Continue
                </Button>
                {loading && (
                  <IconButton>
                    <StopCircleRoundedIcon color="error" onClick={handleCancel} />
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
      
      <LoadingDialog open={loading} />
      
      <ConfirmExternalDocumentDialog
        open={confirmDialogOpen}
        setOpen={setConfirmDialogOpen}
        formData={formData}
        onConfirm={() => { handleReset(); router.push("/evaluate", { replace: true }); }}
      />
    </Container>
  );
}