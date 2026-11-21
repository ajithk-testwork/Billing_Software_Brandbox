"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  MapPin,
  Building2,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  MapPinned,
} from "lucide-react";

type BranchStatus = "Active" | "Inactive";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager: string;
  status: BranchStatus;
}

const STORAGE_KEY = "brandbox_branches";

const initialBranches: Branch[] = [
  {
    id: "branch-001",
    name: "Main Branch",
    code: "BB-CHN-001",
    address: "No. 24, Anna Salai",
    city: "Chennai",
    phone: "9876543210",
    email: "main@thebrandbox.in",
    manager: "Arun Kumar",
    status: "Active",
  },
  {
    id: "branch-002",
    name: "T. Nagar Branch",
    code: "BB-CHN-002",
    address: "No. 18, Usman Road",
    city: "Chennai",
    phone: "9876501234",
    email: "tnagar@thebrandbox.in",
    manager: "Priya S",
    status: "Active",
  },
  {
    id: "branch-003",
    name: "Velachery Branch",
    code: "BB-CHN-003",
    address: "100 Feet Bypass Road",
    city: "Chennai",
    phone: "9840012345",
    email: "velachery@thebrandbox.in",
    manager: "Rahul M",
    status: "Inactive",
  },
];

const blankForm = {
  name: "",
  code: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  manager: "",
  status: "Active" as BranchStatus,
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setBranches(Array.isArray(parsed) ? parsed : initialBranches);
      } else setBranches(initialBranches);
    } catch {
      setBranches(initialBranches);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
  }, [branches, loaded]);

  const activeCount = branches.filter(
    (branch) => branch.status === "Active",
  ).length;

  const filteredBranches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return branches.filter((branch) => {
      const matchesSearch = [
        branch.name,
        branch.code,
        branch.address,
        branch.city,
        branch.phone,
        branch.manager,
      ].some((value) => value.toLowerCase().includes(term));
      const matchesStatus =
        statusFilter === "All" || branch.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(blankForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      status: branch.status,
    });
    setError("");
    setModalOpen(true);
  };

  const saveBranch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    if (!name || !code || !form.city.trim()) {
      setError("Branch name, branch code and city are required.");
      return;
    }
    if (
      branches.some(
        (branch) =>
          branch.code.toLowerCase() === code.toLowerCase() &&
          branch.id !== editingId,
      )
    ) {
      setError("This branch code is already in use.");
      return;
    }
    if (form.phone.trim() && !/^[+0-9\s-]{7,16}$/.test(form.phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }

    const next: Branch = {
      id: editingId ?? `branch-${Date.now()}`,
      name,
      code,
      address: form.address.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      manager: form.manager.trim(),
      status: form.status,
    };
    setBranches((previous) =>
      editingId
        ? previous.map((branch) => (branch.id === editingId ? next : branch))
        : [next, ...previous],
    );
    setModalOpen(false);
  };

  const deleteBranch = (id: string) => {
    const branch = branches.find((item) => item.id === id);
    if (!branch || !window.confirm(`Delete ${branch.name}?`)) return;
    setBranches((previous) => previous.filter((item) => item.id !== id));
  };

  const toggleStatus = (id: string) => {
    setBranches((previous) =>
      previous.map((branch) =>
        branch.id === id
          ? {
              ...branch,
              status: branch.status === "Active" ? "Inactive" : "Active",
            }
          : branch,
      ),
    );
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            MANAGEMENT / LOCATIONS
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
            Branches
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your laundry outlets and branch contact details.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078FC1]"
        >
          <Plus size={18} /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Branches",
            value: branches.length,
            icon: Building2,
            tone: "bg-[#EAF8FE] text-[#08A8E0]",
          },
          {
            label: "Active Branches",
            value: activeCount,
            icon: CheckCircle2,
            tone: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Inactive Branches",
            value: branches.length - activeCount,
            icon: ToggleLeft,
            tone: "bg-amber-50 text-amber-600",
          },
          {
            label: "Cities Covered",
            value: new Set(
              branches
                .map((branch) => branch.city.trim().toLowerCase())
                .filter(Boolean),
            ).size,
            icon: MapPinned,
            tone: "bg-violet-50 text-violet-600",
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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search branch, code, city..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#08A8E0] focus:bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredBranches.map((branch) => (
            <article
              key={branch.id}
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF8FE] text-[#08A8E0]">
                    <Building2 size={21} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[#142033]">
                      {branch.name}
                    </h3>
                    <p className="text-xs text-slate-400">{branch.code}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${branch.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {branch.status}
                </span>
              </div>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  <span>
                    {branch.address ? `${branch.address}, ` : ""}
                    {branch.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0 text-slate-400" />
                  <span>{branch.phone || "Phone not added"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="shrink-0 text-slate-400" />
                  <span className="truncate">
                    {branch.email || "Email not added"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="shrink-0 text-slate-400" />
                  <span>Manager: {branch.manager || "Not assigned"}</span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  onClick={() => toggleStatus(branch.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#08A8E0]"
                >
                  {branch.status === "Active" ? (
                    <ToggleRight size={17} />
                  ) : (
                    <ToggleLeft size={17} />
                  )}
                  {branch.status === "Active" ? "Deactivate" : "Activate"}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(branch)}
                    aria-label={`Edit ${branch.name}`}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#08A8E0] hover:text-[#08A8E0]"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteBranch(branch.id)}
                    aria-label={`Delete ${branch.name}`}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {filteredBranches.length === 0 && (
            <div className="col-span-full py-14 text-center">
              <Building2 size={26} className="mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-[#142033]">No branches found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or add a branch.
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredBranches.length} of {branches.length} branches
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4">
          <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold text-[#142033]">
                  {editingId ? "Edit Branch" : "Add Branch"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the outlet and contact information.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>
            <form onSubmit={saveBranch} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Branch name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Main Branch"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Branch code *
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="BB-CHN-001"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm uppercase outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Address
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="Street, area, landmark"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    City *
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Chennai"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="branch@example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Branch manager
                  </label>
                  <input
                    value={form.manager}
                    onChange={(e) =>
                      setForm({ ...form, manager: e.target.value })
                    }
                    placeholder="Manager name"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as BranchStatus,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#08A8E0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#078FC1]"
                >
                  {editingId ? "Save Changes" : "Add Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
