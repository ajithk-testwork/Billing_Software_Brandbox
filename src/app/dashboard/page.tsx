
"use client";

import {
  Users,
  ShoppingBag,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ScanLine,
  Receipt,
  CalendarDays,
  TrendingUp,
  MoreHorizontal,
  Shirt,
  ChevronRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Customers",
    value: "1,248",
    change: "+12.5%",
    icon: Users,
    color: "bg-[#EAF8FE] text-[#08A8E0]",
  },
  {
    title: "Total Orders",
    value: "856",
    change: "+8.2%",
    icon: ShoppingBag,
    color: "bg-[#F0F0FF] text-[#7774DC]",
  },
  {
    title: "Total Revenue",
    value: "₹84,500",
    change: "+15.3%",
    icon: Wallet,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Pending Orders",
    value: "48",
    change: "12 urgent",
    icon: Clock,
    color: "bg-orange-50 text-orange-500",
  },
];

const orders = [
  {
    id: "ORD-1001",
    customer: "Arun Kumar",
    service: "Wash & Iron",
    date: "15 Nov 2026",
    amount: "₹850",
    status: "Processing",
  },
  {
    id: "ORD-1002",
    customer: "Priya Sharma",
    service: "Dry Cleaning",
    date: "15 Nov 2026",
    amount: "₹1,200",
    status: "Ready",
  },
  {
    id: "ORD-1003",
    customer: "Rahul Kumar",
    service: "Premium Wash",
    date: "14 Nov 2026",
    amount: "₹650",
    status: "Pending",
  },
  {
    id: "ORD-1004",
    customer: "Karthik R",
    service: "Wash & Fold",
    date: "14 Nov 2026",
    amount: "₹950",
    status: "Delivered",
  },
];

const revenue = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 70 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 90 },
  { day: "Fri", value: 65 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 75 },
];

const statusData = [
  { name: "Pending", count: 48, width: 28, color: "bg-orange-400" },
  { name: "Processing", count: 86, width: 55, color: "bg-[#08A8E0]" },
  { name: "Ready", count: 32, width: 20, color: "bg-purple-500" },
  { name: "Delivered", count: 120, width: 78, color: "bg-emerald-500" },
];

const quickActions = [
  {
    title: "New Customer",
    description: "Register a customer",
    icon: Users,
    href: "/customers",
    color: "bg-[#EAF8FE] text-[#08A8E0]",
  },
  {
    title: "Create Order",
    description: "Add a new laundry order",
    icon: ShoppingBag,
    href: "/orders",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Scan QR",
    description: "Identify garments",
    icon: ScanLine,
    href: "/qr-scanner",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "New Invoice",
    description: "Generate an invoice",
    icon: Receipt,
    href: "/invoices",
    color: "bg-orange-50 text-orange-600",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Processing: "bg-blue-50 text-blue-700",
    Ready: "bg-purple-50 text-purple-700",
    Pending: "bg-orange-50 text-orange-700",
    Delivered: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-7">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            BUSINESS OVERVIEW
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your business today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
            <CalendarDays size={16} />
            Today
          </button>

          <a
            href="/orders"
            className="flex items-center gap-2 rounded-xl bg-[#08A8E0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078FC1]"
          >
            <Plus size={17} />
            New Order
          </a>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                <button className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-50 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {item.title}
              </p>

              <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-[#142033]">
                  {item.value}
                </h2>

                <span
                  className={`mb-1 flex items-center gap-1 text-xs font-semibold ${
                    item.title === "Pending Orders"
                      ? "text-orange-500"
                      : "text-emerald-600"
                  }`}
                >
                  {item.title === "Pending Orders" ? (
                    <Clock size={13} />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                  {item.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* REVENUE */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#142033]">
                Revenue Overview
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Weekly revenue performance
              </p>
            </div>

            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-[#08A8E0]">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <h3 className="text-3xl font-bold text-[#142033]">
              ₹84,500
            </h3>

            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
              <TrendingUp size={13} />
              15.3%
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Compared to previous week
          </p>

          <div className="mt-8 flex h-[190px] items-end justify-between gap-3 border-b border-slate-100 pb-2">
            {revenue.map((item) => (
              <div
                key={item.day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-3"
              >
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    style={{ height: `${item.value}%` }}
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                      item.day === "Sat"
                        ? "bg-[#08A8E0]"
                        : "bg-[#C9EFFC] hover:bg-[#08A8E0]"
                    }`}
                  />
                </div>

                <span className="text-xs text-slate-400">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ORDER STATUS */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#142033]">
            Order Status
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Current order distribution
          </p>

          <div className="mt-7 space-y-6">
            {statusData.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    {item.name}
                  </span>

                  <span className="text-sm font-bold text-[#142033]">
                    {item.count}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <a
            href="/orders"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 transition hover:border-[#08A8E0] hover:text-[#08A8E0]"
          >
            View All Orders
            <ChevronRight size={16} />
          </a>
        </section>
      </div>

      {/* RECENT ORDERS */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-bold text-[#142033]">
              Recent Orders
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Latest customer orders and updates
            </p>
          </div>

          <a
            href="/orders"
            className="flex items-center gap-1 text-sm font-semibold text-[#08A8E0] hover:text-[#078FC1]"
          >
            View All
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="border-y border-slate-100 bg-slate-50/70">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Service</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-[#142033]">
                    {order.id}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {order.customer}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {order.service}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {order.date}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-[#142033]">
                    {order.amount}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">
            Showing 4 recent orders
          </p>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <h2 className="mb-4 font-bold text-[#142033]">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <a
                href={action.href}
                key={action.title}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#08A8E0]/40 hover:shadow-md"
              >
                <div className={`rounded-xl p-3 ${action.color}`}>
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {action.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-slate-300 transition group-hover:text-[#08A8E0]"
                />
              </a>
            );
          })}
        </div>
      </section>

    </div>
  );
}
