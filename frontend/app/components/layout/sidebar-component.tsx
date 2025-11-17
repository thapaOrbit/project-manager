import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import {
  CheckCircle2,
  CheckSquare,
  ChevronsLeft,
  ChevronsRight,
  Folder,
  Home,
  LogOut,
  UserCog,
  Users,
  FolderTreeIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/provider/auth-context";

export const SidebarComponent = ({
  currentWorkspace,
}: {
  currentWorkspace: Workspace | null;
}) => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const COLLAPSED_WIDTH = 96;
  const EXPANDED_WIDTH = 240;

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Workspaces", href: "/workspaces", icon: Folder },
    { title: "My Tasks", href: "/my-tasks", icon: CheckSquare },
    { title: "Members", href: "/members", icon: Users },
    { title: "Archived", href: "/archived", icon: CheckCircle2 },
    {
      title: "Settings",
      href: currentWorkspace
        ? `/workspaces/${currentWorkspace._id}/settings`
        : "#",
      icon: UserCog,
    },
  ];

  const handleToggle = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const isSidebarCollapsed = isCollapsed || isMobile;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative flex flex-col h-screen border-r bg-sidebar transition-all duration-300",
          "md:relative"
        )}
        style={{
          width: isMobile
            ? COLLAPSED_WIDTH
            : isCollapsed
              ? COLLAPSED_WIDTH
              : EXPANDED_WIDTH,
        }}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-14 border-b px-4 transition-all",
            isSidebarCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FolderTreeIcon className="w-5 h-5 text-white" />
            </div>{" "}
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold text-slate-800  from-blue-600 to-purple-600 bg-clip-text">
                TaskHive
              </span>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-2">
          <SidebarNav
            items={navItems}
            isCollapsed={isSidebarCollapsed}
            className={cn(isSidebarCollapsed && "items-center space-y-2")}
            currentWorkspace={currentWorkspace}
          />
        </ScrollArea>

        {/* Logout */}
        <div className="p-3 border-t">
          {isSidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-white">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="size-4" />
              <span className="ml-3">Logout</span>
            </Button>
          )}
        </div>

        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute top-4 -right-3 z-50 cursor-pointer p-1 rounded-full shadow-sm hover:shadow-md transition-all bg-background border"
                onClick={handleToggle}
              >
                {isCollapsed ? (
                  <ChevronsRight className="size-5 text-gray-500 hover:text-gray-700 transition-colors" />
                ) : (
                  <ChevronsLeft className="size-5 text-gray-500 hover:text-gray-700 transition-colors" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white">
              <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
