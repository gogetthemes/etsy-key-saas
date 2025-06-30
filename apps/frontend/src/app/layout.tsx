import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./AuthProvider";
import AppContent from "./AppContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EtsyKey SaaS",
  description: "Your keyword research assistant",
};

const BUILD_COMMIT = "7160a1002cb62aa8b30d47dfbdf6ddf93b0c5407";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-gray-50 min-h-screen`}
      >
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
        <footer className="w-full text-center text-xs text-gray-400 py-2 border-t mt-8">
          Build commit: {BUILD_COMMIT}
        </footer>
      </body>
    </html>
  );
}
