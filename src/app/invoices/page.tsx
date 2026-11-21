"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Eye,
  X,
  FileText,
  IndianRupee,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Printer,
  Filter,
} from "lucide-react";

type InvoiceStatus = "Paid" | "Pending" | "Overdue";

interface Invoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

const STORAGE_KEY = "brandbox_invoices";
const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const sampleInvoices: Invoice[] = [
  {
    id: "inv-1001",
    invoiceNo: "INV-2026-001",
    customerName: "Arun Kumar",
    customerPhone: "9876543210",
    orderId: "ORD-1024",
    date: "2026-11-14",
    dueDate: "2026-11-14",
    amount: 850,
    status: "Paid",
  },
  {
    id: "inv-1002",
    invoiceNo: "INV-2026-002",
    customerName: "Priya Sharma",
    customerPhone: "9876501234",
    orderId: "ORD-1025",
    date: "2026-11-14",
    dueDate: "2026-11-17",
    amount: 1250,
    status: "Pending",
  },
  {
    id: "inv-1003",
    invoiceNo: "INV-2026-003",
    customerName: "Rahul M",
    customerPhone: "9840012345",
    orderId: "ORD-1026",
    date: "2026-11-13",
    dueDate: "2026-11-15",
    amount: 560,
    status: "Overdue",
  },
  {
    id: "inv-1004",
    invoiceNo: "INV-2026-004",
    customerName: "Meena Devi",
    customerPhone: "9003012345",
    orderId: "ORD-1027",
    date: "2026-11-12",
    dueDate: "2026-11-15",
    amount: 1720,
    status: "Paid",
  },
];

const statusStyle: Record<InvoiceStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Overdue: "bg-rose-50 text-rose-700",
};

function readInvoice(raw: unknown, index: number): Invoice | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const amount = Number(item.amount ?? item.totalAmount ?? item.total ?? 0);
  const customer =
    item.customer && typeof item.customer === "object"
      ? (item.customer as Record<string, unknown>)
      : {};
  const statusText = String(
    item.status ?? item.paymentStatus ?? "Pending",
  ).toLowerCase();
  const status: InvoiceStatus = statusText.includes("paid")
    ? "Paid"
    : statusText.includes("overdue")
      ? "Overdue"
      : "Pending";
  const date = String(
    item.date ?? item.createdAt ?? item.orderDate ?? new Date().toISOString(),
  ).slice(0, 10);
  return {
    id: String(item.id ?? item.documentId ?? `invoice-${index}`),
    invoiceNo: String(
      item.invoiceNo ??
        item.invoiceNumber ??
        `INV-${String(index + 1).padStart(4, "0")}`,
    ),
    customerName: String(
      item.customerName ?? customer.name ?? item.name ?? "Customer",
    ),
    customerPhone: String(
      item.customerPhone ?? customer.phone ?? item.phone ?? "—",
    ),
    orderId: String(item.orderId ?? item.orderNumber ?? item.order ?? "—"),
    date,
    dueDate: String(item.dueDate ?? date).slice(0, 10),
    amount: Number.isFinite(amount) ? amount : 0,
    status,
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setInvoices(Array.isArray(parsed) ? parsed : sampleInvoices);
      } else {
        setInvoices(sampleInvoices);
      }
    } catch {
      setInvoices(sampleInvoices);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  }, [invoices, loaded]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matches = [
        invoice.invoiceNo,
        invoice.customerName,
        invoice.customerPhone,
        invoice.orderId,
      ].some((value) => value.toLowerCase().includes(term));
      return (
        matches && (statusFilter === "All" || invoice.status === statusFilter)
      );
    });
  }, [invoices, search, statusFilter]);

  const paidTotal = invoices
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingTotal = invoices
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + item.amount, 0);
  const overdueTotal = invoices
    .filter((item) => item.status === "Overdue")
    .reduce((sum, item) => sum + item.amount, 0);

  const exportCsv = () => {
    const header = [
      "Invoice No",
      "Customer",
      "Phone",
      "Order ID",
      "Date",
      "Due Date",
      "Amount",
      "Status",
    ];
    const rows = filtered.map((item) => [
      item.invoiceNo,
      item.customerName,
      item.customerPhone,
      item.orderId,
      item.date,
      item.dueDate,
      item.amount,
      item.status,
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
    anchor.download = "brandbox-invoices.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const printInvoice = (invoice: Invoice) => {
    const popup = window.open("", "_blank", "width=800,height=900");
    if (!popup) return;
    popup.document.write(`
      <html><head><title>${invoice.invoiceNo}</title>
      <style>body{font-family:Arial,sans-serif;padding:48px;color:#142033}header{display:flex;justify-content:space-between;border-bottom:2px solid #08A8E0;padding-bottom:20px}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:35px}td{padding:14px;border-bottom:1px solid #ddd}.total{font-size:22px;font-weight:bold;text-align:right;margin-top:30px}.muted{color:#64748b}</style></head>
      <body><header><div><h1>THE BRAND BOX</h1><p class="muted">Laundry Management</p></div><div><h2>INVOICE</h2><p>${invoice.invoiceNo}</p></div></header>
      <p><b>Bill To:</b> ${invoice.customerName}<br/>${invoice.customerPhone}</p>
      <p><b>Order:</b> ${invoice.orderId} &nbsp; <b>Date:</b> ${invoice.date}</p>
      <table><tr><td>Laundry service order</td><td style="text-align:right">${money(invoice.amount)}</td></tr></table>
      <p class="total">Total: ${money(invoice.amount)}</p><p class="muted">Thank you for choosing The Brand Box.</p>
      <script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            MANAGEMENT / BILLING
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track bills, payments and outstanding balances.
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
            label: "Total Invoices",
            value: invoices.length.toLocaleString("en-IN"),
            icon: FileText,
            tone: "bg-[#EAF8FE] text-[#08A8E0]",
          },
          {
            label: "Paid Amount",
            value: money(paidTotal),
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
            label: "Overdue Amount",
            value: money(overdueTotal),
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
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice or customer..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#08A8E0] focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
            >
              <option value="All">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Invoice</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Order ID</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#142033]">
                      {invoice.invoiceNo}
                    </p>
                    <p className="text-xs text-slate-400">
                      Due {invoice.dueDate}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#142033]">
                      {invoice.customerName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {invoice.customerPhone}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {invoice.orderId}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {invoice.date}
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#142033]">
                    {money(invoice.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle[invoice.status]}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(invoice)}
                        aria-label="View invoice"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#08A8E0] hover:text-[#08A8E0]"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => printInvoice(invoice)}
                        aria-label="Print invoice"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#08A8E0] hover:text-[#08A8E0]"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <FileText
                      size={25}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="font-semibold text-[#142033]">
                      No invoices found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filtered.length} of {invoices.length} invoices
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold text-[#142033]">Invoice details</h2>
                <p className="text-sm text-slate-500">{selected.invoiceNo}</p>
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
                  {selected.customerName}
                </p>
                <p className="text-sm text-slate-500">
                  {selected.customerPhone}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">ORDER ID</p>
                  <p className="mt-1 text-sm font-semibold">
                    {selected.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">INVOICE DATE</p>
                  <p className="mt-1 text-sm font-semibold">{selected.date}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Invoice total</p>
                <p className="mt-1 text-2xl font-bold text-[#142033]">
                  {money(selected.amount)}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[selected.status]}`}
                >
                  {selected.status}
                </span>
              </div>
              <button
                onClick={() => printInvoice(selected)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#08A8E0] px-4 py-3 text-sm font-semibold text-white hover:bg-[#078FC1]"
              >
                <Printer size={17} /> Print invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
