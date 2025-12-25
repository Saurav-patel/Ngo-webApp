import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { noticeService } from "../../service/noticeService.js"

const Notices = () => {
  const navigate = useNavigate()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = await noticeService.getAllNotices()
        setNotices(data)
      } catch (err) {
        setError(err.message || "Failed to load notices")
      } finally {
        setLoading(false)
      }
    }

    loadNotices()
  }, [])

  if (loading) {
    return <div className="p-6 text-gray-400">Loading notices…</div>
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-100">
          Notices
        </h1>

        <button
          onClick={() => navigate("/admin/notices/create")}
          className="px-4 py-2 bg-blue-600 text-sm rounded hover:bg-blue-700"
        >
          + Add Notice
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Pinned</th>
              <th className="p-3 text-left">Expires On</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {notices.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  No notices found
                </td>
              </tr>
            )}

            {notices.map((n) => (
              <tr
                key={n._id}
                className="border-t border-gray-800 hover:bg-gray-800/40 transition"
              >
                <td className="p-3 font-medium">
                  {n.title}
                </td>

                <td className="p-3">
                  {n.category}
                </td>

                <td className="p-3">
                  {n.isPinned ? (
                    <span className="text-yellow-400">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </td>

                <td className="p-3">
                  {n.expiresAt
                    ? new Date(n.expiresAt).toLocaleDateString()
                    : "—"}
                </td>

                <td className="p-3">
                  {new Date(n.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3">
                  <button
                    onClick={() =>
                      navigate(`/admin/notices/${n._id}`)
                    }
                    className="text-blue-400 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Notices
