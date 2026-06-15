"use client";

import {
  Button,
  Divider,
  TablePagination,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Container,
  Autocomplete,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import RotateLeftRoundedIcon from "@mui/icons-material/RotateLeftRounded";

import { useRouter } from "next/navigation";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import { useLoading } from "@/helper/LoadingContext";
import FileDetailsModal from "@/components/FileDetailsModal";
import DeleteDocDialog from "./components/DeleteDocDialog";

export default function files() {
  const router = useRouter();
  const { setError } = useError();
  const { session, status, isChecking } = useProtectedRoute();
  const { startLoading, stopLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterClassification, setFilterClassification] = useState("");
  const [filterDocType, setFilterDocType] = useState("");
  const [filterOffice, setFilterOffice] = useState("");
  const [deleteDoc, setDeleteDoc] = useState({
    open: false,
    docId: null,
    docTitle: "",
  });

  const [classOption, setClassOption] = useState([]);
  const [typeOption, setTypeOption] = useState([]);
  const [officeOption, setOfficeOption] = useState([]);

  const headerCells = [
    "Documents",
    "Classification",
    "Type of Document",
    "Date Received",
    "Actions",
  ];

  const columnVisibility = [
    "",
    "hidden sm:table-cell",
    "hidden md:table-cell",
    "hidden lg:table-cell",
    "",
  ];

  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    setLoading(true);

    axiosInstance
      .get("/document/getAllDocClass")
      .then((res) => setClassOption(res.body))
      .catch((error) => setError("Error fetching classifications", "error"));

    axiosInstance
      .get("/document/getAllDocType")
      .then((res) => setTypeOption(res.body))
      .catch((error) => setError("Error fetching types", "error"));

    axiosInstance
      .get("/office/getAllDivision")
      .then((res) => setOfficeOption(res.body))
      .catch((error) => setError("Error fetching offices", "error"));

    axiosInstance
      .get("/document/getFileByUser")
      .then((res) => {
        setFiles(res.body);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch documents. Please try again.", "error");
        setLoading(false);
      });
  }, []);

  const visibleRows = useMemo(() => {
    let filtered = files.filter((file) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (file.title && file.title.toLowerCase().includes(query)) ||
        (file.reference_no &&
          file.reference_no.toLowerCase().includes(query)) ||
        (file.doc_class && file.doc_class.toLowerCase().includes(query)) ||
        (file.doc_type && file.doc_type.toLowerCase().includes(query)) ||
        (file.sender_office &&
          file.sender_office.toLowerCase().includes(query));

      const matchesClassification =
        filterClassification === "" || file.doc_class === filterClassification;
      const matchesDocType =
        filterDocType === "" || file.doc_type === filterDocType;
      const matchesOffice =
        filterOffice === "" || file.sender_office === filterOffice;

      return (
        matchesSearch &&
        matchesClassification &&
        matchesDocType &&
        matchesOffice
      );
    });

    if (sortBy === "documents-asc") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "documents-desc") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "date-asc") {
      filtered.sort(
        (a, b) => new Date(a.date_created) - new Date(b.date_created),
      );
    } else if (sortBy === "date-desc") {
      filtered.sort(
        (a, b) => new Date(b.date_created) - new Date(a.date_created),
      );
    }

    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [
    files,
    searchQuery,
    page,
    rowsPerPage,
    sortBy,
    filterClassification,
    filterDocType,
    filterOffice,
  ]);

  const filesByOffice = useMemo(() => {
    const temp = files.reduce((acc, file) => {
      const office = file.sender_office || "Unknown";
      if (!acc[office]) {
        acc[office] = 0;
      }
      acc[office] += 1;
      return acc;
    }, {});

    return Object.entries(temp).map(([office, count]) => ({ office, count }));
  }, [files]);

  const organizedOffices = useMemo(() => {
    const external = [];
    const internal = [];

    officeOption.forEach((office) => {
      if (office.office_type?.toLowerCase() === "external") {
        external.push(office);
      } else if (office.office_type?.toLowerCase() === "internal") {
        if (office.parent_id) {
          internal.push(office);
        }
      }
    });

    return { external, internal };
  }, [officeOption]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterClassification("");
    setFilterDocType("");
    setFilterOffice("");
    setPage(0);
  };

  useEffect(() => {
    if (isChecking) {
      startLoading();
    } else {
      stopLoading();
    }

    if (status !== "authenticated") {
      router.push("/", { replace: true });
    }
  }, [isChecking, startLoading, stopLoading, status, router]);

  const paginationSection = (
    <>
      <Divider className="dark:border-slate-800" />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={files.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          color: 'inherit', // Forces text to inherit the dark mode white
          "& .MuiTablePagination-toolbar": {
            minHeight: "44px",
            paddingX: 2,
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              margin: 0,
              fontSize: "0.75rem",
            },
          "& .MuiTablePagination-select": {
            fontSize: "0.75rem",
          },
          "& .MuiIconButton-root": {
            padding: "4px",
            color: 'inherit',
          },
        }}
      />
    </>
  );

  return (
    <Container maxWidth="lg" className="py-8 min-h-[80vh] text-slate-900 dark:text-slate-100">
      <div className={`${isModalOpen ? "blur-sm" : ""}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluate</h1>
            <h2 className="text-sm text-gray-600 dark:text-gray-400">
              Manage your evaluated documents or create new evaluations
            </h2>
          </div>
          <Button
            variant="contained"
            size="small"
            disableElevation
            startIcon={<AddRoundedIcon fontSize="small" />}
            onClick={() => router.push("/evaluate/new")}
          >
            Evaluate
          </Button>
        </div>

        <Stack
          direction="row"
          spacing={2}
          mb={5}
          maxWidth={{ xs: "100%", sm: 640 }}
          sx={{
            maxWidth: "100%",
            width: "100%",
            overflowX: "auto",
            flexWrap: "nowrap",
            pb: 1,
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#d1d5db",
              borderRadius: "3px",
              "&:hover": {
                background: "#9ca3af",
              },
            },
            scrollbarWidth: "thin",
            scrollbarColor: "#d1d5db transparent",
            gap: 2,
          }}
        >
          {filesByOffice.map((item, index) => (
            <div
              key={`${item.office}-${index}`}
              onClick={() => {
                setFilterOffice(
                  item.office === filterOffice ? "" : item.office,
                );
                setPage(0);
              }}
              className="cursor-pointer bg-white dark:bg-slate-900 rounded-lg p-4 border-l-4 border-blue-600 dark:border-blue-500 shadow-sm transition-all hover:shadow-md flex-shrink-0"
              style={{
                width: "260px",
                minWidth: "220px",
                maxWidth: "300px",
              }}
            >
              <div className="flex flex-col justify-between h-full">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {item?.office ?? "-"}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {item?.count ?? 0}
                </h3>
              </div>
            </div>
          ))}
        </Stack>

        {/* Note: To perfect MUI inputs in dark mode, you generally add an MUI ThemeProvider, 
            but adding bg-white/dark overrides to the container keeps them legible for now */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white dark:bg-slate-900 p-4 rounded-lg border border-transparent dark:border-slate-800">
          <div className="md:col-span-2">
            <TextField
              type="text"
              placeholder="Search documents..."
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ input: { color: 'inherit' } }}
            />
          </div>

          <div>
            <FormControl size="small" fullWidth>
              <Select
                value={filterClassification}
                onChange={(e) => {
                  setFilterClassification(e.target.value);
                  setPage(0);
                }}
                displayEmpty
                sx={{ color: 'inherit' }}
              >
                <MenuItem value="">All Classifications</MenuItem>
                {classOption.map((data, index) => (
                  <MenuItem key={index} value={data.name}>
                    {data.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div>
            <FormControl size="small" fullWidth>
              <Select
                value={filterDocType}
                onChange={(e) => {
                  setFilterDocType(e.target.value);
                  setPage(0);
                }}
                displayEmpty
                sx={{ color: 'inherit' }}
              >
                <MenuItem value="">All Document Types</MenuItem>
                {typeOption.map((data, index) => (
                  <MenuItem key={index} value={data.name}>
                    {data.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="flex gap-2">
            <Autocomplete
              size="small"
              fullWidth
              options={[
                ...organizedOffices.external,
                ...organizedOffices.internal,
              ]}
              groupBy={(option) => {
                if (option.office_type?.toLowerCase() === "external") {
                  return "External";
                } else if (option.office_type?.toLowerCase() === "internal") {
                  return "Internal";
                }
                return "Other";
              }}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.division_name || ""
              }
              value={
                officeOption.find(
                  (office) => office.division_name === filterOffice,
                ) || null
              }
              onChange={(event, value) => {
                setFilterOffice(value ? value.division_name : "");
                setPage(0);
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="All Offices" sx={{ input: { color: 'inherit' } }} />
              )}
              sx={{ '& .MuiOutlinedInput-root': { color: 'inherit' } }}
            />
            <Tooltip title="Reset Filters" arrow placement="top">
              <IconButton color="error" size="small" onClick={resetFilters}>
                <RotateLeftRoundedIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <CircularProgress />
            </div>
          ) : visibleRows.length > 0 ? (
            isSmallScreen ? (
              <div className="p-4 space-y-4">
                {visibleRows.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-100 dark:border-slate-800 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {doc.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {doc.sender_office || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip title="View Details" arrow placement="top">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() =>
                              router.push(`/evaluate?id=${doc.id}`, {
                                replace: true,
                              })
                            }
                            sx={{ border: "1px solid #16a34a" }}
                            aria-label="View details"
                          >
                            <RemoveRedEyeOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Document" arrow placement="top">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              setDeleteDoc({
                                open: true,
                                docId: doc.id,
                                docTitle: doc.title,
                              });
                            }}
                            sx={{ border: "1px solid #dc2626" }}
                            aria-label="Delete document"
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                    <Divider className="my-3 dark:border-slate-700" />
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <div>
                        <p className="text-gray-500 dark:text-gray-500 uppercase tracking-wide text-[10px]">
                          Classification
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-200">
                          {doc.doc_class || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-500 uppercase tracking-wide text-[10px]">
                          Document Type
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-200">
                          {doc.doc_type || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-500 uppercase tracking-wide text-[10px]">
                          Date Received
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-200">
                          {doc.date_created
                            ? new Date(doc.date_created)
                                .toISOString()
                                .split("T")[0]
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-500 uppercase tracking-wide text-[10px]">
                          Reference No.
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-200">
                          {doc.reference_no || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {paginationSection}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800">
                    <tr>
                      {headerCells.map((cell, index) => (
                        <th
                          key={cell}
                          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-transparent ${columnVisibility[index]}`}
                        >
                          <div className="flex items-center gap-2 ">
                            {cell}
                            {(cell === "Documents" ||
                              cell === "Date Received") && (
                              <Tooltip
                                title={`Sort by ${cell}`}
                                arrow
                                placement="top"
                              >
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => {
                                    if (cell === "Documents") {
                                      setSortBy(
                                        sortBy === "documents-asc"
                                          ? "documents-desc"
                                          : "documents-asc",
                                      );
                                    } else if (cell === "Date Received") {
                                      setSortBy(
                                        sortBy === "date-asc"
                                          ? "date-desc"
                                          : "date-asc",
                                      );
                                    }
                                  }}
                                  sx={{
                                    padding: "4px",
                                    minWidth: "auto",
                                    color: "inherit",
                                  }}
                                >
                                  {sortBy === "documents-asc" &&
                                  cell === "Documents" ? (
                                    <KeyboardArrowUpRoundedIcon fontSize="small" />
                                  ) : sortBy === "documents-desc" &&
                                    cell === "Documents" ? (
                                    <KeyboardArrowDownRoundedIcon fontSize="small" />
                                  ) : sortBy === "date-asc" &&
                                    cell === "Date Received" ? (
                                    <KeyboardArrowUpRoundedIcon fontSize="small" />
                                  ) : sortBy === "date-desc" &&
                                    cell === "Date Received" ? (
                                    <KeyboardArrowDownRoundedIcon fontSize="small" />
                                  ) : (
                                    <UnfoldMoreRoundedIcon fontSize="small" />
                                  )}
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                    {visibleRows.map((doc, index) => (
                      <tr key={index} className="align-top hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 sm:px-4 lg:px-6 py-3">
                          <div className="flex flex-col">
                            <Typography
                              variant="body2"
                              className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base"
                            >
                              {doc.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm"
                            >
                              {doc.sender_office}
                            </Typography>
                            <div className="flex flex-wrap gap-2 mt-3 text-[10px] text-gray-600 sm:hidden">
                              {(doc.doc_class || doc.doc_type) && (
                                <span className="bg-gray-100 dark:bg-slate-800 dark:text-gray-300 px-2 py-1 rounded-full">
                                  {[doc.doc_class, doc.doc_type]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </span>
                              )}
                              {doc.date_created && (
                                <span className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full text-blue-600 dark:text-blue-400">
                                  {
                                    new Date(doc.date_created)
                                      .toISOString()
                                      .split("T")[0]
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 ${columnVisibility[1]}`}
                        >
                          {doc.doc_class || "-"}
                        </td>
                        <td
                          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 ${columnVisibility[2]}`}
                        >
                          {doc.doc_type || "-"}
                        </td>
                        <td
                          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 ${columnVisibility[3]}`}
                        >
                          {doc.date_created
                            ? new Date(doc.date_created)
                                .toISOString()
                                .split("T")[0]
                            : "-"}
                        </td>
                        <td
                          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 ${columnVisibility[4]}`}
                        >
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <Tooltip title="View Details" arrow placement="top">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() =>
                                  router.push(`/evaluate?id=${doc.id}`, {
                                    replace: true,
                                  })
                                }
                                sx={{ border: "1px solid #16a34a" }}
                                aria-label="View details"
                              >
                                <RemoveRedEyeOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title="Delete Document"
                              arrow
                              placement="top"
                            >
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => {
                                  setDeleteDoc({
                                    open: true,
                                    docId: doc.id,
                                    docTitle: doc.title,
                                  });
                                }}
                                sx={{ border: "1px solid #dc2626" }}
                                aria-label="Delete document"
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paginationSection}
              </div>
            )
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchQuery ? (
                <p>No documents found matching &quot;{searchQuery}&quot;</p>
              ) : (
                <p>
                  No documents found. Add your first document to get started.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <FileDetailsModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

      <DeleteDocDialog
        deleteDoc={deleteDoc}
        setDeleteDoc={setDeleteDoc}
        setFiles={setFiles}
      />
    </Container>
  );
}