"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  X,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Wallet,
} from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: "Active" | "Inactive";
  joined: string;
}

const initialCustomers: Customer[] = [
  {
    id: 1001,
    name: "Arun Kumar",
    phone: "9876543210",
    email: "arun@gmail.com",
    address: "Chennai, Tamil Nadu",
    totalOrders: 24,
    totalSpent: 12500,
    status: "Active",
    joined: "12 Oct 2026",
  },
  {
    id: 1002,
    name: "Priya Sharma",
    phone: "9876512345",
    email: "priya@gmail.com",
    address: "Anna Nagar, Chennai",
    totalOrders: 18,
    totalSpent: 8900,
    status: "Active",
    joined: "18 Oct 2026",
  },
  {
    id: 1003,
    name: "Rahul Kumar",
    phone: "9876567890",
    email: "rahul@gmail.com",
    address: "Velachery, Chennai",
    totalOrders: 5,
    totalSpent: 3200,
    status: "Inactive",
    joined: "22 Oct 2026",
  },
  {
    id: 1004,
    name: "Karthik Raj",
    phone: "9876509876",
    email: "karthik@gmail.com",
    address: "Tambaram, Chennai",
    totalOrders: 32,
    totalSpent: 18400,
    status: "Active",
    joined: "25 Oct 2026",
  },
  {
    id: 1005,
    name: "Divya Priya",
    phone: "9876540987",
    email: "divya@gmail.com",
    address: "Adyar, Chennai",
    totalOrders: 12,
    totalSpent: 6500,
    status: "Active",
    joined: "28 Oct 2026",
  },
  {
    id: 1006,
    name: "Sanjay Kumar",
    phone: "9876545678",
    email: "sanjay@gmail.com",
    address: "Porur, Chennai",
    totalOrders: 2,
    totalSpent: 1200,
    status: "Inactive",
    joined: "02 Nov 2026",
  },
  {
    id: 1007,
    name: "Meena Devi",
    phone: "9876534567",
    email: "meena@gmail.com",
    address: "T Nagar, Chennai",
    totalOrders: 16,
    totalSpent: 7800,
    status: "Active",
    joined: "05 Nov 2026",
  },
  {
    id: 1008,
    name: "Vijay Kumar",
    phone: "9876523456",
    email: "vijay@gmail.com",
    address: "Mylapore, Chennai",
    totalOrders: 9,
    totalSpent: 4500,
    status: "Active",
    joined: "10 Nov 2026",
  },
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  status: "Active" as "Active" | "Inactive",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);

  const pageSize = 6;

  // LOAD LOCAL STORAGE
  useEffect(() => {
    try {
      const saved = localStorage.getItem("brandbox_customers");

      if (saved) {
        setCustomers(JSON.parse(saved));
      }
    } catch {
      console.error("Unable to load customers");
    }

    setLoaded(true);
  }, []);

  // SAVE LOCAL STORAGE
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("brandbox_customers", JSON.stringify(customers));
    }
  }, [customers, loaded]);

  // FILTER CUSTOMERS
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchMatch =
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search) ||
        customer.email.toLowerCase().includes(search.toLowerCase());

      const statusMatch = filter === "All" || customer.status === filter;

      return searchMatch && statusMatch;
    });
  }, [customers, search, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize),
  );

  const currentCustomers = filteredCustomers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const activeCount = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.totalOrders,
    0,
  );

  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0,
  );

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (customer: Customer) => {
    setEditingId(customer.id);

    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      status: customer.status,
    });

    setError("");
    setModalOpen(true);
    setMenuId(null);
  };

  // SAVE CUSTOMER
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    const duplicate = customers.some(
      (customer) => customer.phone === form.phone && customer.id !== editingId,
    );

    if (duplicate) {
      setError("This mobile number already exists.");
      return;
    }

    if (editingId !== null) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingId ? { ...customer, ...form } : customer,
        ),
      );
    } else {
      const newCustomer: Customer = {
        id: Date.now(),
        ...form,
        totalOrders: 0,
        totalSpent: 0,
        joined: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      setCustomers((previous) => [newCustomer, ...previous]);
      setPage(1);
    }

    setModalOpen(false);
    setForm(emptyForm);
    setError("");
  };

  // DELETE CUSTOMER
  const deleteCustomer = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?",
    );

    if (!confirmed) return;

    setCustomers((previous) =>
      previous.filter((customer) => customer.id !== id),
    );

    setMenuId(null);
    setViewCustomer(null);
  };

  // EXPORT CSV
  const exportCSV = () => {
    const headers = [
      "Customer ID",
      "Name",
      "Phone",
      "Email",
      "Address",
      "Orders",
      "Total Spent",
      "Status",
    ];

    const rows = filteredCustomers.map((customer) => [
      customer.id,
      customer.name,
      customer.phone,
      customer.email,
      customer.address,
      customer.totalOrders,
      customer.totalSpent,
      customer.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "brand-box-customers.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-7">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            WORKSPACE / CUSTOMERS
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your customers and their laundry activity.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078FC1]"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Customers",
            value: customers.length,
            icon: Users,
            color: "bg-[#EAF8FE] text-[#08A8E0]",
          },
          {
            title: "Active Customers",
            value: activeCount,
            icon: UserCheck,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "Total Orders",
            value: totalOrders,
            icon: ShoppingBag,
            color: "bg-purple-50 text-purple-600",
          },
          {
            title: "Customer Revenue",
            value: formatCurrency(totalSpent),
            icon: Wallet,
            color: "bg-orange-50 text-orange-600",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
              >
                <Icon size={21} />
              </div>

              <p className="text-sm font-medium text-slate-500">{item.title}</p>

              <h2 className="mt-1 text-2xl font-bold text-[#142033]">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* CUSTOMER TABLE */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* TABLE HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-bold text-[#142033]">Customer Directory</h2>

            <p className="mt-1 text-xs text-slate-400">
              View and manage all your customers
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-[#08A8E0] hover:text-[#08A8E0]"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col gap-3 border-y border-slate-100 bg-slate-50/50 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone or email..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#08A8E0] focus:ring-2 focus:ring-cyan-500/10"
            />
          </div>

          <div className="relative sm:w-44">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
            >
              <option value="All">All Customers</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-scroll">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-white">
              <tr className="border-b border-slate-100 transition hover:bg-[#F7FBFD] last:border-0">
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Total Orders</th>
                <th className="px-5 py-4">Total Spent</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0"
                >
                  {/* CUSTOMER NAME */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF8FE] text-sm font-bold text-[#08A8E0]">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#142033]">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID: #{customer.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CONTACT */}
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={13} className="text-slate-400" />
                      {customer.phone}
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <Mail size={12} />
                      {customer.email || "Not provided"}
                    </p>
                  </td>

                  {/* ORDERS */}
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                      {customer.totalOrders}
                    </span>
                  </td>

                  {/* SPENT */}
                  <td className="px-5 py-4 text-sm font-semibold text-[#142033]">
                    {formatCurrency(customer.totalSpent)}
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        customer.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {customer.status}
                    </span>
                  </td>

                  {/* JOINED */}
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {customer.joined}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-5 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setMenuId(menuId === customer.id ? null : customer.id)
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Customer actions"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {menuId === customer.id && (
                        <div className="dropdown-menu rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                          <button
                            onClick={() => {
                              setViewCustomer(customer);
                              setMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            <Eye size={15} />
                            View Details
                          </button>

                          <button
                            onClick={() => openEditModal(customer)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil size={15} />
                            Edit Customer
                          </button>

                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EMPTY STATE */}
          {currentCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-4">
                <Users size={28} className="text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-700">
                No customers found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-500">
            Showing{" "}
            {filteredCustomers.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filteredCustomers.length)} of{" "}
            {filteredCustomers.length} customers
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="rounded-lg bg-[#08A8E0] px-3 py-2 text-xs font-semibold text-white">
              {page}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ADD / EDIT CUSTOMER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-[#142033]">
                  {editingId ? "Edit Customer" : "Add New Customer"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Enter customer information below.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Customer Name *
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#08A8E0] focus:ring-2 focus:ring-cyan-500/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Mobile Number *
                  </label>

                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="10-digit mobile"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="example@gmail.com"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Enter customer address"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#08A8E0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Customer Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "Active" | "Inactive",
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#08A8E0]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#078FC1]"
                >
                  <Plus size={17} />
                  {editingId ? "Save Changes" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAILS MODAL */}
      {viewCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF8FE] text-xl font-bold text-[#08A8E0]">
                  {viewCustomer.name.charAt(0)}
                </div>

                <div>
                  <h2 className="font-bold text-[#142033]">
                    {viewCustomer.name}
                  </h2>

                  <p className="text-xs text-slate-400">
                    Customer #{viewCustomer.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewCustomer(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={17} className="text-[#08A8E0]" />
                {viewCustomer.phone}
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={17} className="text-[#08A8E0]" />
                {viewCustomer.email || "Not provided"}
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin size={17} className="text-[#08A8E0]" />
                {viewCustomer.address || "Not provided"}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="rounded-xl bg-[#EAF8FE] p-4">
                  <ShoppingBag size={19} className="text-[#08A8E0]" />
                  <p className="mt-3 text-xl font-bold text-[#142033]">
                    {viewCustomer.totalOrders}
                  </p>
                  <p className="text-xs text-slate-500">Total Orders</p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <Wallet size={19} className="text-emerald-600" />
                  <p className="mt-3 text-xl font-bold text-[#142033]">
                    {formatCurrency(viewCustomer.totalSpent)}
                  </p>
                  <p className="text-xs text-slate-500">Total Spent</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-500">Customer Status</span>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  {viewCustomer.status}
                </span>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    openEditModal(viewCustomer);
                    setViewCustomer(null);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#08A8E0] py-3 text-sm font-semibold text-white hover:bg-[#078FC1]"
                >
                  <Pencil size={16} />
                  Edit Customer
                </button>

                <button
                  onClick={() => deleteCustomer(viewCustomer.id)}
                  className="rounded-xl border border-red-100 px-4 py-3 text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
