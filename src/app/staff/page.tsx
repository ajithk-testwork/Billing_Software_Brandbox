"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Phone,
  Mail,
  Briefcase,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type StaffStatus = "Active" | "Inactive";
type StaffRole =
  | "Manager"
  | "Laundry Operator"
  | "Cashier"
  | "Delivery Staff"
  | "Receptionist";

interface StaffMember {
  id: string;
  name: string;
  employeeId: string;
  role: StaffRole;
  branch: string;
  phone: string;
  email: string;
  joiningDate: string;
  status: StaffStatus;
}

const STORAGE_KEY = "brandbox_staff";

const initialStaff: StaffMember[] = [
  {
    id: "staff-001",
    name: "Arun Kumar",
    employeeId: "BB-EMP-001",
    role: "Manager",
    branch: "Main Branch",
    phone: "9876543210",
    email: "arun@thebrandbox.in",
    joiningDate: "2025-04-12",
    status: "Active",
  },
  {
    id: "staff-002",
    name: "Priya S",
    employeeId: "BB-EMP-002",
    role: "Cashier",
    branch: "T. Nagar Branch",
    phone: "9876501234",
    email: "priya@thebrandbox.in",
    joiningDate: "2025-07-20",
    status: "Active",
  },
  {
    id: "staff-003",
    name: "Rahul M",
    employeeId: "BB-EMP-003",
    role: "Laundry Operator",
    branch: "Main Branch",
    phone: "9840012345",
    email: "rahul@thebrandbox.in",
    joiningDate: "2025-09-05",
    status: "Active",
  },
  {
    id: "staff-004",
    name: "Meena Devi",
    employeeId: "BB-EMP-004",
    role: "Receptionist",
    branch: "Velachery Branch",
    phone: "9003012345",
    email: "meena@thebrandbox.in",
    joiningDate: "2025-11-01",
    status: "Inactive",
  },
];

