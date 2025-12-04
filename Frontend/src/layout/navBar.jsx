// src/components/layout/Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

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
            <Link to="/auth/login" className="hover:underline">
              Login
            </Link>
            <Link to="/auth/register" className="hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN NAV BAR */}
      <nav className="w-full bg-emerald-800 text-white">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between py-3">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="NGO Logo"
                className="w-14 h-14 object-cover rounded-full bg-white p-1 shadow-lg"
              />
              <p className="text-xl font-bold tracking-wide leading-tight">
                <span className="text-white">Bright Future</span>
                <span className="text-yellow-400"> Foundation</span>
              </p>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-10">
              <ul className="flex items-center gap-6 text-sm font-medium uppercase tracking-wide">
                <NavItem label="Home" to="/" active={path === "/"} />
                <NavItem
                  label="Events"
                  to="/events"
                  active={path.startsWith("/events")}
                />
                <NavItem
                  label="About"
                  to="/about"
                  active={path.startsWith("/about")}
                />
                <NavItem
                  label="Contact"
                  to="/contact"
                  active={path.startsWith("/contact")}
                />
              </ul>

              <button className="px-6 py-2 rounded-full bg-yellow-400 text-gray-900 font-semibold text-sm hover:bg-yellow-300 transition">
                Donate
              </button>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-emerald-600"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-nav"
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
            <div
              id="mobile-nav"
              className="md:hidden pb-4 border-t border-emerald-700"
            >
              <ul className="flex flex-col gap-3 pt-4 text-sm">
                <MobileNavItem
                  label="Home"
                  to="/"
                  active={path === "/"}
                  onClick={() => setIsMobileOpen(false)}
                />
                <MobileNavItem
                  label="Events"
                  to="/events"
                  active={path.startsWith("/events")}
                  onClick={() => setIsMobileOpen(false)}
                />
                <MobileNavItem
                  label="About"
                  to="/about"
                  active={path.startsWith("/about")}
                  onClick={() => setIsMobileOpen(false)}
                />
                <MobileNavItem
                  label="Contact"
                  to="/contact"
                  active={path.startsWith("/contact")}
                  onClick={() => setIsMobileOpen(false)}
                />
              </ul>

              <button className="mt-3 w-full px-5 py-2 rounded-full bg-yellow-400 text-gray-900 font-semibold text-sm hover:bg-yellow-300 transition">
                Donate
              </button>

              <div className="mt-3 flex justify-between text-xs px-1">
                <Link
                  to="/auth/login"
                  className="hover:underline"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="hover:underline"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

const NavItem = ({ label, to, active }) => (
  <li className="relative cursor-pointer">
    <Link
      to={to}
      className={`hover:text-yellow-300 transition ${
        active ? "text-yellow-300" : ""
      }`}
    >
      {label}
    </Link>
    {active && (
      <span className="absolute -bottom-1 left-0 w-6 h-[3px] bg-yellow-400 rounded-full" />
    )}
  </li>
);

const MobileNavItem = ({ label, to, active, onClick }) => (
  <li className={`px-1 ${active ? "text-yellow-300 font-semibold" : ""}`}>
    <Link to={to} onClick={onClick}>
      {label}
    </Link>
  </li>
);

export default Navbar;
