import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAuthUser } from "../store/slices/authSlice.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  return diff;
}

const DashboardPage = () => {
  const user = useSelector(selectAuthUser);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse p-6 w-full max-w-4xl">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-36 bg-gray-200 rounded" />
            <div className="h-36 bg-gray-200 rounded col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  const avatar = user?.profile_pic_url?.url || null;
  const validity = user?.validity || null;
  const days = daysUntil(validity);
  const validityStatus =
    validity === null ? "No membership" : days < 0 ? "Expired" : days <= 14 ? `Expires in ${days} days` : "Active";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user?.username}</h1>
          <p className="text-sm text-gray-500">Member dashboard — manage your profile and activity</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="px-4 py-2 bg-white border rounded-lg shadow-sm text-sm hover:bg-gray-50"
          >
            Edit profile
          </button>

          <button
            onClick={() => {
              // quick action: go to events
              navigate("/dashboard/events");
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm shadow hover:bg-indigo-700"
          >
            My events
          </button>
        </div>
      </div>

      {/* Top cards: profile + membership */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="col-span-1 bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img src={avatar} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold">{user?.username}</h2>
              <p className="text-sm text-gray-500">{user?.designation || "—"}</p>
              <p className="text-sm text-gray-500 mt-2">{user?.email}</p>
              <p className="text-sm text-gray-500">{user?.phone || "—"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div>
              <span className="text-xs text-gray-400">Role</span>
              <div className="font-medium capitalize">{user?.role || "visitor"}</div>
            </div>

            <div>
              <span className="text-xs text-gray-400">City</span>
              <div className="font-medium">{user?.city || "—"}</div>
            </div>

            <div>
              <span className="text-xs text-gray-400">Joined</span>
              <div className="font-medium">{formatDate(user?.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Membership & register number */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400">Membership</p>
                <h3 className="text-lg font-semibold mt-1">{user?.registerNumber || "Not assigned"}</h3>
                <p className={`mt-2 text-sm ${validity === null ? "text-gray-500" : days < 0 ? "text-red-600" : days <= 14 ? "text-yellow-600" : "text-green-600"}`}>
                  {validity === null ? "No membership assigned" : validityStatus}
                </p>
              </div>

              <div className="text-right">
                <button
                  onClick={() => {
                    if (user?.registerNumber) {
                      navigator.clipboard?.writeText(user.registerNumber);
                      // safe: no toast here, but you can add toast if you use react-hot-toast
                    }
                  }}
                  className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm"
                >
                  Copy ID
                </button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <div><span className="font-medium">Validity:</span> {validity ? formatDate(validity) : "—"}</div>
            </div>
          </div>

          {/* Quick stats (placeholders — wire to services later) */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Quick stats</p>
                <h4 className="text-2xl font-semibold mt-1">—</h4>
              </div>
              <div className="text-sm text-gray-500">
                <div>Events: <span className="font-medium">—</span></div>
                <div>Certificates: <span className="font-medium">—</span></div>
                <div>Documents: <span className="font-medium">—</span></div>
              </div>
            </div>

            <div className="mt-4">
              <button onClick={() => navigate("/dashboard/events")} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                View events
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional info area (future widgets) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-2">Recent activity</h3>
          <p className="text-sm text-gray-500">No recent activity to show. Once you participate in events or receive certificates they will appear here.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-2">Important docs</h3>
          <p className="text-sm text-gray-500">Your uploaded documents and ID cards will appear here. Upload via the Documents page.</p>
        </div>
      </section>
    </div>
  )
}
export default DashboardPage