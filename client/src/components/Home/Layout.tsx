import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/accounts", label: "Social Accounts" },
  { to: "/schedule", label: "Post Scheduler" },
  { to: "/ai-composer", label: "AI Composer" },
];

// Inline Sidebar fallback to avoid module resolution errors for "./Sidebar"
const Sidebar: React.FC<{
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  return (
    <aside
      className={`fixed z-30 top-0 left-0 h-full w-64 transform bg-white border-r transition-transform md:relative md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex h-16 items-center px-4 font-semibold">Social Scheduler</div>
      <nav className="p-4">
        <ul className="space-y-2 text-sm">
          {sidebarLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `block rounded-2xl px-3 py-2 ${isActive ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-100"}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {/* Close button for mobile */}
      <button
        className="absolute right-2 top-2 md:hidden"
        onClick={() => setIsOpen(false)}
        aria-label="Close sidebar"
      >
        ✕
      </button>
    </aside>
  );
};

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/accounts": "Social Accounts",
  "/schedule": "Post Scheduler",
  "/ai-composer": "AI Composer",
};

const Layout = () => {
  const location = useLocation();

  const title =
    pageTitles[location.pathname] || "Social Scheduler";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <h1 className="text-xl font-semibold text-slate-800">
              {title}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 xl:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;