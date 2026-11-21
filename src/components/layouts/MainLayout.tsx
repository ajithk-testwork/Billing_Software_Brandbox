
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [mobileMenu, setMobileMenu] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Public routes
  const isAuthRoute =
    pathname === "/login" || pathname === "/register";

  const isTrackingRoute = pathname.startsWith("/track/");

  const isPublicRoute = isAuthRoute || isTrackingRoute;

  // Close mobile menu and reset scroll on route change
  useEffect(() => {
    setMobileMenu(false);
    mainRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);

  // Handle Escape key and body scroll
  useEffect(() => {
    if (!mobileMenu) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenu(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  // Authentication redirect
  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    // Only redirect logged-in users from login/register pages
    if (user && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [user, loading, isPublicRoute, isAuthRoute, router]);

  // Loading screen
  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#F7F9FC] text-sm text-slate-500">
        Loading The Brand Box...
      </div>
    );
  }

  // Public pages: Login, Register, Tracking
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Redirect screen for unauthenticated users
  if (!user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#F7F9FC] text-sm text-slate-500">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#F7F9FC]">
      {/* Desktop Sidebar */}
      <aside className="hidden h-full w-[260px] shrink-0 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
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
              aria-label="Close menu"
              className="absolute right-3 top-5 z-20 rounded-lg bg-white p-2 shadow"
            >
              <X size={18} />
            </button>

            <Sidebar onNavigate={() => setMobileMenu(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="z-30 shrink-0">
          <Header onMenuClick={() => setMobileMenu(true)} />
        </div>

        {/* Page Content */}
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
