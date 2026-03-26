"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Tag,
  ShoppingCart,
  Package,
  PlusCircle,
  FolderTree,
  BarChart3,
  Image,
  ChevronLeft,
  ChevronRight,
  MenuSquare,
  Gift,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCookie } from "cookies-next";
import { Module } from "@/lib/permissions";
import { useUserPermissions } from "@/hooks/use-permissions";

interface Route {
  label: string;
  icon: any;
  href: string;
  module: Module;
}

const routes: Route[] = [
  {
    label: "Admin Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    module: "dashboard",
  },
  {
    label: "Admin Management",
    icon: Users,
    href: "/admins",
    module: "admins",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
    module: "customers",
  },
  {
    label: "Coupon Management",
    icon: Tag,
    href: "/coupons",
    module: "coupons",
  },
  {
    label: "All Orders",
    icon: ShoppingCart,
    href: "/orders",
    module: "orders",
  },
  {
    label: "All Products",
    icon: Package,
    href: "/products",
    module: "products",
  },
  {
    label: "Create Product",
    icon: PlusCircle,
    href: "/products/new",
    module: "products", // Create product is part of products module
  },
  {
    label: "Categories",
    icon: FolderTree,
    href: "/categories",
    module: "categories",
  },
  {
    label: "Sub Categories",
    icon: FolderTree,
    href: "/subcategories",
    module: "subcategories",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    module: "analytics",
  },
  {
    label: "Website Banners",
    icon: Image,
    href: "/website-banners",
    module: "website_banners",
  },
  {
    label: "App Banners",
    icon: Image,
    href: "/app-banners",
    module: "app_banners",
  },
  {
    label: "Topbar Management",
    icon: MenuSquare,
    href: "/topbar",
    module: "topbar",
  },
  {
    label: "Home Screen Offers",
    icon: Gift,
    href: "/offers",
    module: "offers",
  },
  {
    label: "Review Management",
    icon: Star,
    href: "/reviews",
    module: "reviews",
  },
];

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ className, isCollapsed: controlled, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(false);
  const { can, loading } = useUserPermissions();

  const isCollapsed = controlled ?? isCollapsedInternal;

  const handleLogout = () => {
    deleteCookie("admin_session");
    router.push("/");
  };

  if (loading) return null; // Or a skeleton

  const visibleRoutes = routes.filter(route => can(route.module, 'view'));

  return (
    <div className={cn("relative h-full flex flex-col", className)}>
      <div className={cn(
        "flex flex-col gap-4 py-4 h-full bg-slate-900 text-white",
        isCollapsed ? "w-16" : "w-60",
        "transition-all duration-300 ease-in-out"
      )}>
        <ScrollArea className="flex-1 w-full">
          <div className="space-y-2 px-3">
            {visibleRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-x-2 text-slate-200 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800 transition-all",
                  pathname === route.href && "bg-slate-800"
                )}
              >
                <route.icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "")} />
                {!isCollapsed && <span>{route.label}</span>}
              </Link>
            ))}
          </div>
        </ScrollArea>
        <div className="px-3 mt-auto">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800",
              isCollapsed && "justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
