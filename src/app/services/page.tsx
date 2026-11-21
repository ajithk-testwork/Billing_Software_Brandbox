
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Sparkles,
  Tags,
  CheckCircle2,
  Power,
  MoreHorizontal,
  Shirt,
  IndianRupee,
  ChevronDown,
} from "lucide-react";

import {
  LaundryService,
  GarmentPrice,
  initialServices,
  initialPrices,
  SERVICES_KEY,
  PRICES_KEY,
} from "@/lib/service-data";

type Tab = "services" | "pricing";

const emptyService = {
  name: "",
  description: "",
  features: "",
  category: "Regular" as "Regular" | "Exclusive",
  active: true,
};

const emptyPrice = {
  garment: "",
  category: "Standard" as "Standard" | "Premium",
  minPrice: 0,
  maxPrice: 0,
  active: true,
};

export default function ServicesPage() {
  const [tab, setTab] = useState<Tab>("services");

  const [services, setServices] = useState<LaundryService[]>([]);
  const [prices, setPrices] = useState<GarmentPrice[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [serviceForm, setServiceForm] = useState(emptyService);
  const [priceForm, setPriceForm] = useState(emptyPrice);

  const [loaded, setLoaded] = useState(false);

  // INITIALIZE CATALOGUE
  useEffect(() => {
    try {
      const savedServices = localStorage.getItem(SERVICES_KEY);
      const savedPrices = localStorage.getItem(PRICES_KEY);

      if (savedServices) {
        setServices(JSON.parse(savedServices));
      } else {
        setServices(initialServices);
        localStorage.setItem(
          SERVICES_KEY,
          JSON.stringify(initialServices)
        );
      }

      if (savedPrices) {
        setPrices(JSON.parse(savedPrices));
      } else {
        setPrices(initialPrices);
        localStorage.setItem(
          PRICES_KEY,
          JSON.stringify(initialPrices)
        );
      }
    } catch {
      setServices(initialServices);
      setPrices(initialPrices);
    }

    setLoaded(true);
  }, []);

  // PERSIST SERVICES
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    }
  }, [services, loaded]);

  // PERSIST PRICES
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
    }
  }, [prices, loaded]);

  const activeServices = services.filter((s) => s.active).length;
  const activePrices = prices.filter((p) => p.active).length;

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && service.active) ||
        (statusFilter === "Inactive" && !service.active);

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const filteredPrices = useMemo(() => {
    return prices.filter((price) => {
      const matchesSearch = price.garment
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && price.active) ||
        (statusFilter === "Inactive" && !price.active);

      return matchesSearch && matchesStatus;
    });
  }, [prices, search, statusFilter]);

  // OPEN ADD SERVICE
  const openAddService = () => {
    setEditingId(null);
    setServiceForm(emptyService);
    setError("");
    setModalOpen(true);
  };

  // OPEN EDIT SERVICE
  const openEditService = (service: LaundryService) => {
    setEditingId(service.id);

    setServiceForm({
      name: service.name,
      description: service.description,
      features: service.features.join("\n"),
      category: service.category,
      active: service.active,
    });

    setError("");
    setModalOpen(true);
  };

  // OPEN ADD PRICE
  const openAddPrice = () => {
    setEditingId(null);
    setPriceForm(emptyPrice);
    setError("");
    setModalOpen(true);
  };

  // OPEN EDIT PRICE
  const openEditPrice = (price: GarmentPrice) => {
    setEditingId(price.id);

    setPriceForm({
      garment: price.garment,
      category: price.category,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      active: price.active,
    });

    setError("");
    setModalOpen(true);
  };

  // SAVE SERVICE
  const saveService = (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceForm.name.trim()) {
      setError("Enter a service name.");
      return;
    }

    const duplicate = services.some(
      (service) =>
        service.name.toLowerCase() ===
          serviceForm.name.trim().toLowerCase() &&
        service.id !== editingId
    );

    if (duplicate) {
      setError("This service already exists.");
      return;
    }

    const data: LaundryService = {
      id: editingId || `service-${Date.now()}`,
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim(),
      features: serviceForm.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
      category: serviceForm.category,
      active: serviceForm.active,
    };

    if (editingId) {
      setServices((previous) =>
        previous.map((service) =>
          service.id === editingId ? data : service
        )
      );
    } else {
      setServices((previous) => [data, ...previous]);
    }

    setModalOpen(false);
  };

  // SAVE PRICE
  const savePrice = (e: React.FormEvent) => {
    e.preventDefault();

    if (!priceForm.garment.trim()) {
      setError("Enter garment name.");
      return;
    }

    if (
      priceForm.minPrice < 0 ||
      priceForm.maxPrice < priceForm.minPrice
    ) {
      setError("Check minimum and maximum price.");
      return;
    }

    const duplicate = prices.some(
      (price) =>
        price.garment.toLowerCase() ===
          priceForm.garment.trim().toLowerCase() &&
        price.id !== editingId
    );

    if (duplicate) {
      setError("This garment already exists.");
      return;
    }

    const data: GarmentPrice = {
      id: editingId || `price-${Date.now()}`,
      garment: priceForm.garment.trim(),
      category: priceForm.category,
      minPrice: Number(priceForm.minPrice),
      maxPrice: Number(priceForm.maxPrice),
      active: priceForm.active,
    };

    if (editingId) {
      setPrices((previous) =>
        previous.map((price) =>
          price.id === editingId ? data : price
        )
      );
    } else {
      setPrices((previous) => [data, ...previous]);
    }

    setModalOpen(false);
  };

  // TOGGLE SERVICE
  const toggleService = (id: string) => {
    setServices((previous) =>
      previous.map((service) =>
        service.id === id
          ? { ...service, active: !service.active }
          : service
      )
    );
  };

  // TOGGLE PRICE
  const togglePrice = (id: string) => {
    setPrices((previous) =>
      previous.map((price) =>
        price.id === id
          ? { ...price, active: !price.active }
          : price
      )
    );
  };

  // DELETE SERVICE
  const deleteService = (id: string) => {
    if (!window.confirm("Delete this service?")) return;

    setServices((previous) =>
      previous.filter((service) => service.id !== id)
    );
  };

  // DELETE PRICE
  const deletePrice = (id: string) => {
    if (!window.confirm("Delete this garment price?")) return;

    setPrices((previous) =>
      previous.filter((price) => price.id !== id)
    );
  };

  const currency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-w-0 space-y-7">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            MANAGEMENT / CATALOGUE
          </p>

          <h1 className="text-2xl font-bold text-[#142033] md:text-3xl">
            Services & Pricing
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage laundry services and garment prices.
          </p>
        </div>

        <button
          onClick={
            tab === "services" ? openAddService : openAddPrice
          }
          className="flex items-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#078FC1]"
        >
          <Plus size={18} />
          {tab === "services" ? "Add Service" : "Add Pricing"}
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Services",
            value: services.length,
            icon: Sparkles,
            color: "bg-[#EAF8FE] text-[#08A8E0]",
          },
          {
            title: "Active Services",
            value: activeServices,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "Garment Prices",
            value: prices.length,
            icon: Tags,
            color: "bg-purple-50 text-purple-600",
          },
          {
            title: "Active Prices",
            value: activePrices,
            icon: IndianRupee,
            color: "bg-orange-50 text-orange-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon size={21} />
              </div>

              <p className="text-sm text-slate-500">{stat.title}</p>
              <h2 className="mt-1 text-2xl font-bold text-[#142033]">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* TAB SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTab("services");
              setSearch("");
              setStatusFilter("All");
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === "services"
                ? "bg-[#08A8E0] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Sparkles size={17} />
            Services
            <span className="text-xs opacity-80">({services.length})</span>
          </button>

          <button
            onClick={() => {
              setTab("pricing");
              setSearch("");
              setStatusFilter("All");
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === "pricing"
                ? "bg-[#08A8E0] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Tags size={17} />
            Pricing
            <span className="text-xs opacity-80">({prices.length})</span>
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === "services"
                ? "Search services..."
                : "Search garments..."
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#08A8E0]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none focus:border-[#08A8E0] sm:w-44"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* SERVICES TABLE */}
      {tab === "services" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-[#142033]">
              Service Catalogue
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Cleaning, pressing and exclusive garment care services
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Features</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF8FE] text-[#08A8E0]">
                          <Sparkles size={19} />
                        </div>

                        <div className="max-w-[280px]">
                          <p className="text-sm font-semibold text-[#142033]">
                            {service.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-600">
                        {service.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {service.features.length} features
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleService(service.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          service.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {service.active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditService(service)}
                          title="Edit service"
                          className="rounded-lg p-2 text-slate-400 hover:bg-[#EAF8FE] hover:text-[#08A8E0]"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => deleteService(service.id)}
                          title="Delete service"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredServices.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-400">
                No services found.
              </p>
            )}
          </div>
        </section>
      )}

      {/* PRICING TABLE */}
      {tab === "pricing" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-[#142033]">
              Garment Pricing Catalogue
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Set and update garment-wise prices
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Garment</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Minimum Price</th>
                  <th className="px-5 py-4">Maximum Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPrices.map((price) => (
                  <tr
                    key={price.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-[#EAF8FE] p-2.5 text-[#08A8E0]">
                          <Shirt size={19} />
                        </div>

                        <span className="text-sm font-semibold text-[#142033]">
                          {price.garment}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-600">
                        {price.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {currency(price.minPrice)}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {currency(price.maxPrice)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => togglePrice(price.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          price.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {price.active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditPrice(price)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-[#EAF8FE] hover:text-[#08A8E0]"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => deletePrice(price.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPrices.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-400">
                No pricing records found.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-[#142033]">
                  {tab === "services"
                    ? editingId
                      ? "Edit Service"
                      : "Add New Service"
                    : editingId
                      ? "Edit Garment Price"
                      : "Add Garment Price"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Update your laundry catalogue.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {tab === "services" ? (
              <form onSubmit={saveService} className="space-y-4 p-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Service Name *
                  </label>

                  <input
                    required
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Example: Dry Cleaning"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe this service..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Features (one per line)
                  </label>

                  <textarea
                    rows={4}
                    value={serviceForm.features}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        features: e.target.value,
                      })
                    }
                    placeholder={"Organic cleaning solvents\nFabric care\nPerfect finishing"}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Service Category
                    </label>

                    <select
                      value={serviceForm.category}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          category: e.target.value as "Regular" | "Exclusive",
                        })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Exclusive">Exclusive</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Status
                    </label>

                    <select
                      value={serviceForm.active ? "Active" : "Inactive"}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          active: e.target.value === "Active",
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
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm text-slate-600"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#08A8E0] px-6 py-3 text-sm font-semibold text-white hover:bg-[#078FC1]"
                  >
                    {editingId ? "Save Changes" : "Create Service"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={savePrice} className="space-y-4 p-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Garment Name *
                  </label>

                  <input
                    required
                    value={priceForm.garment}
                    onChange={(e) =>
                      setPriceForm({
                        ...priceForm,
                        garment: e.target.value,
                      })
                    }
                    placeholder="Example: Shirt"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#08A8E0]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Pricing Category
                  </label>

                  <select
                    value={priceForm.category}
                    onChange={(e) =>
                      setPriceForm({
                        ...priceForm,
                        category: e.target.value as "Standard" | "Premium",
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Minimum Price (₹)
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      value={priceForm.minPrice}
                      onChange={(e) =>
                        setPriceForm({
                          ...priceForm,
                          minPrice: Number(e.target.value),
                        })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Maximum Price (₹)
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      value={priceForm.maxPrice}
                      onChange={(e) =>
                        setPriceForm({
                          ...priceForm,
                          maxPrice: Number(e.target.value),
                        })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-600">
                    Status
                  </label>

                  <select
                    value={priceForm.active ? "Active" : "Inactive"}
                    onChange={(e) =>
                      setPriceForm({
                        ...priceForm,
                        active: e.target.value === "Active",
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm text-slate-600"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#08A8E0] px-6 py-3 text-sm font-semibold text-white hover:bg-[#078FC1]"
                  >
                    {editingId ? "Save Changes" : "Create Pricing"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
