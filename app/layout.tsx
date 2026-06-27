import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR System",
  description: "Employee records and scheduling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
