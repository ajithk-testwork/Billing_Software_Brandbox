"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Shirt,
  PackageCheck,
  MapPin,
  Phone,
  CalendarDays,
  IndianRupee,
  RefreshCw,
  Sparkles,
} from "lucide-react";

type OrderItem = {
  id: number;
  garment: string;
  service: string;
  quantity: number;
  price: number;
};

type DemoOrder = {
  id: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Ready" | "Delivered" | "Cancelled";
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  paymentMethod: string;
  pickupDate: string;
  deliveryDate: string;
  createdAt: string;
  notes?: string;
};

const STORAGE_KEY = "brandbox_orders";
const steps = [
  {
    title: "Order received",
    description: "Your garments have been received.",
    icon: PackageCheck,
  },
  {
    title: "Washing",
    description: "Your garments are being cleaned.",
    icon: Shirt,
  },
  {
    title: "Ironing",
    description: "Your garments are being pressed.",
    icon: Sparkles,
  },
  {
    title: "Ready for pickup",
    description: "Your order is ready at the store.",
    icon: MapPin,
  },
  {
    title: "Delivered",
    description: "Your order has been handed over.",
    icon: CheckCircle2,
  },
];

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function stageIndex(status: DemoOrder["status"]) {
  if (status === "Processing") return 1;
  if (status === "Ready") return 3;
  if (status === "Delivered") return 4;
  if (status === "Cancelled") return -1;
  return 0;
}

export default function TrackOrderPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = decodeURIComponent(params.orderId);
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadOrder = useCallback(() => {
    try {
      const query = new URLSearchParams(window.location.search);
      const encoded = query.get("demo");

      if (encoded) {
        const decoded = decodeURIComponent(atob(decodeURIComponent(encoded)));
        const sharedOrder = JSON.parse(decoded) as DemoOrder;
        if (sharedOrder.id === orderId) {
          setOrder(sharedOrder);
          setNotFound(false);
          setLoading(false);
          return;
        }
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      const orders = stored ? (JSON.parse(stored) as DemoOrder[]) : [];
      const found = orders.find((item) => item.id === orderId);
      setOrder(found ?? null);
      setNotFound(!found);
    } catch {
      setOrder(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) loadOrder();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadOrder]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5F7FA] text-sm text-slate-500">
        Loading your order...
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5F7FA] p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <PackageCheck className="mx-auto text-slate-300" size={42} />
          <h1 className="mt-4 text-xl font-bold text-[#142033]">
            Order not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            We couldn't find this demo order. Please scan the QR code again or
            contact the laundry store.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white"
          >
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      </main>
    );
  }

  const currentStage = stageIndex(order.status);
  const cancelled = order.status === "Cancelled";
  const garmentCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF8FE] text-[#08A8E0]">
            <Shirt size={25} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#08A8E0]">
            BRANDBOX LAUNDRY
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#142033] sm:text-3xl">
            Track your order
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Stay updated on your laundry, from drop-off to delivery.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#142033] p-5 text-white sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-300">
                  ORDER NUMBER
                </p>
                <h2 className="mt-1 text-2xl font-bold">{order.id}</h2>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cancelled ? "bg-red-100 text-red-700" : order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}
              >
                {cancelled
                  ? "Cancelled"
                  : order.status === "Pending"
                    ? "Received"
                    : order.status === "Processing"
                      ? "Processing"
                      : order.status === "Ready"
                        ? "Ready for pickup"
                        : "Delivered"}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-slate-300">Customer</p>
                <p className="mt-1 text-sm font-semibold">
                  {order.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-300">Garments</p>
                <p className="mt-1 text-sm font-semibold">
                  {garmentCount} pieces
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-[#142033]">Order progress</h3>
              <span className="text-xs text-slate-400">Live demo status</span>
            </div>

            {cancelled ? (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                This order has been cancelled. Please contact the store for
                assistance.
              </div>
            ) : (
              <div className="relative space-y-6">
                {steps.map((step, index) => {
                  const done = index <= currentStage;
                  const active = index === currentStage + 1 && currentStage < 4;
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="relative flex gap-4">
                      {index !== steps.length - 1 && (
                        <div
                          className={`absolute left-[17px] top-9 h-[calc(100%+12px)] w-0.5 ${index < currentStage ? "bg-emerald-400" : "bg-slate-100"}`}
                        />
                      )}
                      <div
                        className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ${done ? "bg-emerald-100 text-emerald-600" : active ? "bg-sky-100 text-[#08A8E0]" : "bg-slate-100 text-slate-400"}`}
                      >
                        {done ? <CheckCircle2 size={19} /> : <Icon size={18} />}
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-sm font-semibold ${done || active ? "text-[#142033]" : "text-slate-400"}`}
                          >
                            {step.title}
                          </p>
                          {index === currentStage && (
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-[#08A8E0]">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="my-6 border-t border-slate-100" />
            <h3 className="mb-3 font-bold text-[#142033]">Garment details</h3>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {item.garment}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.service} · {item.quantity} pcs
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[#142033]">
                    {currency(item.quantity * item.price)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarDays size={13} /> Pickup date
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {order.pickupDate || "—"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock3 size={13} /> Expected delivery
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {order.deliveryDate || "—"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#EAF8FE] p-4">
              <div>
                <p className="text-xs text-slate-500">Total amount</p>
                <p className="mt-1 text-xl font-bold text-[#142033]">
                  {currency(order.total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Payment</p>
                <p
                  className={`mt-1 text-sm font-bold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-orange-600"}`}
                >
                  {order.paymentStatus}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-100 p-3 text-xs text-slate-500">
              <Phone size={15} className="shrink-0" />
              Need help? Contact the store at {order.phone}.
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-xs text-slate-400">
          Thank you for choosing Brandbox Laundry.
        </p>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Frontend demo · Order details in this QR are illustrative and are not
          secured by a backend.
        </p>
      </div>
    </main>
  );
}
