import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { adminService } from "../../service/adminService.js"

const SingleUserDetails = () => {
  const { userId } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await adminService.getSingleUser(userId)
        setUser(res.user)
        console.log("User details:", res)
        setStats(res.stats)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      "This action is irreversible. Do you really want to delete this user?"
    )
    if (!confirmDelete) return

    try {
      setDeleting(true)
      await adminService.deleteUser(userId)
      navigate("/admin/users")
    } catch (err) {
      console.error(err)
      alert("Failed to delete user")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading user details...</div>
  }

  if (!user) {
    return <div className="p-6 text-red-400">User not found</div>
  }

  return (
    <div className="p-6 space-y-6 text-gray-200">
      
      {/* HEADER */}
      <div className="flex items-center gap-5 bg-gray-900 rounded-xl p-6">
        <img
          src={user.profile_pic_url?.url || "/avatar.png"}
          alt="profile"
          className="w-20 h-20 rounded-full object-cover border border-gray-700"
        />

        <div className="flex-1">
          <h2 className="text-xl font-semibold">{user.username}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="mt-2 flex gap-3">
            <span className="px-3 py-1 text-xs rounded-full bg-gray-800">
              Role: {user.role}
            </span>
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                user.isActive ? "bg-green-700" : "bg-red-700"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* DELETE */}
        <button
          onClick={handleDeleteUser}
          disabled={deleting}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete User"}
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() =>
            navigate(`/admin/participations?userId=${user._id}`)
          }
          className="cursor-pointer bg-gray-900 p-5 rounded-xl hover:bg-gray-800 transition"
        >
          <p className="text-sm text-gray-400">Participations</p>
          <h3 className="text-3xl font-bold">
            {stats?.participationsCount ?? 0}
          </h3>
        </div>

        <div
          onClick={() =>
            navigate(`/admin/certificates?userId=${user._id}`)
          }
          className="cursor-pointer bg-gray-900 p-5 rounded-xl hover:bg-gray-800 transition"
        >
          <p className="text-sm text-gray-400">Certificates</p>
          <h3 className="text-3xl font-bold">
            {stats?.certificatesCount ?? 0}
          </h3>
        </div>
      </div>

      {/* USER DETAILS */}
      <div className="bg-gray-900 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Detail label="Father Name" value={user.fatherName} />
        <Detail label="Phone" value={user.phone} />
        <Detail label="DOB" value={new Date(user.dob).toDateString()} />
        <Detail label="City" value={user.city} />
        <Detail label="Address" value={user.address} />
        <Detail label="Aadhaar" value={user.aadhaarNumber} />
        <Detail label="Created At" value={new Date(user.createdAt).toLocaleString()} />
      </div>
    </div>
  )
}

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-400">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
)

export default SingleUserDetails
