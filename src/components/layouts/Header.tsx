"use client";

import { useState } from "react";
import { Bell, Search, Menu, ChevronDown, User, Settings, LogOut, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[82px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
          <Menu size={22} />
        </button>
        <div className="relative hidden w-[320px] md:block">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search anything..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#08A8E0] focus:bg-white focus:ring-2 focus:ring-cyan-500/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
            <Bell size={21} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-14 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              <p className="mt-3 text-sm text-slate-500">No new notifications.</p>
            </div>
          )}
        </div>

        <div className="h-9 w-px bg-slate-200" />

        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 rounded-xl py-1 hover:bg-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#08A8E0] text-sm font-bold uppercase text-white">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="max-w-36 truncate text-sm font-semibold text-slate-800">{user?.name || "Admin"}</p>
              <p className="text-xs text-slate-400">
                {user?.role === "super-admin" ? "Super Admin" : "Branch Admin"}
              </p>
            </div>
            <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-14 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.businessName}</p>
                <p className="truncate text-xs text-slate-400">{user?.branchName || "All branches"}</p>
              </div>
              <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                <User size={16} /> My Profile
              </Link>
              <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                <Settings size={16} /> Settings
              </Link>
              {user?.role === "branch-admin" && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
                  <Store size={14} /> {user.branchName}
                </div>
              )}
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
