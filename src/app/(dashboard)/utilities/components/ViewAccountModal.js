"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import { CircularProgress } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

export default function ViewAccountModal({ data, setData, setAccounts }) {
  const { setError } = useError();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [userStatus, setUserStatus] = useState("");
  const [divOption, setDivOption] = useState([]);
  const [roleOption, setRoleOption] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  
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
      setSelectedDivision("");
      
      axiosInstance.get("/office/getAllDivision")
        .then(async (res) => {
          const options = res.body.filter((div) => div.office_type === "internal" && div.parent_id !== null);
          setDivOption(options);
          await fetchUserDetails();
        })
        .catch(() => {
          setError("Failed to fetch divisions.");
          handleClose();
          setLoading(false);
        });

      axiosInstance.get("/roles/getAllRoles")
        .then((res) => setRoleOption(res.body))
        .catch(() => setError("Failed to fetch roles."));
    }
  }, [data.open, data.userId]);

  const fetchUserDetails = async () => {
    axiosInstance.post("/user/getUserDetail", { userId: data.userId })
      .then((res) => {
        const user = res.body;
        
        // Safely parse roles and forcefully convert IDs to lowercase to fix SQL Server GUID mismatches
        const parsedRole = (() => {
          try { return Array.isArray(user.role) ? user.role : JSON.parse(user.role); } 
          catch { return []; }
        })();
        const roleIds = Array.isArray(parsedRole) 
          ? parsedRole.map((role) => (role.id || role.role_id || "").toLowerCase()).filter(Boolean) 
          : [];

        // If the SP succeeds, the user is inherently active unless the fallback flagged them as pending
        setUserStatus(user.status || "Active");
        
        // Force division ID to lowercase for perfect matching
        const divId = (user.division_id || user.division || "").toLowerCase();

        const initialData = {
          firstName: user.f_name || "",
          middleName: user.m_name || "",
          lastName: user.l_name || "",
          email: user.email || "",
          divisionName: user.division_name || "",
          divisionId: divId,
          role: roleIds,
        };
        
        setFormData(initialData);
        setOldData(initialData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch user details");
        handleClose();
        setLoading(false);
      });
  };

  const handleAssignDivision = () => {
    if (!selectedDivision) {
      setError("Please select a division first", "warning");
      return;
    }
    setAssignLoading(true);
    axiosInstance.post("/user/assignDivision", { user_id: data.userId, division_id: selectedDivision })
      .then(() => {
        setError("Division assigned successfully!", "success");
        const divObj = divOption.find((d) => d.id.toLowerCase() === selectedDivision);
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === data.userId ? { ...acc, division_name: divObj?.division_name || "", status: "Active" } : acc
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
    setSelectedDivision("");
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.divisionId) {
      setError("Please fill out all required fields.", "warning");
      return;
    }

    const changes = {};
    Object.keys(formData).forEach((key) => {
      if (key === "role") {
        if (JSON.stringify([...formData.role].sort()) !== JSON.stringify([...oldData.role].sort())) changes[key] = formData[key];
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
    if (changes.firstName) updateData.newFName = formData.firstName;
    if (changes.middleName) updateData.newMName = formData.middleName;
    if (changes.lastName) updateData.newLName = formData.lastName;
    if (changes.email) updateData.newEmail = formData.email;
    if (changes.divisionId) updateData.newDiv = formData.divisionId;
    if (changes.role) updateData.newRole = formData.role;

    axiosInstance.post("/user/editUser", updateData)
      .then((res) => {
        setError(res.message, "success");
        setAccounts((prev) => prev.map((acc) => (acc.id === data.userId ? res.body : acc)));
        setIsEditing(false);
        handleClose();
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to update user.", "error");
        setLoading(false);
      });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleToggle = (roleId) => {
    if (!isEditing) return;
    const lowerId = roleId.toLowerCase();
    setFormData((prev) => {
      const newRoles = prev.role.includes(lowerId) ? prev.role.filter((id) => id !== lowerId) : [...prev.role, lowerId];
      return { ...prev, role: newRoles };
    });
  };

  if (!data.open) return null;

  const isPending = userStatus === "Pending";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#002868] dark:text-blue-400">Account Details</h2>
            {userStatus && (
              <span className={`px-2.5 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wider border ${
                isPending ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50" 
                : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
              }`}>
                {userStatus}
              </span>
            )}
          </div>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto hide-scrollbar text-slate-800 dark:text-slate-200 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <CircularProgress size={40} thickness={4} className="text-[#002868] dark:text-blue-400" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Pending Assign Alert */}
              {isPending && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Action Required</h3>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-500 mb-3">Assign a division to officially activate this account.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select 
                      value={selectedDivision} 
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="" disabled>Select Division...</option>
                      {divOption.map(d => <option key={d.id} value={d.id.toLowerCase()}>{d.division_name}</option>)}
                    </select>
                    <button 
                      onClick={handleAssignDivision} 
                      disabled={assignLoading || !selectedDivision}
                      className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-bold transition-colors flex justify-center min-w-[100px]"
                    >
                      {assignLoading ? <CircularProgress size={16} color="inherit" /> : "Assign"}
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Toggle */}
              {!isPending && (
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${
                      isEditing ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isEditing ? <CloseRoundedIcon fontSize="small"/> : <EditRoundedIcon fontSize="small"/>}
                    {isEditing ? "Cancel Editing" : "Edit Account"}
                  </button>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-[#002868] dark:focus:border-blue-500 disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Middle Name</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} disabled={!isEditing} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-[#002868] dark:focus:border-blue-500 disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-[#002868] dark:focus:border-blue-500 disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-[#002868] dark:focus:border-blue-500 disabled:opacity-60" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Division</label>
                  <select name="divisionId" value={formData.divisionId} onChange={handleChange} disabled={!isEditing} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-[#002868] dark:focus:border-blue-500 disabled:opacity-60">
                    <option value="" disabled>Select Division</option>
                    {divOption.map(div => <option key={div.id} value={div.id.toLowerCase()}>{div.division_name}</option>)}
                  </select>
                </div>
                
                {/* Roles Checkboxes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">System Roles</label>
                  <div className="flex flex-wrap gap-3">
                    {roleOption.map(role => {
                      const isSelected = formData.role.includes(role.id.toLowerCase());
                      return (
                        <div 
                          key={role.id} 
                          onClick={() => handleRoleToggle(role.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold transition-all select-none ${
                            !isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                          } ${
                            isSelected 
                              ? "border-[#002868] bg-[#002868]/5 text-[#002868] dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400" 
                              : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? "border-[#002868] bg-[#002868] dark:border-blue-500 dark:bg-blue-500" : "border-slate-300 dark:border-slate-600"}`}>
                            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="capitalize">{role.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && !isPending && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex justify-end">
            <button onClick={handleSave} className="bg-[#002868] dark:bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-bold shadow-sm hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors">
              Save Changes
            </button>
          </div>
        )}

      </div>
    </div>
  );
}