"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingBag, Shirt, ScanLine, Receipt, Wallet,
  Sparkles, Building2, UserCog, ChartNoAxesCombined, Settings, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const menuGroups = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Orders", href: "/orders", icon: ShoppingBag },
      { name: "Garments", href: "/garments", icon: Shirt },
      { name: "QR Scanner", href: "/qr-scanner", icon: ScanLine },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Invoices", href: "/invoices", icon: Receipt },
      { name: "Payments", href: "/payments", icon: Wallet },
      { name: "Services", href: "/services", icon: Sparkles },
      { name: "Branches", href: "/branches", icon: Building2, superAdminOnly: true },
      { name: "Staff", href: "/staff", icon: UserCog },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Reports", href: "/reports", icon: ChartNoAxesCombined },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-slate-100 bg-white">
      <div className="flex h-[82px] shrink-0 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#08A8E0] text-white">
          <Shirt size={24} />
        </div>
        <div>
          <h2 className="text-[15px] font-bold tracking-wide text-[#142033]">THE BRAND BOX</h2>
          <p className="mt-0.5 text-xs text-slate-400">Laundry Management</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !("superAdminOnly" in item && item.superAdminOnly) || user?.role === "super-admin",
          );
          return (
            <div key={group.title} className="mb-7">
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.5px] text-slate-400">{group.title}</p>
              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`group flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[13px] transition-all duration-200 ${
                        active
                          ? "bg-[#08A8E0] font-semibold text-white shadow-md shadow-cyan-500/20"
                          : "text-slate-600 hover:bg-[#EAF8FE] hover:text-[#078FC1]"
                      }`}
                    >
                      <Icon size={19} strokeWidth={1.8} className={active ? "shrink-0 text-white" : "shrink-0 text-slate-400 group-hover:text-[#08A8E0]"} />
                      <span className="flex-1">{item.name}</span>
                      {active && <ChevronRight size={15} className="text-white/80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#08A8E0] text-sm font-bold uppercase text-white">{user?.name?.charAt(0) || "A"}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name || "Admin"}</p>
            <p className="text-xs text-slate-400">{user?.role === "super-admin" ? "Super Admin" : "Branch Admin"}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
        >
          <span className="text-base">↪</span> Logout
        </button>
      </div>
    </aside>
  );
}
