"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import { signOut } from "next-auth/react";

// Icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import SettingsApplicationsRoundedIcon from "@mui/icons-material/SettingsApplicationsRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

// Define the absolute truth for role access
const NAVIGATION = [
  { name: "Dashboard", href: "/home", icon: HomeRoundedIcon, allowedRoles: ["admin", "crru", "user"] },
  { name: "Evaluate", href: "/evaluate", icon: InsertDriveFileRoundedIcon, allowedRoles: ["admin", "crru", "user"] },
  { name: "Incoming", href: "/incoming", icon: MoveToInboxRoundedIcon, allowedRoles: ["admin", "crru"] },
  { name: "System Utilities", href: "/utilities", icon: SettingsApplicationsRoundedIcon, allowedRoles: ["admin"] },
];

export default function DashboardLayout({ children }) {
  const { session, status } = useProtectedRoute();
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // Calculate roles directly on render (No stale useState!)
  const userRoles = (() => {
    if (!session?.user?.role) return [];
    try {
      let rolesArray = [];
      
      // Catch comma-separated strings (e.g. "admin, crru")
      if (typeof session.user.role === "string" && !session.user.role.startsWith("[")) {
        rolesArray = session.user.role.split(",").map(r => r.trim());
      } 
      // Parse JSON arrays from the database
      else {
        rolesArray = Array.isArray(session.user.role) ? session.user.role : JSON.parse(session.user.role);
      }

      // Force everything to a clean lowercase string array
      return rolesArray.map(r => String(typeof r === "string" ? r : (r.name || "")).toLowerCase());
    } catch (err) {
      return [];
    }
  })();

  // Helper to strictly format role text to Admin, CRRU, or User for the badge
  const getFormattedRoles = () => {
    if (userRoles.length === 0) return "Pending";
    return userRoles.map(role => {
      if (role === "admin") return "Admin";
      if (role === "crru") return "CRRU";
      if (role === "user") return "User";
      return role;
    }).join(", ");
  };

  // Filter navigation synchronously based on the user's authorized roles
  const filteredNav = NAVIGATION.filter(item => 
    item.allowedRoles.some(allowed => userRoles.includes(allowed))
  );

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 flex font-sans text-slate-900 dark:text-slate-100">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <Image src="/dict_logo.png" alt="DICT" fill className="object-contain" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#002868] dark:text-blue-400">DocVal</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <CloseRoundedIcon />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 hide-scrollbar">
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  isActive 
                    ? "bg-[#002868] text-white shadow-md dark:bg-blue-600" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#002868] dark:hover:text-blue-400"
                }`}>
                  <item.icon fontSize="small" className={isActive ? "text-blue-200" : "opacity-70"} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Profile Link) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <Link href="/profile" onClick={() => setSidebarOpen(false)}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
              pathname.startsWith("/profile") 
                ? "bg-[#002868] text-white shadow-md dark:bg-blue-600" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#002868] dark:hover:text-blue-400"
            }`}>
              <AccountCircleRoundedIcon fontSize="small" className={pathname.startsWith("/profile") ? "text-blue-200" : "opacity-70"} />
              My Profile
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 -ml-2 text-slate-500 hover:text-[#002868] dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
              <MenuRoundedIcon />
            </button>
            <h1 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 hidden sm:block">
              Department of Information and Communications Technology
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors border border-slate-200 dark:border-slate-700">
              {isDarkMode ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
            </button>

            {/* Formatted Role Badge */}
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-extrabold text-[#002868] dark:text-blue-400 leading-tight">
                {session?.user?.f_name} {session?.user?.l_name}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm mt-0.5 border border-slate-200 dark:border-slate-700">
                {getFormattedRoles()}
              </span>
            </div>

            <button onClick={handleLogout} className="p-2 text-red-500 hover:text-white hover:bg-red-500 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-600 rounded-lg transition-colors border border-red-100 dark:border-red-900/30 flex items-center gap-2 group">
              <LogoutRoundedIcon fontSize="small" />
              <span className="text-sm font-bold hidden md:block">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}