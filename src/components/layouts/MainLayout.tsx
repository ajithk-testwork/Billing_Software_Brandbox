"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../../context/AuthContext";

const publicRoutes = ["/login", "/register"];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    setMobileMenu(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenu) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenu(false);
    };
    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicRoute) router.replace("/login");
    if (user && isPublicRoute) router.replace("/dashboard");
  }, [user, loading, isPublicRoute, router]);

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#F7F9FC] text-sm text-slate-500">
        Loading The Brand Box...
      </div>
    );
  }

  if (isPublicRoute) return <>{children}</>;

  if (!user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#F7F9FC] text-sm text-slate-500">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#F7F9FC]">
      <aside className="hidden h-full w-[260px] shrink-0 lg:block">
        <Sidebar />
      </aside>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMobileMenu(false)}
          />
          <div className="relative z-10 h-full w-[280px]">
            <button
              onClick={() => setMobileMenu(false)}
              className="absolute right-3 top-5 z-20 rounded-lg bg-white p-2 shadow"
            >
              <X size={18} />
            </button>
            <Sidebar onNavigate={() => setMobileMenu(false)} />
          </div>
        </div>
      )}

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="z-30 shrink-0">
          <Header onMenuClick={() => setMobileMenu(true)} />
        </div>
        <main
          ref={mainRef}
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
