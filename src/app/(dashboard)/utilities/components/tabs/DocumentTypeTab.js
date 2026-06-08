"use client";

import {
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  TablePagination,
  CircularProgress,
  TextField,
  Tooltip,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useState, useMemo, useEffect } from "react";
import axiosInstance from "@/helper/Axios";
import NewDocumentTypeDialog from "../NewDocumentTypeDialog";
import EditDocumentTypeDialog from "../EditDocumentTypeDialog";
import DeleteDocumentTypeDialog from "../DeleteDocumentTypeDialog";

export default function DocumentTypeTab({ data, isActive }) {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    open: false,
    documentTypeName: "",
    id: null,
  });
  const [deleteData, setDeleteData] = useState({
    open: false,
    docTypeId: null,
    docTypeName: "",
  });
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    if (isActive) {
      setLoading(true);
      axiosInstance
        .get("/document/getAllDocType")
        .then((res) => {
          // console.log(res.body);
          setDocumentTypes(res.body);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isActive]);

  const handleEdit = (id) => {
    const docType = documentTypes.find((dt) => dt.id === id);
    if (docType) {
      setEditData({
        open: true,
        documentTypeName: docType.name,
        id: id,
      });
    }
  };

  const handleDelete = (id) => {
    const docType = documentTypes.find((dt) => dt.id === id);
    if (docType) {
      setDeleteData({
        open: true,
        docTypeId: id,
        docTypeName: docType.name,
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = useMemo(
    () =>
      documentTypes
        .filter((docType) =>
          docType.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [documentTypes, page, rowsPerPage, searchQuery],
  );

  const handleNewEntry = () => {
    setDialogOpen(true);
  };

  const paginationSection = (
    <>
      <Divider />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={documentTypes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
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
          },
        }}
      />
    </>
  );

  return (
    <div>
      <NewDocumentTypeDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        setDocumentTypes={setDocumentTypes}
      />
      <EditDocumentTypeDialog
        data={editData}
        setData={setEditData}
        setDocumentTypes={setDocumentTypes}
      />
      <DeleteDocumentTypeDialog
        deleteDocType={deleteData}
        setDeleteDocType={setDeleteData}
        setDocumentTypes={setDocumentTypes}
      />
      <div className="mb-6">
        <TextField
          type="text"
          placeholder="Search document types..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <div></div>
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={<AddRoundedIcon fontSize="small" />}
          onClick={handleNewEntry}
        >
          New Entry
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <CircularProgress />
          </div>
        ) : documentTypes && documentTypes.length > 0 ? (
          isSmallScreen ? (
            <div className="p-4 space-y-4">
              {visibleRows.map((docType) => (
                <div
                  key={docType.id}
                  className="border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3"
                >
                  <p className="font-semibold text-gray-900">
                    {docType?.name || "N/A"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Tooltip title="Edit Document Type" placement="top" arrow>
                      <IconButton
                        color="warning"
                        size="small"
                        onClick={() => handleEdit(docType?.id)}
                        sx={{ border: "1px solid #fbbf24" }}
                        aria-label="Edit document type"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Document Type" placement="top" arrow>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(docType?.id)}
                        sx={{ border: "1px solid #dc2626" }}
                        aria-label="Delete document type"
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              ))}
              {paginationSection}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs uppercase text-gray-700">
                      Name
                    </th>
                    <th className="px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs uppercase text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visibleRows.map((docType) => (
                    <tr key={docType.id}>
                      <td className="px-4 lg:px-6 py-2 sm:py-3">
                        <Typography
                          variant="body2"
                          className="text-gray-900 text-sm"
                        >
                          {docType?.name || "N/A"}
                        </Typography>
                      </td>
                      <td className="px-4 lg:px-6 py-2 sm:py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip
                            title="Edit Document Type"
                            placement="top"
                            arrow
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              color="warning"
                              disableElevation
                              onClick={() => handleEdit(docType?.id)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            title="Delete Document Type"
                            placement="top"
                            arrow
                          >
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disableElevation
                              onClick={() => handleDelete(docType?.id)}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </Button>
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
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? (
              <p>No document types found matching &quot;{searchQuery}&quot;</p>
            ) : (
              <p>No document types found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
