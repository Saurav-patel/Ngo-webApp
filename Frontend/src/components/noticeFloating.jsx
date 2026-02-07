import { useEffect, useRef, useState } from "react"
import { noticeService } from "../service/noticeService.js"

const NoticeFloating = () => {
  const [notices, setNotices] = useState([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const fetchNotices = async () => {
      try {
        const data = await noticeService.getAllNotices()
        if (cancelled || !Array.isArray(data)) return

        setNotices(
          [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        )
      } catch (err) {
        console.error("Failed to fetch notices:", err)
      }
    }

    fetchNotices()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const handleOutside = e => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("touchstart", handleOutside)

    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("touchstart", handleOutside)
    }
  }, [open])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* 🔔 Bell stays in corner */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-14 h-14 rounded-full bg-yellow-400 text-gray-900 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition"
        title="Notices"
      >
        🔔
      </button>

      {/* 📦 Notice box */}
      {open && (
        <div
          ref={boxRef}
          className="
            fixed bottom-24
            left-1/2 -translate-x-1/2
            sm:left-auto sm:translate-x-0 sm:right-6
            w-[calc(100vw-2rem)]
            max-w-sm
            max-h-[70vh]
            bg-white
            rounded-2xl
            shadow-2xl
            border border-gray-200
            overflow-hidden
            animate-in fade-in slide-in-from-bottom-2 duration-200
          "
        >
          <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
            <p className="text-base font-semibold text-gray-800">
              Notices
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notices.length > 0 ? (
              notices.map(n => (
                <div
                  key={n._id}
                  className="px-5 py-4 border-b last:border-b-0 hover:bg-gray-50 transition"
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
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-gray-500 text-center">
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
