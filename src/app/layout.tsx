import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "../components/layouts/MainLayout";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "The Brand Box | Laundry Management",
  description: "The Brand Box Laundry Billing and Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
