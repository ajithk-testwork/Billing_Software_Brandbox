"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  CalendarDays,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";

type OrderRecord = {
  id: string;
  total: number;
  status: string;
  date: Date;
  customerName: string;
};

type PaymentRecord = {
  id: string;
  amount: number;
  status: string;
  date: Date;
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const readDate = (value: unknown): Date => {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const getOrderRecords = (): OrderRecord[] => {
  try {
    const raw = JSON.parse(localStorage.getItem("brandbox_orders") || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((item: Record<string, unknown>, index: number) => ({
      id: String(item.id ?? item.orderId ?? `order-${index}`),
      total: Number(item.total ?? item.totalAmount ?? item.amount ?? 0) || 0,
      status: String(item.status ?? item.orderStatus ?? "Pending"),
      date: readDate(item.createdAt ?? item.date ?? item.orderDate),
      customerName: String(
        item.customerName ?? item.customer ?? item.name ?? "Customer",
      ),
    }));
  } catch {
    return [];
  }
};

const getPaymentRecords = (): PaymentRecord[] => {
  try {
    const raw = JSON.parse(localStorage.getItem("brandbox_payments") || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((item: Record<string, unknown>, index: number) => ({
      id: String(item.id ?? `payment-${index}`),
      amount: Number(item.amount ?? 0) || 0,
      status: String(item.status ?? "Pending"),
      date: readDate(item.date ?? item.createdAt),
    }));
  } catch {
    return [];
  }
};

const getCustomersCount = () => {
  try {
    const raw = JSON.parse(localStorage.getItem("brandbox_customers") || "[]");
    return Array.isArray(raw) ? raw.length : 0;
  } catch {
    return 0;
  }
};

const getGarmentsCount = () => {
  try {
    const raw = JSON.parse(localStorage.getItem("brandbox_pricing") || "[]");
    return Array.isArray(raw) ? raw.length : 0;
  } catch {
    return 0;
  }
};

export default function ReportsPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [garmentsCount, setGarmentsCount] = useState(0);
  const [period, setPeriod] = useState("30");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadData = () => {
    setOrders(getOrderRecords());
    setPayments(getPaymentRecords());
    setCustomersCount(getCustomersCount());
    setGarmentsCount(getGarmentsCount());
    setLastUpdated(new Date().toLocaleString("en-IN"));
  };

  useEffect(() => {
    loadData();
    const onStorage = () => loadData();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cutoff = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - Number(period));
    date.setHours(0, 0, 0, 0);
    return date;
  }, [period]);

  const periodOrders = orders.filter((order) => order.date >= cutoff);
  const periodPayments = payments.filter((payment) => payment.date >= cutoff);
  const completedPayments = periodPayments.filter(
    (payment) =>
      payment.status.toLowerCase() === "completed" ||
      payment.status.toLowerCase() === "paid",
  );
  const revenue = completedPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const pendingPayments = periodPayments.filter(
    (payment) => payment.status.toLowerCase() === "pending",
  );
  const pendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const completedOrders = periodOrders.filter((order) =>
    ["completed", "delivered", "ready"].includes(order.status.toLowerCase()),
  ).length;
  const averageOrderValue = periodOrders.length
    ? periodOrders.reduce((sum, order) => sum + order.total, 0) /
      periodOrders.length
    : 0;

  const monthlyBars = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - (5 - index),
        1,
      );
      const monthRevenue = completedPayments
        .filter(
          (payment) =>
            payment.date.getFullYear() === date.getFullYear() &&
            payment.date.getMonth() === date.getMonth(),
        )
        .reduce((sum, payment) => sum + payment.amount, 0);
      return {
        label: date.toLocaleDateString("en-IN", { month: "short" }),
        revenue: monthRevenue,
      };
    });
  }, [completedPayments]);

  const maxRevenue = Math.max(...monthlyBars.map((bar) => bar.revenue), 1);

  const filteredOrders = periodOrders.filter((order) =>
    `${order.id} ${order.customerName} ${order.status}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const exportOrders = () => {
    const header = ["Order ID", "Customer", "Date", "Status", "Amount"];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.customerName,
      order.date.toISOString().slice(0, 10),
      order.status,
      order.total,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "brandbox-orders-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            ANALYTICS / OVERVIEW
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
            Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Understand your laundry business performance at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
          </select>
          <button
            onClick={loadData}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CalendarDays size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Collected Revenue",
            value: money(revenue),
            note: `${completedPayments.length} successful payments`,
            icon: IndianRupee,
            tone: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Total Orders",
            value: periodOrders.length.toLocaleString("en-IN"),
            note: `${completedOrders} completed / ready`,
            icon: ShoppingBag,
            tone: "bg-[#EAF8FE] text-[#08A8E0]",
          },
          {
            label: "Pending Collection",
            value: money(pendingAmount),
            note: `${pendingPayments.length} pending payments`,
            icon: TrendingDown,
            tone: "bg-amber-50 text-amber-600",
          },
          {
            label: "Average Order Value",
            value: money(averageOrderValue),
            note: "Based on orders in selected period",
            icon: TrendingUp,
            tone: "bg-violet-50 text-violet-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}
                >
                  <Icon size={20} />
                </div>
                <BarChart3 size={17} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-[#142033]">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-[#142033]">Revenue overview</h2>
              <p className="mt-1 text-xs text-slate-500">
                Successful payments · Last 6 months
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Collected
            </span>
          </div>
          <div className="flex h-56 items-end gap-3 border-b border-l border-slate-100 px-2 pb-0 pt-5 sm:gap-5">
            {monthlyBars.map((bar) => (
              <div
                key={bar.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] font-medium text-slate-500">
                  {bar.revenue ? money(bar.revenue) : "—"}
                </span>
                <div className="flex h-[78%] w-full items-end justify-center">
                  <div
                    title={`${bar.label}: ${money(bar.revenue)}`}
                    className="w-full max-w-12 rounded-t-lg bg-[#08A8E0] transition-all hover:bg-[#078FC1]"
                    style={{
                      height: `${Math.max((bar.revenue / maxRevenue) * 100, bar.revenue ? 5 : 1)}%`,
                    }}
                  />
                </div>
                <span className="pb-2 text-xs text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
          {!completedPayments.length && (
            <p className="mt-3 text-center text-xs text-slate-400">
              No completed payment records found for this period.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-[#142033]">Business snapshot</h2>
            <p className="mt-1 text-xs text-slate-500">
              Current catalogue and customer totals
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Customers",
                value: customersCount,
                icon: Users,
                color: "text-blue-600 bg-blue-50",
              },
              {
                label: "Garment types",
                value: garmentsCount,
                icon: Package,
                color: "text-violet-600 bg-violet-50",
              },
              {
                label: "Orders in period",
                value: periodOrders.length,
                icon: ShoppingBag,
                color: "text-[#08A8E0] bg-[#EAF8FE]",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-[#142033]">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Data refreshed
            </p>
            <p className="mt-1 text-sm font-semibold text-[#142033]">
              {lastUpdated || "Loading..."}
            </p>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-[#142033]">Orders report</h2>
            <p className="mt-1 text-xs text-slate-500">
              Orders within the selected date range
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-[#08A8E0] sm:w-56"
              />
            </div>
            <button
              onClick={exportOrders}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#08A8E0] px-4 text-sm font-semibold text-white hover:bg-[#078FC1]"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Order ID</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 text-sm font-semibold text-[#142033]">
                    {order.id}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {order.customerName}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {order.date.toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold text-[#142033]">
                    {money(order.total)}
                  </td>
                </tr>
              ))}
              {!filteredOrders.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <FileSpreadsheet
                      size={24}
                      className="mx-auto mb-2 text-slate-300"
                    />
                    <p className="text-sm font-semibold text-slate-600">
                      No order data available
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Create orders to see report details here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredOrders.length} orders
        </div>
      </section>
    </div>
  );
}
