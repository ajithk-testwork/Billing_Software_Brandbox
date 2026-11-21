import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import MainLayout from "../components/layouts/MainLayout";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "The Brand Box | Laundry Management",
  description: "The Brand Box Laundry Billing and Management System",
};

function LoadingScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#F7F9FC] text-sm text-slate-500">
      Loading The Brand Box...
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
            <MainLayout>{children}</MainLayout>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
