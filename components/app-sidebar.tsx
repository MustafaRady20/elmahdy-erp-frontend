"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Home,
  Inbox,
  Settings,
  Briefcase,
  FileText,
  Clock,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

const menuByRole: Record<string, any[]> = {
  manager: [
    { title: "الرئيسية", url: "/dashboard", icon: Home },
    { title: "الموظفين", url: "/employees", icon: Inbox },
    { title: "الحضور", url: "/attendance", icon: Clock },
    { title: "الإيرادات", url: "/revenues", icon: Calendar },
    {
      title: "الكافتريات",
      url: "/cafes",
      icon: Calendar,
    },
    {
      title: "VIP",
      icon: Inbox,
      children: [{ title: "الايرادات", url: "/vip-revenue" },{ title: "الحجوزات", url: "/reservation" }],
    },
    { title: "لوائح وقوانين الشركة", url: "/rules", icon: FileText },
    { title: "الرواتب الشهرية", url: "/salaries", icon: FileText },

    {
      title: "الإعدادات",
      icon: Settings,
      children: [
        { title: "الانشطة", url: "/settings/activities" },
        { title: "الفروع", url: "/settings/branches" },
        { title: "الاصناف", url: "/settings/categories" },
      ],
    },
  ],

  employee: [
    { title: "الحضور", url: "/attendance", icon: Clock },
    { title: "لوائح وقوانين الشركة", url: "/rules", icon: FileText },
  ],

  supervisor: [
    { title: "الحضور", url: "/attendance", icon: Clock },
    { title: "لوائح وقوانين الشركة", url: "/rules", icon: FileText },
  ],
};

export function AppSidebar() {
  const [role, setRole] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const u = Cookies.get("user");
    if (u) {
      try {
        const user = JSON.parse(u);
        setRole(user.role);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  if (role === null) return null;

  const items = menuByRole[role] || [];

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <Sidebar side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="h-[55px] border-b-2 flex justify-center items-center"></div>

              <div className="p-5">
                {items.map((item) => {
                  const hasChildren = !!item.children;

                  if (!hasChildren) {
                    return (
                      <SidebarMenuItem
                        key={item.title}
                        className="hover:scale-105 pb-3"
                      >
                        <Link href={item.url} className="group flex gap-2">
                          <item.icon className="h-5 w-5 group-hover:scale-110" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuItem>
                    );
                  }

                  // -------- MENU WITH CHILDREN --------
                  return (
                    <div key={item.title} className="mb-3">
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className="flex w-full items-center justify-between px-1 py-2 hover:text-blue-500"
                      >
                        <div className="flex gap-2">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>

                        {openMenu === item.title ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </button>

                      {/* CHILDREN DROPDOWN */}
                      <AnimatePresence>
                        {openMenu === item.title && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ms-6 border-r-2 pr-3 mt-2"
                          >
                            {item.children.map((child: any) => (
                              <SidebarMenuItem
                                key={child.title}
                                className="pb-2 mt-1 hover:text-blue-400"
                              >
                                <Link href={child.url}>{child.title}</Link>
                              </SidebarMenuItem>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
