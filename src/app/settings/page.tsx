"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Building2,
  FileText,
  Bell,
  Package,
  Save,
  RotateCcw,
  Check,
  Store,
  Mail,
  Phone,
  MapPin,
  Hash,
  Clock3,
  ShieldCheck,
} from "lucide-react";

type Settings = {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  invoicePrefix: string;
  orderPrefix: string;
  taxRate: string;
  dueDays: string;
  turnaroundDays: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderAlerts: boolean;
  paymentAlerts: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  businessName: "Brandbox Laundry",
  phone: "+91 98765 43210",
  email: "hello@brandbox.in",
  address: "Chennai, Tamil Nadu, India",
  gstNumber: "",
  invoicePrefix: "INV-",
  orderPrefix: "ORD-",
  taxRate: "5",
  dueDays: "7",
  turnaroundDays: "3",
  emailNotifications: true,
  smsNotifications: false,
  orderAlerts: true,
  paymentAlerts: true,
};

const STORAGE_KEY = "brandbox_settings";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[#08A8E0]" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#08A8E0] focus:ring-4 focus:ring-sky-100 ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // Keep defaults if stored settings are invalid.
    }
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-[#08A8E0]">WORKSPACE</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#142033] sm:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your laundry business preferences and configuration.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetSettings}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              form="settings-form"
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#08A8E0] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
            >
              <Save size={16} /> Save changes
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <Check size={17} /> Settings saved on this device.
          </div>
        )}

        <form
          id="settings-form"
          onSubmit={saveSettings}
          className="grid gap-5 lg:grid-cols-[ minmax(0,1fr)_300px ]"
        >
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-[#08A8E0]">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#142033]">
                    Business profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your store's basic information
                  </p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Business name"
                  value={settings.businessName}
                  onChange={(v) => update("businessName", v)}
                  icon={Store}
                />
                <Field
                  label="Contact number"
                  value={settings.phone}
                  onChange={(v) => update("phone", v)}
                  icon={Phone}
                />
                <Field
                  label="Business email"
                  value={settings.email}
                  onChange={(v) => update("email", v)}
                  type="email"
                  icon={Mail}
                />
                <Field
                  label="GSTIN (optional)"
                  value={settings.gstNumber}
                  onChange={(v) => update("gstNumber", v)}
                  placeholder="Enter GST number"
                  icon={ShieldCheck}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Business address"
                    value={settings.address}
                    onChange={(v) => update("address", v)}
                    icon={MapPin}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#142033]">
                    Invoice & billing
                  </h2>
                  <p className="text-xs text-slate-500">
                    Set invoice numbering and billing defaults
                  </p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Invoice prefix"
                  value={settings.invoicePrefix}
                  onChange={(v) => update("invoicePrefix", v)}
                  icon={Hash}
                />
                <Field
                  label="Tax / GST rate (%)"
                  value={settings.taxRate}
                  onChange={(v) => update("taxRate", v)}
                  type="number"
                />
                <Field
                  label="Payment due days"
                  value={settings.dueDays}
                  onChange={(v) => update("dueDays", v)}
                  type="number"
                />
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">
                    Invoice preview
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#142033]">
                    {settings.invoicePrefix || "INV-"}0001
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Tax rate is stored as a preference only; it is not yet applied
                automatically to invoices.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#142033]">
                    Order preferences
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure order reference and turnaround defaults
                  </p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Order ID prefix"
                  value={settings.orderPrefix}
                  onChange={(v) => update("orderPrefix", v)}
                  icon={Hash}
                />
                <Field
                  label="Default turnaround (days)"
                  value={settings.turnaroundDays}
                  onChange={(v) => update("turnaroundDays", v)}
                  type="number"
                  icon={Clock3}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#142033]">
                    Notifications
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose which alerts you want to see
                  </p>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {(
                  [
                    [
                      "emailNotifications",
                      "Email notifications",
                      "Receive updates through email.",
                    ],
                    [
                      "smsNotifications",
                      "SMS notifications",
                      "Receive important updates through SMS.",
                    ],
                    [
                      "orderAlerts",
                      "New order alerts",
                      "Get notified when a new order is created.",
                    ],
                    [
                      "paymentAlerts",
                      "Payment alerts",
                      "Get notified when a payment is recorded.",
                    ],
                  ] as const
                ).map(([key, title, description]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {description}
                      </p>
                    </div>
                    <Toggle
                      checked={settings[key]}
                      onChange={(v) => update(key, v)}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Notification switches are saved locally; sending real email or
                SMS requires backend integration.
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-[#142033]">
                Configuration summary
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Current workspace defaults
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Business</span>
                  <span className="max-w-36 truncate font-semibold text-slate-700">
                    {settings.businessName || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Invoice prefix</span>
                  <span className="font-semibold text-slate-700">
                    {settings.invoicePrefix || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Order prefix</span>
                  <span className="font-semibold text-slate-700">
                    {settings.orderPrefix || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Tax rate</span>
                  <span className="font-semibold text-slate-700">
                    {settings.taxRate || "0"}%
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Turnaround</span>
                  <span className="font-semibold text-slate-700">
                    {settings.turnaroundDays || "0"} days
                  </span>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-sky-50 p-3 text-xs leading-5 text-sky-800">
                Changes are stored in this browser using LocalStorage. They are
                not synced across devices.
              </div>
            </div>
            <div className="rounded-2xl bg-[#142033] p-5 text-white shadow-sm">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-semibold">Keep your workspace updated</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Review your business details and billing preferences whenever
                your store information changes.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
