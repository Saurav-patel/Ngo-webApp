import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAuthUser, logOut } from "../store/slices/authSlice.js";

const DashboardLayout = () => {
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "My Events", to: "/dashboard/events" },
    { label: "Certificates", to: "/dashboard/certificates" },
    { label: "Membership", to: "/dashboard/membership" },
    { label: "Documents", to: "/dashboard/documents" },
    { label: "Settings", to: "/dashboard/settings" },
  ];

  // Admin or staff roles (secretary, treasurer, president...)
  const adminRoles = ["admin", "secretary", "treasurer", "president", "vice president"];
  const isAdmin = adminRoles.includes(user?.role);

  if (isAdmin) {
    navItems.push({ label: "Admin Panel", to: "/admin" });
  }

  const handleLogout = () => dispatch(logOut());

  const avatar = user?.profile_pic_url?.url ||
    null; // fallback handled in UI

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* MOBILE TOP BAR */}
      <div className="w-full lg:hidden bg-white border-b">
        <div className="flex items-center justify-between p-3">
          {/* Left user info */}
          <div className="flex items-center gap-3">
            {avatar ? (
              <img src={avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
            >
              Logout
            </button>

            <button
              onClick={() => setOpen(v => !v)}
              className="p-2 rounded bg-gray-100"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2"
                  d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="bg-white border-t p-2 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded text-sm ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="w-full px-4 py-2 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100"
            >
              Logout
            </button>
          </nav>
        )}
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-72 bg-white shadow-lg p-6">
        <div className="mb-6">
          {avatar ? (
            <img src={avatar} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}

          <h3 className="mt-3 text-lg font-semibold">{user?.username}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>

          {user?.registerNumber && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="text-xs text-gray-400">Register Number:</span><br />
              {user.registerNumber}
            </p>
          )}
        </div>

        <nav className="space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg font-medium ${
                  isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full mt-6 px-4 py-2 text-left text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
        >
          Logout
        </button>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout
