"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Eye,
  X,
  CreditCard,
  Wallet,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Filter,
  Copy,
  ArrowDownToLine,
} from "lucide-react";

type PaymentStatus = "Completed" | "Pending" | "Failed";
type PaymentMethod = "UPI" | "Cash" | "Card" | "Bank Transfer";

interface Payment {
  id: string;
  paymentId: string;
  customer: string;
  phone: string;
  orderId: string;
  date: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference: string;
}

const STORAGE_KEY = "brandbox_payments";
const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const samplePayments: Payment[] = [
  {
    id: "pay-1001",
    paymentId: "PAY-2026-001",
    customer: "Arun Kumar",
    phone: "9876543210",
    orderId: "ORD-1024",
    date: "2026-11-14",
    method: "UPI",
    amount: 850,
    status: "Completed",
    reference: "UPI48290175",
  },
  {
    id: "pay-1002",
    paymentId: "PAY-2026-002",
    customer: "Priya Sharma",
    phone: "9876501234",
    orderId: "ORD-1025",
    date: "2026-11-14",
    method: "Cash",
    amount: 1250,
    status: "Pending",
    reference: "CASH-1025",
  },
  {
    id: "pay-1003",
    paymentId: "PAY-2026-003",
    customer: "Rahul M",
    phone: "9840012345",
    orderId: "ORD-1026",
    date: "2026-11-13",
    method: "Card",
    amount: 560,
    status: "Failed",
    reference: "CARD-770129",
  },
  {
    id: "pay-1004",
    paymentId: "PAY-2026-004",
    customer: "Meena Devi",
    phone: "9003012345",
    orderId: "ORD-1027",
    date: "2026-11-12",
    method: "Bank Transfer",
    amount: 1720,
    status: "Completed",
    reference: "NEFT-551902",
  },
];

const statusStyle: Record<PaymentStatus, string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-rose-50 text-rose-700",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [selected, setSelected] = useState<Payment | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPayments(Array.isArray(parsed) ? parsed : samplePayments);
      } else setPayments(samplePayments);
    } catch {
      setPayments(samplePayments);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  }, [payments, loaded]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesSearch = [
        payment.paymentId,
        payment.customer,
        payment.phone,
        payment.orderId,
        payment.reference,
      ].some((value) => String(value).toLowerCase().includes(term));
      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;
      const matchesMethod =
        methodFilter === "All" || payment.method === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const completedTotal = payments
    .filter((item) => item.status === "Completed")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingTotal = payments
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + item.amount, 0);
  const failedCount = payments.filter(
    (item) => item.status === "Failed",
  ).length;

  const exportCsv = () => {
    const header = [
      "Payment ID",
      "Customer",
      "Phone",
      "Order ID",
      "Date",
      "Method",
      "Amount",
      "Status",
      "Reference",
    ];
    const rows = filtered.map((item) => [
      item.paymentId,
      item.customer,
      item.phone,
      item.orderId,
      item.date,
      item.method,
      item.amount,
      item.status,
      item.reference,
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
    anchor.download = "brandbox-payments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = (id: string, status: PaymentStatus) => {
    setPayments((previous) =>
      previous.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setSelected((previous) =>
      previous?.id === id ? { ...previous, status } : previous,
    );
  };

  const copyReference = async (reference: string) => {
    try {
      await navigator.clipboard.writeText(reference);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            MANAGEMENT / BILLING
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
            Payments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor payment transactions and track collection status.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Download size={17} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Transactions",
            value: payments.length.toLocaleString("en-IN"),
            icon: CreditCard,
            tone: "bg-[#EAF8FE] text-[#08A8E0]",
          },
          {
            label: "Collected Amount",
            value: money(completedTotal),
            icon: CheckCircle2,
            tone: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Pending Amount",
            value: money(pendingTotal),
            icon: Clock3,
            tone: "bg-amber-50 text-amber-600",
          },
          {
            label: "Failed Payments",
            value: failedCount.toString(),
            icon: AlertCircle,
            tone: "bg-rose-50 text-rose-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}
              >
                <Icon size={20} />
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-[#142033]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payment, customer or order..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#08A8E0] focus:bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
              >
                <option value="All">All statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <select
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
            >
              <option value="All">All methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Payment</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Order ID</th>
                <th className="px-5 py-4 font-semibold">Method</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#142033]">
                      {payment.paymentId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {payment.reference}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#142033]">
                      {payment.customer}
                    </p>
                    <p className="text-xs text-slate-400">{payment.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {payment.orderId}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <Wallet size={15} className="text-slate-400" />
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {payment.date}
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#142033]">
                    {money(payment.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle[payment.status]}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelected(payment)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-[#08A8E0] hover:text-[#08A8E0]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <CreditCard
                      size={25}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="font-semibold text-[#142033]">
                      No payments found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filtered.length} of {payments.length} transactions
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold text-[#142033]">Payment details</h2>
                <p className="text-sm text-slate-500">{selected.paymentId}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <p className="text-xs text-slate-400">CUSTOMER</p>
                <p className="mt-1 font-semibold text-[#142033]">
                  {selected.customer}
                </p>
                <p className="text-sm text-slate-500">{selected.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">ORDER ID</p>
                  <p className="mt-1 text-sm font-semibold">
                    {selected.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">METHOD</p>
                  <p className="mt-1 text-sm font-semibold">
                    {selected.method}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">REFERENCE</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="break-all text-sm font-semibold text-slate-700">
                    {selected.reference}
                  </p>
                  <button
                    onClick={() => copyReference(selected.reference)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    aria-label="Copy reference"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Payment amount</p>
                <p className="mt-1 text-2xl font-bold text-[#142033]">
                  {money(selected.amount)}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[selected.status]}`}
                >
                  {selected.status}
                </span>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Update payment status
                </label>
                <select
                  value={selected.status}
                  onChange={(event) =>
                    updateStatus(
                      selected.id,
                      event.target.value as PaymentStatus,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
                <p className="mt-1 text-xs text-slate-400">
                  Demo status update only. Connect to payment gateway/backend
                  for live transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
