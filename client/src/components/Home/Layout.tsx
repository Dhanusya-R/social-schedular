import React from "react";
import { Outlet } from "react-router-dom";
// Local fallback Sidebar component to avoid missing module error
type SidebarProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 bg-gray-100 z-30 transform transition-transform md:relative md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="p-4">
        <button
          className="mb-4 px-2 py-1 bg-blue-500 text-white rounded md:hidden"
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
        <nav>
          <ul>
            <li className="py-2">Home</li>
            <li className="py-2">Profile</li>
            <li className="py-2">Settings</li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1">
        {/* Top Bar */}
        <header></header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 xl:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;