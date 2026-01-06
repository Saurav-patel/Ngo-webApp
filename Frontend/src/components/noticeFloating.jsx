import { useEffect, useState } from "react"
import { noticeService } from "../service/noticeService.js"

const NoticeFloating = () => {
  const [notices, setNotices] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchNotices = async () => {
      try {
        const data = await noticeService.getAllNotices()
        if (cancelled || !Array.isArray(data)) return

        // 🔹 simple & safe: latest first only
        const latestFirst = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        setNotices(latestFirst)
      } catch (err) {
        console.error("Failed to fetch notices:", err)
      }
    }

    fetchNotices()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="fixed right-6 bottom-10 z-[999999]">
      {/* 🔔 Bell Icon */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-14 h-14 rounded-full bg-yellow-400 text-gray-900 shadow-lg flex items-center justify-center hover:bg-yellow-300 transition"
        title="Notices"
      >
        🔔
      </button>

      {/* 📦 Notice Box */}
      {open && (
        <div className="absolute bottom-16 right-0 w-96 max-h-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <p className="text-base font-semibold text-gray-800">
              Notices
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          </div>

          {/* Notice List */}
          <div className="max-h-80 overflow-y-auto">
            {notices.map(n => (
              <div
                key={n._id}
                className="px-5 py-4 text-sm border-b last:border-b-0"
              >
                <p className="font-medium text-gray-900">
                  {n.title}
                </p>

                {n.body && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {n.body}
                  </p>
                )}
              </div>
            ))}

            {notices.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-500">
                No notices available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NoticeFloating