const roles: StaffRole[] = [
  "Manager",
  "Laundry Operator",
  "Cashier",
  "Delivery Staff",
  "Receptionist",
];
const blankForm = {
  name: "",
  employeeId: "",
  role: "Laundry Operator" as StaffRole,
  branch: "",
  phone: "",
  email: "",
  joiningDate: "",
  status: "Active" as StaffStatus,
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<
    { id: string; name: string; status?: string }[]
  >([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedStaff = localStorage.getItem(STORAGE_KEY);
      setStaff(savedStaff ? JSON.parse(savedStaff) : initialStaff);
      const savedBranches = localStorage.getItem("brandbox_branches");
      if (savedBranches) {
        const parsed = JSON.parse(savedBranches);
        if (Array.isArray(parsed))
          setBranches(parsed.filter((item) => item?.status !== "Inactive"));
      }
    } catch {
      setStaff(initialStaff);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
  }, [staff, loaded]);

  const activeCount = staff.filter((item) => item.status === "Active").length;
  const filteredStaff = useMemo(() => {
    const term = search.trim().toLowerCase();
    return staff.filter((item) => {
      const matchesSearch = [
        item.name,
        item.employeeId,
        item.role,
        item.branch,
        item.phone,
        item.email,
      ].some((value) => String(value).toLowerCase().includes(term));
      return (
        matchesSearch &&
        (roleFilter === "All" || item.role === roleFilter) &&
        (statusFilter === "All" || item.status === statusFilter) &&
        (branchFilter === "All" || item.branch === branchFilter)
      );
    });
  }, [staff, search, roleFilter, statusFilter, branchFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...blankForm,
      employeeId: `BB-EMP-${String(staff.length + 1).padStart(3, "0")}`,
    });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      employeeId: member.employeeId,
      role: member.role,
      branch: member.branch,
      phone: member.phone,
      email: member.email,
      joiningDate: member.joiningDate,
      status: member.status,
    });
    setError("");
    setModalOpen(true);
  };

  const saveStaff = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const employeeId = form.employeeId.trim().toUpperCase();
    if (!name || !employeeId || !form.branch.trim()) {
      setError("Name, employee ID and branch are required.");
      return;
    }
    if (
      staff.some(
        (item) =>
          item.employeeId.toLowerCase() === employeeId.toLowerCase() &&
          item.id !== editingId,
      )
    ) {
      setError("This employee ID already exists.");
      return;
    }
    if (form.phone.trim() && !/^[+0-9\s-]{7,16}$/.test(form.phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }
    const next: StaffMember = {
      id: editingId ?? `staff-${Date.now()}`,
      name,
      employeeId,
      role: form.role,
      branch: form.branch.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      joiningDate: form.joiningDate,
      status: form.status,
    };
    setStaff((previous) =>
      editingId
        ? previous.map((item) => (item.id === editingId ? next : item))
        : [next, ...previous],
    );
    setModalOpen(false);
  };

  const deleteStaff = (id: string) => {
    const member = staff.find((item) => item.id === id);
    if (!member || !window.confirm(`Delete ${member.name} from staff?`)) return;
    setStaff((previous) => previous.filter((item) => item.id !== id));
  };

  const toggleStatus = (id: string) => {
    setStaff((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active",
            }
          : item,
      ),
    );
  };

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            MANAGEMENT / TEAM
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
            Staff
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage employees, roles and branch assignments.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078FC1]"
        >
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Staff",
            value: staff.length,
            icon: Users,
            tone: "bg-[#EAF8FE] text-[#08A8E0]",
          },
          {
            label: "Active Staff",
            value: activeCount,
            icon: UserCheck,
            tone: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Inactive Staff",
            value: staff.length - activeCount,
            icon: UserX,
            tone: "bg-amber-50 text-amber-600",
          },
          {
            label: "Roles",
            value: new Set(staff.map((item) => item.role)).size,
            icon: ShieldCheck,
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
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, phone..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#08A8E0] focus:bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
            >
              <option value="All">All roles</option>
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
            <select
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
            >
              <option value="All">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]"
            >
              <option value="All">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Employee</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Branch</th>
                <th className="px-5 py-4 font-semibold">Contact</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF8FE] text-sm font-bold text-[#08A8E0]">
                        {initials(member.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#142033]">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {member.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Briefcase size={14} className="text-slate-400" />
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {member.branch}
                  </td>
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone size={13} className="text-slate-400" />
                      {member.phone || "—"}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <Mail size={13} />
                      {member.email || "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {member.joiningDate || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleStatus(member.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${member.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {member.status === "Active" ? (
                        <ToggleRight size={15} />
                      ) : (
                        <ToggleLeft size={15} />
                      )}
                      {member.status}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(member)}
                        aria-label={`Edit ${member.name}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#08A8E0] hover:text-[#08A8E0]"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteStaff(member.id)}
                        aria-label={`Delete ${member.name}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <Users size={25} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-[#142033]">
                      No staff found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing filters or add a staff member.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredStaff.length} of {staff.length} staff members
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4">
          <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold text-[#142033]">
                  {editingId ? "Edit Staff Member" : "Add Staff Member"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter employee details and assign a branch.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>
            <form onSubmit={saveStaff} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Full name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Employee name"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Employee ID *
                  </label>
                  <input
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm({ ...form, employeeId: e.target.value })
                    }
                    placeholder="BB-EMP-001"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm uppercase outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as StaffRole })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                  >
                    {roles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Branch *
                  </label>
                  {branches.length ? (
                    <select
                      value={form.branch}
                      onChange={(e) =>
                        setForm({ ...form, branch: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                    >
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.name}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={form.branch}
                      onChange={(e) =>
                        setForm({ ...form, branch: e.target.value })
                      }
                      placeholder="Enter branch name"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  )}
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
                    placeholder="employee@example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Joining date
                  </label>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      setForm({ ...form, joiningDate: e.target.value })
                    }
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
                        status: e.target.value as StaffStatus,
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
                  {editingId ? "Save Changes" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
