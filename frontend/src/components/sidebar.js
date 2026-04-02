"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiHome, FiBox, FiAlertTriangle, FiLogOut, FiMenu, FiShoppingCart, FiList, FiCreditCard, FiUsers, FiBarChart2 } from "react-icons/fi";
import { useUser } from "@/hooks/useUser";
import RoleBadge from "./RoleBadge";

// Base links available to all authenticated users
const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
  { href: "/products", label: "Products", icon: <FiBox size={18} /> },
  { href: "/dashboard/sales", label: "New Sale", icon: <FiShoppingCart size={18} /> },
  { href: "/dashboard/sales/history", label: "Sales History", icon: <FiList size={18} /> },
  { href: "/dashboard/customers", label: "Customers", icon: <FiUsers size={18} /> },
];

// Links only for staff
const staffOnlyLinks = [
  { href: "/products/low-stock", label: "Low Stock", icon: <FiAlertTriangle size={18} /> },
];

// Links only for admin
const adminOnlyLinks = [
  { href: "/dashboard/analytics", label: "Analytics", icon: <FiBarChart2 size={18} /> },
  { href: "/products/low-stock", label: "Low Stock", icon: <FiAlertTriangle size={18} /> },
  { href: "/dashboard/credit", label: "Credit", icon: <FiCreditCard size={18} /> },
  { href: "/dashboard/users/create-staff", label: "Create Staff", icon: <FiUsers size={18} /> },
];

export default function Sidebar() {
  const { user, isAdmin, isStaff } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const resize = () => setCollapsed(window.innerWidth < 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Build navigation links based on role
  let navLinks = [...baseLinks];
  if (isAdmin) {
    navLinks = [...baseLinks, ...adminOnlyLinks];
  } else if (isStaff) {
    navLinks = [...baseLinks, ...staffOnlyLinks];
  }

  return (
    <aside className={`h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-200 ${collapsed ? "w-16" : "w-64"}`}>

      {/* Header with Logo and User Info */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          {!collapsed && (
            <h1 className="font-bold text-lg text-gray-900">
              BizManager
            </h1>
          )}
          <button
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FiMenu size={20} />
          </button>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Logged in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <div className="mt-2">
              <RoleBadge role={user.role} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">

        {navLinks.map((link) => {
          // Only mark as active if pathname exactly matches link.href,
          // except for /products (should not match /products/low-stock)
          let active = pathname === link.href;
          // Special case: /products (but not /products/low-stock)
          if (link.href === "/products" && pathname.startsWith("/products") && pathname !== "/products/low-stock") {
            active = pathname === "/products";
          }
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-sm transition cursor-pointer
                ${active
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                  }
                ${collapsed && "justify-center"}
                `}
              >
                {link.icon}
                {!collapsed && <span>{link.label}</span>}
              </div>
            </Link>
          );
        })}

      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200">

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <FiLogOut size={18} />
          {!collapsed && "Logout"}
        </button>

      </div>

    </aside>
  );
}