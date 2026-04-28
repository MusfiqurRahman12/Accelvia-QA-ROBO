"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Eye,
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/compare", label: "New Comparison", icon: PlusCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Eye size={20} />
            </div>
            {!collapsed && <span className="sidebar-logo-text">QA ROBO</span>}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft size={16} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-link"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`dashboard-main ${collapsed ? "expanded" : ""}`}>
        <div className="mobile-header">
          <button className="btn btn-ghost" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 700 }}>QA ROBO</span>
        </div>
        <div className="dashboard-content">{children}</div>
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
          transition: width var(--transition-base);
        }
        .sidebar.collapsed { width: 72px; }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px;
          border-bottom: 1px solid var(--border-primary);
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-primary);
        }
        .sidebar-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .sidebar-logo-text {
          font-size: 18px;
          font-weight: 800;
          white-space: nowrap;
        }
        .sidebar-toggle {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition-fast);
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }
        .sidebar-link:hover {
          background: rgba(99, 102, 241, 0.08);
          color: var(--text-primary);
        }
        .sidebar-link.active {
          background: rgba(99, 102, 241, 0.12);
          color: var(--accent-primary-hover);
        }
        .sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid var(--border-primary);
        }
        .dashboard-main {
          flex: 1;
          margin-left: 260px;
          transition: margin-left var(--transition-base);
        }
        .dashboard-main.expanded { margin-left: 72px; }
        .dashboard-content {
          padding: 32px;
          max-width: 1400px;
        }
        .mobile-header {
          display: none;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--border-primary);
        }
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: 260px !important;
          }
          .sidebar.mobile-open { transform: translateX(0); }
          .sidebar-toggle { display: none; }
          .dashboard-main { margin-left: 0 !important; }
          .mobile-header { display: flex; }
        }
      `}</style>
    </div>
  );
}
