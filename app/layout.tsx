"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <div className="relative min-h-screen">
          {!isLoginPage && (
            <div className={cn(
              "hidden h-screen md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-slate-900",
              isSidebarCollapsed ? "md:w-16" : "md:w-60"
            )}>
              <Sidebar
                className="h-full"
                isCollapsed={isSidebarCollapsed}
                onCollapsedChange={setIsSidebarCollapsed}
              />
            </div>
          )}
          <main className={cn(
            "min-h-screen transition-all duration-300 ease-in-out",
            !isLoginPage ? (isSidebarCollapsed ? "md:pl-16" : "md:pl-60") : ""
          )}>
            {!isLoginPage && <Navbar />}
            <div className={cn("p-8", !isLoginPage && "pt-24")}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}