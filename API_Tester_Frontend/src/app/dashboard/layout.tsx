"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSessionUser, getSessionUser, useSessionUser } from "@/lib/auth-session";

const navItems = [
  { label: "Home", href: "/dashboard", icon: "HM" },
  { label: "Collections", href: "/dashboard/collections", icon: "CL" },
  { label: "History", href: "/dashboard/history", icon: "HS" },
  { label: "Environments", href: "/dashboard/environments", icon: "EN" },
  { label: "Workspaces", href: "/dashboard/workspaces", icon: "WS" },
  { label: "Settings", href: "/dashboard/settings", icon: "ST" },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sessionUser = useSessionUser();
  const username = sessionUser?.name ?? "user";

  useEffect(() => {
    const existingSession = getSessionUser();
    if (!sessionUser && !existingSession) {
      router.replace("/login");
    }
  }, [router, sessionUser]);

  const handleLogout = () => {
    clearSessionUser();
    router.push("/login");
  };

  return (
    <div className={`dashboard-shell ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`dashboard-sidebar ${isCollapsed ? "is-collapsed" : ""}`}>
        <button
          type="button"
          className="menu-toggle"
          aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          <span className="menu-toggle-icon" aria-hidden="true" />
          {!isCollapsed && <span className="menu-toggle-text">Menu</span>}
        </button>

        <div className="dashboard-brand">
          <span className="brand-mark">AT</span>
          <div className={`dashboard-brand-copy ${isCollapsed ? "is-hidden" : ""}`}>
            <p className="dashboard-brand-title">API Tester</p>
            <p className="dashboard-brand-subtitle">Dashboard</p>
          </div>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard sections">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`dashboard-nav-link ${pathname === item.href ? "is-active" : ""}`}
            >
              <span className="dashboard-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className={`dashboard-nav-text ${isCollapsed ? "is-hidden" : ""}`}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className={`sidebar-username ${isCollapsed ? "is-hidden" : ""}`}>{username}</p>
          <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
            <span className="sidebar-logout-icon" aria-hidden="true">
              LG
            </span>
            <span className={`sidebar-logout-text ${isCollapsed ? "is-hidden" : ""}`}>Logout</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-content">{children}</section>
    </div>
  );
}
