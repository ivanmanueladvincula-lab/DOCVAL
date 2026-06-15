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
import NewDivDialog from "../NewDivDialog";
import EditDivisionDialog from "../EditDivisionDialog";
import DeleteDivisionDialog from "../DeleteDivisionDialog";

export default function ExternalTab({ data, isActive }) {
  const [divisions, setDivisions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openNewDivDialog, setOpenNewDivDialog] = useState(false);
  const [editDivDialog, setEditDivDialog] = useState({
    open: false,
    divisionId: null,
    divisionName: "",
  });
  const [deleteDivDialog, setDeleteDivDialog] = useState({
    open: false,
    divisionId: null,
    divisionName: "",
  });
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    if (isActive) {
      setLoading(true);
      axiosInstance
        .get("/office/getAllDivision")
        .then((res) => {
          const externalDivisions = res.body.filter(
            (division) => division.office_type === "external",
          );

          setDivisions(externalDivisions);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isActive]);

  const handleEdit = (id, divisionName, divisionAbrv) => {
    setEditDivDialog((prev) => ({
      ...prev,
      open: true,
      divisionId: id,
      divisionName: divisionName,
      divisionAbrv: divisionAbrv,
    }));
  };

  const handleDelete = (id) => {
    const divisionToDelete = divisions.find((div) => div.id === id);
    setDeleteDivDialog((prev) => ({
      ...prev,
      open: true,
      divisionId: id,
      divisionName: divisionToDelete
        ? divisionToDelete.division_name
        : "Unknown Division",
    }));
  };

  const handleNewEntry = () => {
    setOpenNewDivDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const setExternalDivisions = (callback) => {
    setDivisions((prevDivisions) => {
      const updatedDivisions =
        typeof callback === "function" ? callback(prevDivisions) : callback;

      return updatedDivisions.filter(
        (division) => division.office_type === "external",
      );
    });
  };

  const visibleRows = useMemo(
    () =>
      divisions
        .filter((division) =>
          (division?.division_name ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        )
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [divisions, searchQuery, page, rowsPerPage],
  );

  const paginationSection = (
    <>
      <Divider className="dark:border-slate-800" />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={divisions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          color: "inherit",
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
            color: "inherit",
          },
        }}
      />
    </>
  );

  return (
    <div>
      <div className="mb-6">
        <TextField
          type="text"
          placeholder="Search external offices..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white dark:bg-slate-900 rounded-md"
          sx={{
            "& .MuiInputBase-root": { color: "inherit" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "currentColor", opacity: 0.2 },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "currentColor", opacity: 0.4 }
          }}
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

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <CircularProgress />
          </div>
        ) : divisions && divisions.length > 0 ? (
          isSmallScreen ? (
            <div className="p-4 space-y-4">
              {visibleRows.map((division) => (
                <div
                  key={division.id}
                  className="border border-gray-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3 bg-white dark:bg-slate-800/50"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {division?.division_name || "N/A"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Tooltip title="Edit Division" placement="top" arrow>
                      <IconButton
                        color="warning"
                        size="small"
                        onClick={() =>
                          handleEdit(
                            division?.id,
                            division?.division_name,
                            division?.division_abrv,
                          )
                        }
                        sx={{ border: "1px solid #fbbf24" }}
                        aria-label="Edit division"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Division" placement="top" arrow>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(division?.id)}
                        sx={{ border: "1px solid #dc2626" }}
                        aria-label="Delete division"
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
                <thead className="bg-gray-100 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs uppercase text-gray-700 dark:text-gray-300">
                      Name
                    </th>
                    <th className="px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs uppercase text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {visibleRows.map((division) => (
                    <tr key={division.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 lg:px-6 py-2 sm:py-3">
                        <Typography
                          variant="body2"
                          className="text-gray-900 dark:text-slate-200 text-sm"
                        >
                          {division?.division_name || "N/A"}
                        </Typography>
                      </td>
                      <td className="px-4 lg:px-6 py-2 sm:py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip title="Edit Division" placement="top" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              color="warning"
                              disableElevation
                              onClick={() =>
                                handleEdit(
                                  division?.id,
                                  division?.division_name,
                                  division?.division_abrv,
                                )
                              }
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            title="Delete Division"
                            placement="top"
                            arrow
                          >
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disableElevation
                              onClick={() => handleDelete(division?.id)}
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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchQuery ? (
              <p>No divisions found matching &quot;{searchQuery}&quot;</p>
            ) : (
              <p>No divisions found</p>
            )}
          </div>
        )}
      </div>

      <NewDivDialog
        open={openNewDivDialog}
        setOpen={setOpenNewDivDialog}
        setDivisions={setExternalDivisions}
      />

      <EditDivisionDialog
        data={editDivDialog}
        setData={setEditDivDialog}
        setDivisions={setDivisions}
      />

      <DeleteDivisionDialog
        deleteDivision={deleteDivDialog}
        setDeleteDivision={setDeleteDivDialog}
        setDivisions={setDivisions}
      />
    </div>
  );
}