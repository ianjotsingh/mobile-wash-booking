
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DashboardTopBar = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="w-full flex justify-end items-center p-4 bg-white border-b border-gray-200 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 text-gray-700 hover:bg-gray-100">
            <User className="h-5 w-5" />
            <span className="font-medium">{user?.email || user?.phone || "Account"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border z-50">
          <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-red-600 cursor-pointer">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DashboardTopBar;
