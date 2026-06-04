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
import { useState, useMemo, useEffect, Fragment } from "react";
import axiosInstance from "@/helper/Axios";
import NewDivDialog from "../NewDivDialog";
import EditDivisionDialog from "../EditDivisionDialog";
import DeleteDivisionDialog from "../DeleteDivisionDialog";

export default function DivisionTab({ data, isActive }) {
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
          const internalDivisions = res.body.filter(
            (division) => division.office_type === "internal",
          );

          // console.log(res.body);
          setDivisions(internalDivisions);
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
    // console.log("Delete division:", id);
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

  // Wrapper for setDivisions that filters to only internal divisions
  const setInternalDivisions = (callback) => {
    setDivisions((prevDivisions) => {
      const updatedDivisions =
        typeof callback === "function" ? callback(prevDivisions) : callback;

      return updatedDivisions.filter(
        (division) => division.office_type === "internal",
      );
    });
  };

  const groupedDivisions = useMemo(() => {
    const groupsMap = new Map();

    // First pass: Identify all divisions that are parents (have children)
    const parentDivisionIds = new Set();
    divisions.forEach((division) => {
      if (division?.parent_id) {
        parentDivisionIds.add(division.parent_id);
      }
    });

    // Second pass: Create groups for all parent divisions
    divisions.forEach((division) => {
      if (!division?.parent_id && parentDivisionIds.has(division?.id)) {
        // This is a parent division with children
        const parentId = division?.id;
        const parentName = division?.division_name || "Unknown";
        const parentAbrv = division?.division_abrv || "N/A";

        if (!groupsMap.has(parentId)) {
          groupsMap.set(parentId, {
            parentId,
            parentName,
            parentAbrv,
            divisions: [],
          });
        }
      }
    });

    // Add "others" group for divisions without a parent
    if (!groupsMap.has("unassigned")) {
      groupsMap.set("unassigned", {
        parentId: "unassigned",
        parentName: "Others",
        parentAbrv: "N/A",
        divisions: [],
      });
    }

    // Third pass: Add divisions to appropriate groups
    divisions.forEach((division) => {
      if (division?.parent_id) {
        // This division has a parent, add it to parent's group
        const parentId = division.parent_id;

        if (!groupsMap.has(parentId)) {
          // Parent group doesn't exist yet, create it
          const parentDivision = divisions.find((d) => d?.id === parentId);
          groupsMap.set(parentId, {
            parentId,
            parentName: parentDivision?.division_name || "Unknown Parent",
            parentAbrv: parentDivision?.division_abrv || "N/A",
            divisions: [],
          });
        }

        groupsMap.get(parentId).divisions.push(division);
      } else {
        // This division has no parent
        if (!parentDivisionIds.has(division?.id)) {
          // And it's not a parent itself, add to Unassigned
          groupsMap.get("unassigned").divisions.push(division);
        }
      }
    });

    // Return only non-empty groups
    return Array.from(groupsMap.values()).filter(
      (group) => group.divisions.length > 0,
    );
  }, [divisions]);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return groupedDivisions
      .map((group) => {
        const parentMatch = (group.parentName ?? "")
          .toLowerCase()
          .includes(query);

        const childMatches = group.divisions.filter((division) =>
          (division?.division_name ?? "").toLowerCase().includes(query),
        );

        if (parentMatch) {
          return group;
        }

        if (childMatches.length > 0) {
          return {
            ...group,
            divisions: childMatches,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [groupedDivisions, searchQuery]);

  const filteredRows = useMemo(
    () =>
      filteredGroups.flatMap((group) =>
        group.divisions.map((division) => ({
          parentId: group.parentId,
          parentName: group.parentName,
          parentAbrv: group.parentAbrv,
          division,
        })),
      ),
    [filteredGroups],
  );

  const visibleRows = useMemo(
    () =>
      filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage],
  );

  const visibleGroups = useMemo(() => {
    const groupsMap = new Map();

    visibleRows.forEach((row) => {
      if (!groupsMap.has(row.parentId)) {
        groupsMap.set(row.parentId, {
          parentId: row.parentId,
          parentName: row.parentName,
          parentAbrv: row.parentAbrv,
          divisions: [],
        });
      }

      groupsMap.get(row.parentId).divisions.push(row.division);
    });

    return Array.from(groupsMap.values());
  }, [visibleRows]);

  return (
    <div>
      <div className="mb-6">
        <TextField
          type="text"
          placeholder="Search DICT offices..."
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
          New office
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <CircularProgress />
          </div>
        ) : divisions && divisions.length > 0 ? (
          <div className="overflow-x-auto ">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-2 text-left text-xs uppercase text-gray-700">
                    Bureau / Service / Division
                  </th>
                  <th className="px-6 py-2 text-center text-xs uppercase text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleGroups.map((group) => (
                  <Fragment key={`group-${group.parentId}`}>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-2">
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#5c5b5b" }}
                        >
                          {group.parentName || "Others"}
                        </Typography>
                      </td>
                      <td className="px-6 py-2">
                        {/* <Typography
                          variant="subtitle2"
                          sx={{ color: "#5c5b5b" }}
                        >
                          {group.parentId || "Others"}
                        </Typography> */}
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip title="Edit Division" placement="top" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              color="warning"
                              disableElevation
                              onClick={() =>
                                handleEdit(
                                  group?.parentId,
                                  group?.parentName,
                                  group?.parentAbrv,
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
                              onClick={() => handleDelete(group?.parentId)}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                    {group.divisions.map((division) => (
                      <tr key={division?.id}>
                        <td className="px-6 py-2 pl-10">
                          <Typography variant="body2" sx={{ color: "#000000" }}>
                            {division?.division_name || "N/A"}
                          </Typography>
                        </td>
                        <td className="px-6 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <Tooltip
                              title="Edit Division"
                              placement="top"
                              arrow
                            >
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
                  </Fragment>
                ))}
              </tbody>
            </table>
            <Divider />
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRows.length}
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
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
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
        setDivisions={setInternalDivisions}
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
