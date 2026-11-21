"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Shirt,
  Mail,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";



export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const result = login(identifier, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-dvh bg-[#F3F7FB] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto grid min-h-[min(820px,calc(100dvh-56px))] w-full max-w-[1380px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-35px_rgba(15,35,60,0.28)] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Brand image panel */}
        <section className="relative hidden min-h-[760px] overflow-hidden bg-[#10263B] lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1400&q=85')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#09243B]/90 via-[#0B2D48]/70 to-[#08A8E0]/50" />
          <div className="relative z-10 flex min-h-[760px] h-full flex-col justify-between p-10 xl:p-14">
            <Brand />
            <div className="max-w-lg pb-5">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-sky-50 backdrop-blur">
                <Sparkles size={14} /> SMART LAUNDRY OPERATIONS
              </div>
              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
                Manage every branch from one place.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-sky-50/85">
                Track orders, customers, payments and daily business performance
                with one simple workspace.
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

        {/* Login form */}
        <section className="flex items-center justify-center px-5 py-9 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[480px]">
            <div className="mb-9 lg:hidden">
              <Brand />
            </div>
            <p className="text-xs font-bold tracking-[1.8px] text-[#08A8E0]">
              WELCOME BACK
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#142033] sm:text-[36px]">
              Sign in to your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your account details to continue to your workspace.
            </p>

            <form onSubmit={submit} className="mt-9 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Email or phone number
                </span>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    required
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="Enter email or phone"
                    autoComplete="username"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#142033] outline-none transition placeholder:text-slate-400 focus:border-[#08A8E0] focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </span>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-[#142033] outline-none transition placeholder:text-slate-400 focus:border-[#08A8E0] focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

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
                Sign in <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
              <p className="text-xs font-bold text-sky-900">Demo accounts</p>
              <p className="mt-2 text-xs leading-5 text-sky-800">
                Super Admin: admin@brandbox.demo / Demo@123
              </p>
              <p className="text-xs leading-5 text-sky-800">
                Branch Admin: branch@brandbox.demo / Demo@123
              </p>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              New branch owner?{" "}
              <Link
                href="/register"
                className="font-bold text-[#08A8E0] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08A8E0] text-white shadow-lg shadow-sky-950/20">
        <Shirt size={25} />
      </div>
      <div>
        <p className="text-[15px] font-extrabold tracking-[1.3px] text-[#142033] lg:text-white">
          THE BRAND BOX
        </p>
        <p className="mt-0.5 text-xs text-slate-400 lg:text-sky-100/75">
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
