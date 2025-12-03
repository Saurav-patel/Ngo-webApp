// src/components/layout/Navbar.jsx
import { useState } from "react";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="w-full shadow-md sticky top-0 z-50">
      {/* TOP INFO BAR */}
      <div className="w-full bg-emerald-700 text-[11px] text-emerald-50">
        <div className="w-full px-6 lg:px-12 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>📞 +919876543210</span>
            <span>✉️ Brightfuturefoundation.ngo@gmail.com</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="hover:underline">Login</button>
            <button className="hover:underline">Register</button>
          </div>
        </div>
      </div>

      {/* MAIN NAV BAR */}
      <nav className="w-full bg-emerald-800 text-white">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between py-3">
            {/* LOGO */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="NGO Logo"
                className="w-14 h-14 object-cover rounded-full bg-white p-1 shadow-lg"
              />
              <p className="text-xl font-bold tracking-wide leading-tight">
                <span className="text-white">Bright Future</span>
                <span className="text-yellow-400"> Foundation</span>
              </p>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-10">
              <ul className="flex items-center gap-6 text-sm font-medium uppercase tracking-wide">
                <NavItem label="Home" active />
                <NavItem label="Events" />
                <NavItem label="About" />
                <NavItem label="Contact" />
              </ul>

              <button className="px-6 py-2 rounded-full bg-yellow-400 text-gray-900 font-semibold text-sm hover:bg-yellow-300 transition">
                Donate
              </button>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-emerald-600"
              onClick={() => setIsMobileOpen((prev) => !prev)}
            >
              <div className="space-y-1">
                <span className="block w-5 h-[2px] bg-white"></span>
                <span className="block w-5 h-[2px] bg-white"></span>
                <span className="block w-5 h-[2px] bg-white"></span>
              </div>
            </button>
          </div>

          {/* MOBILE MENU */}
          {isMobileOpen && (
            <div className="md:hidden pb-4 border-t border-emerald-700">
              <ul className="flex flex-col gap-3 pt-4 text-sm">
                <MobileNavItem label="Home" active />
                <MobileNavItem label="Events" />
                <MobileNavItem label="About" />
                <MobileNavItem label="Contact" />
              </ul>

              <button className="mt-3 w-full px-5 py-2 rounded-full bg-yellow-400 text-gray-900 font-semibold text-sm hover:bg-yellow-300 transition">
                Donate
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

const NavItem = ({ label, active }) => (
  <li className="relative cursor-pointer">
    <span className="hover:text-yellow-300 transition">{label}</span>
    {active && (
      <span className="absolute -bottom-1 left-0 w-6 h-[3px] bg-yellow-400 rounded-full"></span>
    )}
  </li>
);

const MobileNavItem = ({ label, active }) => (
  <li className={`px-1 ${active ? "text-yellow-300 font-semibold" : ""}`}>
    {label}
  </li>
);

export default Navbar;
