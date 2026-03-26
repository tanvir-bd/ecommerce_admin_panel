"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
  return (
    <div className="fixed top-0 w-full z-50 flex justify-between items-center py-2 px-4 h-16 border-b bg-white">
      <div className="flex items-center gap-x-4">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={40}
          height={40}
          className="dark:hidden"
        />
        <span className="font-bold text-xl">Admin Panel</span>
      </div>
      
      <div className="flex items-center gap-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            3
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
