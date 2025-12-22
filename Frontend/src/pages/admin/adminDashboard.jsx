import { useNavigate } from "react-router-dom"

const StatCard = ({ title, value, subtitle, route }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => route && navigate(route)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5
                 cursor-pointer hover:border-gray-700
                 hover:bg-gray-800/40 transition"
    >
      <p className="text-sm text-gray-400">{title}</p>

      <h2 className="text-2xl font-semibold text-gray-100 mt-1">
        {value}
      </h2>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  )
}

const AdminDashboard = () => {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Overview of platform activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Users"
          value="1,248"
          subtitle="Including members & admins"
          route="/admin/users"
        />
        <StatCard
          title="Active Members"
          value="342"
          subtitle="Approved memberships"
          route="/admin/members"
        />
        <StatCard
          title="Events"
          value="26"
          subtitle="Past & upcoming events"
          route="/admin/events"
        />
        <StatCard
          title="Certificates Issued"
          value="914"
          subtitle="Across all events"
          route="/admin/certificates"
        />
        <StatCard
          title="Pending Certificates"
          value="17"
          subtitle="Require admin action"
          route="/admin/certificates?status=pending"
        />
        <StatCard
          title="New Contact Messages"
          value="9"
          subtitle="Last 7 days"
          route="/admin/contacts"
        />
      </div>

      {/* Divider */}
      <div className="my-10 border-t border-gray-800" />

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium mb-4">
          Recent Activity
        </h2>

        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          <div className="p-4 text-sm text-gray-300">
            Certificate uploaded for{" "}
            <span className="text-gray-100">Blood Donation Camp</span>
          </div>
          <div className="p-4 text-sm text-gray-300">
            New event created:{" "}
            <span className="text-gray-100">Women Skill Workshop</span>
          </div>
          <div className="p-4 text-sm text-gray-300">
            3 new contact messages received
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
