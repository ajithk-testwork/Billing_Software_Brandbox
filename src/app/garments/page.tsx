"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Shirt, Plus, Search, Pencil, Trash2, X, CheckCircle2,
  Package, IndianRupee, Layers3, ToggleLeft, ToggleRight,
} from "lucide-react";

type GarmentCategory = "Standard" | "Premium";

interface GarmentPrice {
  id: string;
  garment: string;
  category: GarmentCategory;
  minPrice: number;
  maxPrice: number;
  active: boolean;
}

const STORAGE_KEY = "brandbox_pricing";

const defaultGarments: GarmentPrice[] = [
  { id: "g-shirt", garment: "Shirt", category: "Standard", minPrice: 150, maxPrice: 150, active: true },
  { id: "g-pants", garment: "Pants", category: "Standard", minPrice: 150, maxPrice: 150, active: true },
  { id: "g-blazer", garment: "Blazer", category: "Premium", minPrice: 600, maxPrice: 600, active: true },
  { id: "g-silk-saree", garment: "Silk Saree", category: "Premium", minPrice: 400, maxPrice: 400, active: true },
  { id: "g-jacket", garment: "Jacket", category: "Premium", minPrice: 400, maxPrice: 400, active: true },
  { id: "g-curtains", garment: "Curtains", category: "Premium", minPrice: 400, maxPrice: 1500, active: true },
];

const emptyForm = {
  garment: "",
  category: "Standard" as GarmentCategory,
  minPrice: "0",
  maxPrice: "0",
  active: true,
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function GarmentsPage() {
  const [garments, setGarments] = useState<GarmentPrice[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GarmentPrice[];
        setGarments(Array.isArray(parsed) ? parsed : defaultGarments);
      } else {
        setGarments(defaultGarments);
      }
    } catch {
      setGarments(defaultGarments);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(garments));
  }, [garments, loaded]);

  const activeCount = garments.filter((item) => item.active).length;
  const standardCount = garments.filter((item) => item.category === "Standard").length;
  const premiumCount = garments.filter((item) => item.category === "Premium").length;

  const filteredGarments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return garments.filter((item) => {
      const matchesSearch = item.garment.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || (statusFilter === "Active" ? item.active : !item.active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [garments, search, categoryFilter, statusFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item: GarmentPrice) => {
    setEditingId(item.id);
    setForm({
      garment: item.garment,
      category: item.category,
      minPrice: String(item.minPrice),
      maxPrice: String(item.maxPrice),
      active: item.active,
    });
    setError("");
    setModalOpen(true);
  };

  const saveGarment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.garment.trim();
    const min = Number(form.minPrice);
    const max = Number(form.maxPrice);

    if (!name) return setError("Enter a garment name.");
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) {
      return setError("Enter valid prices. Maximum price must be equal to or higher than minimum price.");
    }
    if (garments.some((item) => item.garment.toLowerCase() === name.toLowerCase() && item.id !== editingId)) {
      return setError("This garment already exists.");
    }

    const next: GarmentPrice = {
      id: editingId ?? `garment-${Date.now()}`,
      garment: name,
      category: form.category,
      minPrice: min,
      maxPrice: max,
      active: form.active,
    };

    setGarments((previous) =>
      editingId
        ? previous.map((item) => (item.id === editingId ? next : item))
        : [next, ...previous],
    );
    setModalOpen(false);
  };

  const deleteGarment = (id: string) => {
    const item = garments.find((garment) => garment.id === id);
    if (!item || !window.confirm(`Delete ${item.garment}?`)) return;
    setGarments((previous) => previous.filter((garment) => garment.id !== id));
  };

  const toggleActive = (id: string) => {
    setGarments((previous) =>
      previous.map((item) => item.id === id ? { ...item, active: !item.active } : item),
    );
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">WORKSPACE / CATALOGUE</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">Garments</h1>
          <p className="mt-1 text-sm text-slate-500">Manage garment types and their laundry price range.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078FC1]">
          <Plus size={18} /> Add Garment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Garments", value: garments.length, icon: Shirt, tone: "bg-[#EAF8FE] text-[#08A8E0]" },
          { label: "Active", value: activeCount, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
          { label: "Standard", value: standardCount, icon: Layers3, tone: "bg-blue-50 text-blue-600" },
          { label: "Premium", value: premiumCount, icon: Package, tone: "bg-violet-50 text-violet-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}><Icon size={20} /></div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-[#142033]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search garments..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#08A8E0] focus:bg-white" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]">
              <option value="All">All categories</option><option value="Standard">Standard</option><option value="Premium">Premium</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#08A8E0]">
              <option value="All">All status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Garment</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Price range</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGarments.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF8FE] text-[#08A8E0]"><Shirt size={19} /></div>
                      <div><p className="font-semibold text-[#142033]">{item.garment}</p><p className="text-xs text-slate-400">Garment item</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.category === "Premium" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}>{item.category}</span></td>
                  <td className="px-5 py-4"><p className="font-semibold text-[#142033]">{item.minPrice === item.maxPrice ? money(item.minPrice) : `${money(item.minPrice)} – ${money(item.maxPrice)}`}</p><p className="text-xs text-slate-400">Per item</p></td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleActive(item.id)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}{item.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(item)} aria-label={`Edit ${item.garment}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#08A8E0] hover:text-[#08A8E0]"><Pencil size={16} /></button>
                      <button onClick={() => deleteGarment(item.id)} aria-label={`Delete ${item.garment}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGarments.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-14 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Shirt size={22} /></div><p className="font-semibold text-[#142033]">No garments found</p><p className="mt-1 text-sm text-slate-500">Try another search or add a garment.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          <span>Showing {filteredGarments.length} of {garments.length} garments</span>
          <span>{activeCount} active items available for new orders</span>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4">
          <div className="my-8 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div><h2 className="text-lg font-bold text-[#142033]">{editingId ? "Edit Garment" : "Add Garment"}</h2><p className="mt-1 text-sm text-slate-500">Set garment details and pricing.</p></div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={saveGarment} className="space-y-5 p-6">
              <div><label className="mb-2 block text-sm font-semibold text-slate-700">Garment name</label><input autoFocus value={form.garment} onChange={(e) => setForm({ ...form, garment: e.target.value })} placeholder="e.g. T-Shirt" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]" /></div>
              <div><label className="mb-2 block text-sm font-semibold text-slate-700">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GarmentCategory })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"><option value="Standard">Standard</option><option value="Premium">Premium</option></select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-2 block text-sm font-semibold text-slate-700">Minimum price (₹)</label><input type="number" min="0" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]" /></div>
                <div><label className="mb-2 block text-sm font-semibold text-slate-700">Maximum price (₹)</label><input type="number" min="0" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]" /></div>
              </div>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4"><div><p className="text-sm font-semibold text-slate-700">Active garment</p><p className="mt-0.5 text-xs text-slate-500">Available in new order forms</p></div><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-[#08A8E0]" /></label>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-xl bg-[#08A8E0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#078FC1]">{editingId ? "Save Changes" : "Add Garment"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
