"use client";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Shirt,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  User,
  Phone,
  IndianRupee,
  Package,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Receipt,
  QrCode,
  Printer,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";

import {
  loadServices,
  loadPrices,
  LaundryService,
  GarmentPrice,
} from "../../lib/service-data";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Ready"
  | "Delivered"
  | "Cancelled";

type PaymentStatus = "Paid" | "Unpaid" | "Partial";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface OrderItem {
  id: number;
  garment: string;
  service: string;
  quantity: number;
  price: number;
  photoUrl?: string;
  garmentId?: string;
}

interface Order {
  id: string;
  customerId: number;
  customerName: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  pickupDate: string;
  deliveryDate: string;
  createdAt: string;
  notes: string;
}

const demoOrders: Order[] = [
  {
    id: "ORD-1001",
    customerId: 1001,
    customerName: "Arun Kumar",
    phone: "9876543210",
    items: [
      {
        id: 1,
        garment: "Shirt",
        service: "Wash & Iron",
        quantity: 5,
        price: 80,
      },
      {
        id: 2,
        garment: "Trouser",
        service: "Dry Cleaning",
        quantity: 2,
        price: 150,
      },
    ],
    total: 700,
    status: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    pickupDate: "2026-11-14",
    deliveryDate: "2026-11-17",
    createdAt: "2026-11-14",
    notes: "",
  },
  {
    id: "ORD-1002",
    customerId: 1002,
    customerName: "Priya Sharma",
    phone: "9876512345",
    items: [
      {
        id: 3,
        garment: "Saree",
        service: "Dry Cleaning",
        quantity: 2,
        price: 350,
      },
    ],
    total: 700,
    status: "Ready",
    paymentStatus: "Unpaid",
    paymentMethod: "Cash",
    pickupDate: "2026-11-14",
    deliveryDate: "2026-11-16",
    createdAt: "2026-11-14",
    notes: "",
  },
  {
    id: "ORD-1003",
    customerId: 1003,
    customerName: "Rahul Kumar",
    phone: "9876567890",
    items: [
      {
        id: 4,
        garment: "T-Shirt",
        service: "Wash & Fold",
        quantity: 5,
        price: 50,
      },
    ],
    total: 250,
    status: "Pending",
    paymentStatus: "Unpaid",
    paymentMethod: "Cash",
    pickupDate: "2026-11-15",
    deliveryDate: "2026-11-18",
    createdAt: "2026-11-15",
    notes: "",
  },
  {
    id: "ORD-1004",
    customerId: 1004,
    customerName: "Karthik Raj",
    phone: "9876509876",
    items: [
      {
        id: 5,
        garment: "Blazer",
        service: "Dry Cleaning",
        quantity: 2,
        price: 450,
      },
    ],
    total: 900,
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    pickupDate: "2026-11-11",
    deliveryDate: "2026-11-14",
    createdAt: "2026-11-11",
    notes: "",
  },
  {
    id: "ORD-1005",
    customerId: 1005,
    customerName: "Divya Priya",
    phone: "9876540987",
    items: [
      {
        id: 6,
        garment: "Kurti",
        service: "Wash & Iron",
        quantity: 4,
        price: 100,
      },
    ],
    total: 400,
    status: "Processing",
    paymentStatus: "Partial",
    paymentMethod: "UPI",
    pickupDate: "2026-11-15",
    deliveryDate: "2026-11-18",
    createdAt: "2026-11-15",
    notes: "",
  },
];

const emptyItem: OrderItem = {
  id: 1,
  garment: "",
  service: "",
  quantity: 1,
  price: 0,
  photoUrl: "",
  garmentId: "",
};

const emptyForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  pickupDate: "",
  deliveryDate: "",
  paymentMethod: "Cash",
  paymentStatus: "Unpaid" as PaymentStatus,
  notes: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-orange-50 text-orange-700",
    Processing: "bg-blue-50 text-blue-700",
    Ready: "bg-purple-50 text-purple-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-600",
    Paid: "bg-emerald-50 text-emerald-700",
    Unpaid: "bg-red-50 text-red-600",
    Partial: "bg-orange-50 text-orange-700",
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [qrOrder, setQrOrder] = useState<Order | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [garmentQrData, setGarmentQrData] = useState<Record<number, string>>(
    {},
  );
  const [copied, setCopied] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [serviceOptions, setServiceOptions] = useState<LaundryService[]>([]);
  const [priceOptions, setPriceOptions] = useState<GarmentPrice[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<OrderItem[]>([{ ...emptyItem }]);
  const pageSize = 6;

  // Catalogue helpers. Only active catalogue entries are offered for new orders.
  const getGarmentPrice = (garmentName: string) => {
    const garment = priceOptions.find(
      (price) =>
        price.active &&
        price.garment.toLowerCase() === garmentName.toLowerCase(),
    );
    return garment?.minPrice ?? 0;
  };

  const createEmptyItem = (id = Date.now()): OrderItem => ({
    id,
    garment: priceOptions[0]?.garment ?? "",
    service: serviceOptions[0]?.name ?? "",
    quantity: 1,
    price: priceOptions[0]?.minPrice ?? 0,
  });

  // LOAD DATA
  useEffect(() => {
    try {
      setServiceOptions(loadServices().filter((service) => service.active));
      setPriceOptions(loadPrices().filter((price) => price.active));
      const savedOrders = localStorage.getItem("brandbox_orders");
      const savedCustomers = localStorage.getItem("brandbox_customers");
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      }
    } catch {
      console.error("Unable to load order data");
    }
    setLoaded(true);
  }, []);

  // SAVE ORDERS
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("brandbox_orders", JSON.stringify(orders));
    }
  }, [orders, loaded]);

  // Generate a shareable demo QR. The encoded order payload lets another
  // device open the static demo without a backend.
  useEffect(() => {
    let active = true;
    if (!qrOrder || typeof window === "undefined") {
      setQrDataUrl("");
      return;
    }
    const payload = encodeURIComponent(
      btoa(encodeURIComponent(JSON.stringify(qrOrder))),
    );
    const trackingUrl = `${window.location.origin}/track/${encodeURIComponent(qrOrder.id)}?demo=${payload}`;
    QRCode.toDataURL(trackingUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#142033", light: "#FFFFFF" },
    })
      .then((url: string) => {
        if (active) {
          setQrDataUrl(url);
        }
      })
      .catch((error: Error) => {
        console.error("QR generation failed:", error);

        if (active) {
          setQrDataUrl("");
        }
      });
    return () => {
      active = false;
    };
  }, [qrOrder]);

  // CALCULATE TOTAL
  useEffect(() => {
    let active = true;
    if (!qrOrder) {
      setGarmentQrData({});
      return;
    }
    Promise.all(
      qrOrder.items.map(async (item) => {
        const garmentId = item.garmentId || `${qrOrder.id}-G${item.id}`;
        const payload = `BRANDBOX-GARMENT:${qrOrder.id}:${garmentId}`;
        const dataUrl = await QRCode.toDataURL(payload, {
          width: 220,
          margin: 1,
          errorCorrectionLevel: "H",
          color: { dark: "#142033", light: "#FFFFFF" },
        });
        return [item.id, dataUrl] as const;
      }),
    )
      .then((entries) => {
        if (active) setGarmentQrData(Object.fromEntries(entries));
      })
      .catch(() => {
        if (active) setGarmentQrData({});
      });
    return () => {
      active = false;
    };
  }, [qrOrder]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const pendingCount = orders.filter(
    (order) => order.status === "Pending",
  ).length;
  const processingCount = orders.filter(
    (order) => order.status === "Processing",
  ).length;
  const deliveredCount = orders.filter(
    (order) => order.status === "Delivered",
  ).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.phone.includes(search);
      const matchesFilter = filter === "All" || order.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // OPEN NEW ORDER
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setItems([createEmptyItem()]);
    setError("");
    setModalOpen(true);
  };

  // EDIT ORDER
  const openEditModal = (order: Order) => {
    setEditingId(order.id);
    const savedCustomer = customers.find(
      (customer) => customer.id === order.customerId,
    );
    setForm({
      customerName: order.customerName,
      customerPhone: order.phone,
      customerEmail: savedCustomer?.email || "",
      customerAddress: savedCustomer?.address || "",
      pickupDate: order.pickupDate,
      deliveryDate: order.deliveryDate,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
    });
    setItems(order.items.map((item) => ({ ...item })));
    setError("");
    setMenuId(null);
    setModalOpen(true);
  };

  // UPDATE GARMENT
  const updateGarment = (id: number, garmentName: string) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              garment: garmentName,
              price: getGarmentPrice(garmentName),
            }
          : item,
      ),
    );
  };

  const handleGarmentPhoto = (id: number, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Please select an image smaller than 8 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1000;
        const scale = Math.min(
          1,
          maxSide / Math.max(image.width, image.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) {
          setError("Unable to process this image. Please try again.");
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const photoUrl = canvas.toDataURL("image/jpeg", 0.72);
        setItems((previous) =>
          previous.map((item) =>
            item.id === id ? { ...item, photoUrl } : item,
          ),
        );
        setError("");
      };
      image.onerror = () =>
        setError("Unable to load this image. Please try another photo.");
      image.src = String(reader.result || "");
    };
    reader.onerror = () =>
      setError("Unable to read this image. Please try again.");
    reader.readAsDataURL(file);
  };

  const updateItem = (
    id: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  // ADD GARMENT
  const addItem = () => {
    setItems((previous) => [...previous, createEmptyItem()]);
  };

  // REMOVE GARMENT
  const removeItem = (id: number) => {
    if (items.length === 1) {
      setError("An order must have at least one garment.");
      return;
    }
    setItems((previous) => previous.filter((item) => item.id !== id));
    setError("");
  };

  // SAVE ORDER
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const customerName = form.customerName.trim();
    const customerPhone = form.customerPhone.trim();

    if (!customerName || !customerPhone) {
      setError("Please enter the customer's name and phone number.");
      return;
    }
    if (!/^[0-9+()\s-]{7,18}$/.test(customerPhone)) {
      setError("Please enter a valid customer phone number.");
      return;
    }
    if (!form.pickupDate || !form.deliveryDate) {
      setError("Please select pickup and delivery dates.");
      return;
    }
    if (form.deliveryDate < form.pickupDate) {
      setError("Delivery date cannot be before pickup date.");
      return;
    }
    if (priceOptions.length === 0 || serviceOptions.length === 0) {
      setError(
        "Please add and activate at least one garment and one service before creating an order.",
      );
      return;
    }
    if (
      items.some(
        (item) =>
          !item.garment || !item.service || item.quantity < 1 || item.price < 0,
      )
    ) {
      setError("Please check garment details and quantities.");
      return;
    }

    const existingOrder = orders.find((order) => order.id === editingId);

    // Save customer details into the same LocalStorage collection used by Customers page.
    const savedCustomersRaw = localStorage.getItem("brandbox_customers");
    const savedCustomers: Customer[] = savedCustomersRaw
      ? JSON.parse(savedCustomersRaw)
      : customers;
    const matchedCustomer = savedCustomers.find(
      (customer) =>
        customer.phone.replace(/\D/g, "") === customerPhone.replace(/\D/g, ""),
    );

    const customer: Customer = {
      id: matchedCustomer?.id ?? Date.now(),
      name: customerName,
      phone: customerPhone,
      email: form.customerEmail.trim(),
      address: form.customerAddress.trim(),
    };

    const nextCustomers = matchedCustomer
      ? savedCustomers.map((item) =>
          item.id === matchedCustomer.id ? customer : item,
        )
      : [...savedCustomers, customer];

    localStorage.setItem("brandbox_customers", JSON.stringify(nextCustomers));
    setCustomers(nextCustomers);

    const newOrder: Order = {
      id: editingId || `ORD-${Date.now().toString().slice(-7)}`,
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      items: items.map((item) => ({
        ...item,
        garmentId:
          item.garmentId ||
          `${editingId || `ORD-${Date.now().toString().slice(-7)}`}-G${item.id}`,
      })),
      total: totalAmount,
      status: existingOrder?.status || "Pending",
      paymentStatus: form.paymentStatus,
      paymentMethod: form.paymentMethod,
      pickupDate: form.pickupDate,
      deliveryDate: form.deliveryDate,
      createdAt:
        existingOrder?.createdAt || new Date().toISOString().slice(0, 10),
      notes: form.notes,
    };

    if (editingId) {
      setOrders((previous) =>
        previous.map((order) => (order.id === editingId ? newOrder : order)),
      );
    } else {
      setOrders((previous) => [newOrder, ...previous]);
      setPage(1);
      setQrOrder(newOrder);
      setQrDataUrl("");
    }
    setModalOpen(false);
    setForm(emptyForm);
    setItems([createEmptyItem()]);
  };

  // UPDATE ORDER STATUS
  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((previous) =>
      previous.map((order) => (order.id === id ? { ...order, status } : order)),
    );
    setMenuId(null);
  };

  // DELETE ORDER
  const deleteOrder = (id: string) => {
    if (!window.confirm("Delete this order?")) return;
    setOrders((previous) => previous.filter((order) => order.id !== id));
    setMenuId(null);
    setSelectedOrder(null);
  };

  // EXPORT CSV
  const exportCSV = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Phone",
      "Items",
      "Amount",
      "Order Status",
      "Payment Status",
      "Delivery Date",
    ];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.customerName,
      order.phone,
      order.items.map((i) => `${i.garment} x ${i.quantity}`).join("; "),
      order.total,
      order.status,
      order.paymentStatus,
      order.deliveryDate,
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
    link.download = "brand-box-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-w-0 space-y-7">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
            WORKSPACE / ORDERS
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage laundry orders, garments and deliveries.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078FC1]"
        >
          <Plus size={18} />
          Create Order
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Orders",
            value: orders.length,
            icon: ShoppingBag,
            color: "bg-[#EAF8FE] text-[#08A8E0]",
          },
          {
            title: "Pending Orders",
            value: pendingCount,
            icon: Clock,
            color: "bg-orange-50 text-orange-500",
          },
          {
            title: "Processing",
            value: processingCount,
            icon: Shirt,
            color: "bg-purple-50 text-purple-600",
          },
          {
            title: "Delivered",
            value: deliveredCount,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
              >
                <Icon size={21} />
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h2 className="mt-1 text-2xl font-bold text-[#142033]">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* ORDER TABLE */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-bold text-[#142033]">Order Directory</h2>
            <p className="mt-1 text-xs text-slate-400">
              Track and manage all customer orders
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-[#08A8E0] hover:text-[#08A8E0]"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* SEARCH AND FILTER */}
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
              placeholder="Search order ID, customer or phone..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#08A8E0] focus:ring-2 focus:ring-cyan-500/10"
            />
          </div>
          <div className="relative sm:w-48">
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
              <option value="All">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-white">
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Garments</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Order Status</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Delivery</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-[#08A8E0]">
                      {order.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {order.createdAt}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-[#142033]">
                      {order.customerName}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{order.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-700">
                      {order.items.length} types
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      garments
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#142033]">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {order.deliveryDate}
                  </td>
                  <td className="relative px-5 py-4 text-right">
                    <button
                      onClick={() =>
                        setMenuId(menuId === order.id ? null : order.id)
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {menuId === order.id && (
                      <div className="absolute right-8 top-10 z-40 w-48 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          <Eye size={15} /> View Details
                        </button>
                        <button
                          onClick={() => {
                            setQrOrder(order);
                            setQrDataUrl("");
                            setMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          <QrCode size={15} /> View QR Code
                        </button>
                        <button
                          onClick={() => openEditModal(order)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil size={15} /> Edit Order
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        {(
                          [
                            "Pending",
                            "Processing",
                            "Ready",
                            "Delivered",
                            "Cancelled",
                          ] as OrderStatus[]
                        ).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateStatus(order.id, status)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
                          >
                            Mark {status}
                          </button>
                        ))}
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={15} /> Delete Order
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentOrders.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <ShoppingBag size={30} className="text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-700">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Try another search or create a new order.
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-500">
            Showing{" "}
            {filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="rounded-lg bg-[#08A8E0] px-3 py-2 text-xs font-semibold text-white">
              {page}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* CREATE / EDIT ORDER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5">
          <div className="my-auto flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-[#142033]">
                  {editingId ? "Edit Order" : "Create New Order"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Add customer and garment information.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5"
            >
              {/* CUSTOMER DETAILS */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-[#EAF8FE] p-2 text-[#08A8E0]">
                    <User size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-[#142033]">
                    Customer Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Customer Name *
                    </label>
                    <input
                      required
                      value={form.customerName}
                      onChange={(e) =>
                        setForm({ ...form, customerName: e.target.value })
                      }
                      placeholder="Enter customer name"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) =>
                        setForm({ ...form, customerPhone: e.target.value })
                      }
                      placeholder="Enter phone number"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) =>
                        setForm({ ...form, customerEmail: e.target.value })
                      }
                      placeholder="Enter email address"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Address
                    </label>
                    <input
                      value={form.customerAddress}
                      onChange={(e) =>
                        setForm({ ...form, customerAddress: e.target.value })
                      }
                      placeholder="Enter customer address"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  </div>
                </div>
                <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-700">
                  Customer details entered here will be automatically saved to
                  the Customers page when you save the order. Existing customers
                  with the same phone number will be updated instead of
                  duplicated.
                </p>
              </section>

              {/* GARMENT DETAILS */}
              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                      <Shirt size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-[#142033]">
                      Garment Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 rounded-lg bg-[#EAF8FE] px-3 py-2 text-xs font-semibold text-[#08A8E0] hover:bg-cyan-100"
                  >
                    <Plus size={15} /> Add Garment
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-600">
                          GARMENT {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Garment
                          </label>
                          <select
                            value={item.garment}
                            onChange={(e) =>
                              updateGarment(item.id, e.target.value)
                            }
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                          >
                            {item.garment &&
                              !priceOptions.some(
                                (g) => g.garment === item.garment,
                              ) && (
                                <option value={item.garment}>
                                  {item.garment} (Inactive / historical)
                                </option>
                              )}
                            {priceOptions.map((garment) => (
                              <option key={garment.id} value={garment.garment}>
                                {garment.garment} ·{" "}
                                {formatCurrency(garment.minPrice)}
                                {garment.maxPrice !== garment.minPrice
                                  ? ` - ${formatCurrency(garment.maxPrice)}`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Service
                          </label>
                          <select
                            value={item.service}
                            onChange={(e) =>
                              updateItem(item.id, "service", e.target.value)
                            }
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                          >
                            {item.service &&
                              !serviceOptions.some(
                                (service) => service.name === item.service,
                              ) && (
                                <option value={item.service}>
                                  {item.service} (Inactive / historical)
                                </option>
                              )}
                            {serviceOptions.map((service) => (
                              <option key={service.id} value={service.name}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "quantity",
                                Math.max(1, Number(e.target.value)),
                              )
                            }
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Price Per Garment (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "price",
                                Math.max(0, Number(e.target.value)),
                              )
                            }
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                          />
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={`${item.garment || "Garment"} reference`}
                              className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400">
                              <Shirt size={28} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#142033]">
                              Garment reference photo
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Take a clear photo of this exact piece to prevent
                              mix-ups. Max 3 MB.
                            </p>
                            <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg bg-[#EAF8FE] px-3 py-2 text-xs font-semibold text-[#08A8E0] hover:bg-cyan-100">
                              {item.photoUrl
                                ? "Change photo"
                                : "Upload dress photo"}
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(event) => {
                                  handleGarmentPhoto(
                                    item.id,
                                    event.target.files?.[0],
                                  );
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                            {item.photoUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateItem(item.id, "photoUrl", "")
                                }
                                className="ml-3 text-xs font-medium text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                        <span className="text-xs text-slate-500">
                          Item Subtotal
                        </span>
                        <span className="text-sm font-bold text-[#142033]">
                          {formatCurrency(item.quantity * item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* PICKUP AND DELIVERY */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-orange-50 p-2 text-orange-500">
                    <CalendarDays size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-[#142033]">
                    Pickup & Delivery
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.pickupDate}
                      onChange={(e) =>
                        setForm({ ...form, pickupDate: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      min={form.pickupDate || undefined}
                      required
                      value={form.deliveryDate}
                      onChange={(e) =>
                        setForm({ ...form, deliveryDate: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#08A8E0]"
                    />
                  </div>
                </div>
              </section>

              {/* PAYMENT */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <IndianRupee size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-[#142033]">
                    Payment Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Payment Method
                    </label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm({ ...form, paymentMethod: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                    >
                      <option>Cash</option>
                      <option>UPI</option>
                      <option>Card</option>
                      <option>Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Payment Status
                    </label>
                    <select
                      value={form.paymentStatus}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          paymentStatus: e.target.value as PaymentStatus,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#08A8E0]"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* NOTES */}
              <section>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Special instructions..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#08A8E0]"
                />
              </section>

              {/* TOTAL */}
              <section className="rounded-xl bg-[#EAF8FE] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Order Total
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {items.length} garment types
                    </p>
                  </div>
                  <h2 className="text-2xl font-bold text-[#08A8E0]">
                    {formatCurrency(totalAmount)}
                  </h2>
                </div>
              </section>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* FORM ACTIONS */}
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
                  disabled={
                    priceOptions.length === 0 || serviceOptions.length === 0
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#08A8E0] px-6 py-3 text-sm font-semibold text-white hover:bg-[#078FC1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  {editingId ? "Save Changes" : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER QR MODAL */}
      {qrOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold text-[#08A8E0]">
                  ORDER TRACKING QR
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#142033]">
                  {qrOrder.id}
                </h2>
              </div>
              <button
                onClick={() => {
                  setQrOrder(null);
                  setQrDataUrl("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="font-semibold text-[#142033]">
                {qrOrder.customerName}
              </p>
              <p className="mt-1 text-xs text-slate-500">{qrOrder.phone}</p>
              <div className="mx-auto my-5 flex h-[230px] w-[230px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-3">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${qrOrder.id}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-slate-400">
                    Generating QR code...
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-[#142033]">
                Individual garment QR labels
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Attach the matching QR label to each physical garment.
              </p>
              <div className="mt-4 space-y-3">
                {qrOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.garment}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-lg bg-slate-100 text-slate-400">
                        <Shirt size={22} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#142033]">
                        {item.garment || "Garment"} · {item.service}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.garmentId || `${qrOrder.id}-G${item.id}`} · Qty{" "}
                        {item.quantity}
                      </p>
                      {!item.photoUrl && (
                        <p className="mt-1 text-[11px] text-orange-600">
                          Photo not uploaded
                        </p>
                      )}
                    </div>
                    {garmentQrData[item.id] ? (
                      <img
                        src={garmentQrData[item.id]}
                        alt={`QR for garment ${item.id}`}
                        className="h-20 w-20 shrink-0"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Creating QR…
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 pt-0 text-center">
              <p className="text-sm font-semibold text-[#142033]">
                Scan to track this order
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Static demo QR contains this order's preview data.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!qrDataUrl}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = qrDataUrl;
                    link.download = `${qrOrder.id}-QR.png`;
                    link.click();
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Download size={16} /> Download
                </button>
                <button
                  type="button"
                  disabled={!qrDataUrl}
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#08A8E0] px-3 py-3 text-sm font-semibold text-white hover:bg-[#078FC1] disabled:opacity-40"
                >
                  <Printer size={16} /> Print QR
                </button>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const payload = encodeURIComponent(
                    btoa(encodeURIComponent(JSON.stringify(qrOrder))),
                  );
                  const url = `${window.location.origin}/track/${encodeURIComponent(qrOrder.id)}?demo=${payload}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1800);
                  } catch {
                    window.prompt("Copy tracking URL", url);
                  }
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-[#08A8E0] hover:bg-sky-50"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Tracking link copied" : "Copy tracking link"}
              </button>
              <a
                href={`/track/${encodeURIComponent(qrOrder.id)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#08A8E0]"
              >
                Preview tracking page <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold text-[#08A8E0]">
                  ORDER DETAILS
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#142033]">
                  {selectedOrder.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs text-slate-400">Customer</p>
                <p className="mt-1 font-semibold text-[#142033]">
                  {selectedOrder.customerName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.phone}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedOrder.status} />
                <StatusBadge status={selectedOrder.paymentStatus} />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <div className="bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                  GARMENT BREAKDOWN
                </div>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-t border-slate-100 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {item.garment}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.service} · {item.quantity} pcs
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#142033]">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Pickup Date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {selectedOrder.pickupDate}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Delivery Date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {selectedOrder.deliveryDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="font-semibold text-slate-600">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-[#08A8E0]">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
              {selectedOrder.notes && (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  {selectedOrder.notes}
                </p>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-xl bg-[#08A8E0] py-3 text-sm font-semibold text-white hover:bg-[#078FC1]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
