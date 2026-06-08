"use client";

import {
  Typography,
  Button,
  Divider,
  TablePagination,
  CircularProgress,
  TextField,
  Tooltip,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useState, useMemo, useEffect } from "react";
import axiosInstance from "@/helper/Axios";
import NewAccountDialog from "../NewAccountDialog";
import ViewAccountModal from "../ViewAccountModal";
import DeleteAccountDialog from "../DeleteAccountDialog";

export default function AccountsTab({ data, isActive }) {
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState({});
  const [deleteAccount, setDeleteAccount] = useState({
    open: false,
    userId: null,
    email: "",
  });
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const columnVisibility = [
    "",
    "hidden md:table-cell",
    "hidden lg:table-cell",
    "hidden xl:table-cell",
    "hidden xl:table-cell",
    "",
  ];

  // ✅ Count pending accounts
  const pendingCount = accounts.filter(
    (a) => a.status === "Pending"
  ).length;

  useEffect(() => {
    if (isActive) {
      setLoading(true);
      axiosInstance
        .get("/user/getAllUser")
        .then((res) => {
          setAccounts(res.body);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isActive]);

  const handleView = (accountId) => {
    setViewAccount({ ...viewAccount, open: true, userId: accountId });
  };

  const handleDelete = (id, email) => {
    setDeleteAccount({ open: true, userId: id, email: email });
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
      accounts
        .filter((account) => {
          const matchFName = (account?.full_name ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchEmail = (account?.email ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchDivision = (account?.division_name ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          return matchFName || matchEmail || matchDivision;
        })
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [accounts, page, rowsPerPage, searchQuery]
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
        count={accounts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          "& .MuiTablePagination-toolbar": { minHeight: "44px", paddingX: 2 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { margin: 0, fontSize: "0.75rem" },
          "& .MuiTablePagination-select": { fontSize: "0.75rem" },
          "& .MuiIconButton-root": { padding: "4px" },
        }}
      />
    </>
  );

  return (
    <div>
      <ViewAccountModal
        data={viewAccount}
        setData={setViewAccount}
        setAccounts={setAccounts}
      />
      <DeleteAccountDialog
        data={deleteAccount}
        setData={setDeleteAccount}
        setAccounts={setAccounts}
      />
      <NewAccountDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        setAccounts={setAccounts}
      />

      {/* ✅ Search + Pending Badge */}
      <div className="mb-6 flex items-center gap-3">
        <TextField
          type="text"
          placeholder="Search accounts..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {pendingCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 whitespace-nowrap">
            ● {pendingCount} Pending
          </span>
        )}
      </div>

      <div className="flex items-center justify-end mb-3">
        <Button
          variant="contained"
          size="small"
          disableElevation
          onClick={handleNewEntry}
          startIcon={<AddRoundedIcon fontSize="small" />}
        >
          New Entry
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <CircularProgress />
          </div>
        ) : accounts && accounts.length > 0 ? (
          isSmallScreen ? (
            <div className="p-4 space-y-4">
              {visibleRows.map((account) => (
                <div
                  key={account.id}
                  className={`border rounded-xl p-4 shadow-sm ${
                    account.status === "Pending"
                      ? "border-red-200 bg-red-50"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {account?.full_name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {account?.email || "-"}
                      </p>
                      {/* ✅ Pending badge on mobile */}
                      {account.status === "Pending" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 mt-1">
                          Pending activation
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip title="View Account" placement="top" arrow>
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleView(account.id)}
                          sx={{ border: "1px solid #16a34a" }}
                        >
                          <RemoveRedEyeOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Account" placement="top" arrow>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(account?.id, account?.email)}
                          sx={{ border: "1px solid #dc2626" }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  <Divider className="my-3" />
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-[10px]">
                        Division
                      </p>
                      <p className="font-semibold text-gray-900">
                        {account?.division_name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-[10px]">
                        Role
                      </p>
                      <p className="font-semibold text-gray-900">
                        {account?.role || "-"}
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
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    {["Fullname", "Email", "Division", "Role", "Status", "Actions"].map(
                      (cell, index) => (
                        <th
                          key={cell}
                          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs uppercase text-gray-700 ${columnVisibility[index]}`}
                        >
                          {cell}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visibleRows.map((account) => (
                    // ✅ Highlight pending rows
                    <tr
                      key={account.id}
                      className={`align-top ${
                        account.status === "Pending" ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
                        <Typography variant="body2" className="text-gray-900 text-sm">
                          {account?.full_name || "N/A"}
                        </Typography>
                      </td>
                      <td className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 ${columnVisibility[1]}`}>
                        <Typography variant="body2" className="text-gray-900 text-sm">
                          {account?.email || "N/A"}
                        </Typography>
                      </td>
                      <td className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 ${columnVisibility[2]}`}>
                        <Typography variant="body2" className="text-gray-900 text-sm">
                          {account?.division_name || "N/A"}
                        </Typography>
                      </td>
                      <td className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 ${columnVisibility[3]}`}>
                        <Typography variant="body2" className="text-gray-900 text-sm">
                          {account?.role || "N/A"}
                        </Typography>
                      </td>
                      {/* ✅ Status column */}
                      <td className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 ${columnVisibility[4]}`}>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            account.status === "Pending"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {account.status || "Active"}
                        </span>
                      </td>
                      <td className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 ${columnVisibility[5]}`}>
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip title="View Account" placement="top" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              color="success"
                              disableElevation
                              onClick={() => handleView(account.id)}
                            >
                              <RemoveRedEyeOutlinedIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete Account" placement="top" arrow>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disableElevation
                              onClick={() => handleDelete(account?.id, account?.email)}
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
              <p>No accounts found matching &quot;{searchQuery}&quot;</p>
            ) : (
              <p>No accounts found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}