"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Shirt,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#142033] outline-none transition placeholder:text-slate-400 focus:border-[#08A8E0] focus:ring-4 focus:ring-sky-100";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    branchName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = register({
      branchName: form.branchName,
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#F3F7FB] px-3 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-8">
      <div className="mx-auto grid w-full max-w-[1440px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-35px_rgba(15,35,60,0.28)] lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left visual panel: natural height, no clipped form */}
        <section className="relative hidden min-h-[820px] self-stretch overflow-hidden bg-[#10263B] lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1400&q=85')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#09243B]/90 via-[#0B2D48]/70 to-[#08A8E0]/50" />
          <div className="relative z-10 flex min-h-[820px] h-full flex-col justify-between p-10 xl:p-14">
            <Brand dark />
            <div className="max-w-lg py-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-sky-50 backdrop-blur">
                <Sparkles size={14} /> SMART LAUNDRY OPERATIONS
              </div>
              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
                A cleaner way to manage your laundry business.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-sky-50/85">
                Organise branch operations, manage orders and keep your
                customers moving through every stage of service.
              </p>
              <div className="mt-9 grid max-w-md grid-cols-2 gap-3">
                <FeatureCard title="One" subtitle="Simple workspace" />
                <FeatureCard title="Every" subtitle="Branch in control" />
              </div>
            </div>
            <p className="text-xs text-white/65">
              THE BRAND BOX · LAUNDRY MANAGEMENT SYSTEM
            </p>
          </div>
        </section>

        {/* Form panel expands and page can scroll on short screens */}
        <section className="flex items-center justify-center px-5 py-9 sm:px-9 sm:py-12 lg:px-12 xl:px-16">
          <div className="w-full max-w-[600px]">
            <div className="mb-8 lg:hidden">
              <Brand />
            </div>
            <div className="mb-7">
              <p className="text-xs font-bold tracking-[1.8px] text-[#08A8E0]">
                GET STARTED
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#142033] sm:text-[36px]">
                Create your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Register your first branch and set up your administrator
                account.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Branch name *
                </span>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    required
                    value={form.branchName}
                    onChange={(event) =>
                      update("branchName", event.target.value)
                    }
                    placeholder="e.g. Chennai Main Branch"
                    className={`${inputClass} pl-11`}
                  />
                </div>
                <span className="mt-1.5 block text-xs text-slate-400">
                  Example: Chennai Main Branch, Anna Nagar Branch
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Owner name *
                  </span>
                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder="Your full name"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone number *
                  </span>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      placeholder="Phone number"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address *
                </span>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="name@example.com"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Password *
                  </span>
                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) =>
                        update("password", event.target.value)
                      }
                      placeholder="Minimum 8 characters"
                      className={`${inputClass} pl-11 pr-11`}
                    />
                    <button
                      type="button"
                      aria-label="Show password"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm password *
                  </span>
                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(event) =>
                        update("confirmPassword", event.target.value)
                      }
                      placeholder="Re-enter password"
                      className={`${inputClass} pl-11 pr-11`}
                    />
                    <button
                      type="button"
                      aria-label="Show confirm password"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#08A8E0] text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-[#078FC1]"
              >
                Create account <ArrowRight size={17} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-bold text-[#08A8E0] hover:underline"
              >
                Sign in
              </Link>
            </p>
            <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
              Frontend demo only. Account details are saved in this browser
              until a secure backend is connected.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08A8E0] text-white shadow-lg shadow-sky-950/20">
        <Shirt size={25} />
      </div>
      <div>
        <p
          className={`text-[15px] font-extrabold tracking-[1.3px] ${dark ? "text-white" : "text-[#142033]"}`}
        >
          THE BRAND BOX
        </p>
        <p
          className={`mt-0.5 text-xs ${dark ? "text-sky-100/75" : "text-slate-400"}`}
        >
          Laundry Management
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
      <p className="text-2xl font-bold text-white">{title}</p>
      <p className="mt-1 text-xs text-sky-100/80">{subtitle}</p>
    </div>
  );
}
