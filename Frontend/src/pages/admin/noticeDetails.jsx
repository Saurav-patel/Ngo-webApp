import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { noticeService } from "../../service/noticeService.js"

const NoticeDetails = () => {
  const { noticeId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadNotice = async () => {
      try {
        const data = await noticeService.getNoticeById(noticeId)

        setForm({
          title: data.title,
          body: data.body,
          category: data.category,
          isPinned: data.isPinned,
          expiresAt: data.expiresAt
            ? data.expiresAt.slice(0, 10)
            : "",
          sentAt: data.sentAt,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
        })
      } catch (err) {
        setError(err.message || "Failed to load notice")
      } finally {
        setLoading(false)
      }
    }

    loadNotice()
  }, [noticeId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleUpdate = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required")
      return
    }

    try {
      setSaving(true)
      setError(null)

      await noticeService.editNotice(noticeId, {
        title: form.title,
        body: form.body,
        category: form.category,
        isPinned: form.isPinned,
        expiresAt: form.expiresAt || undefined,
      })

      navigate("/admin/notices")
    } catch (err) {
      setError(err.message || "Failed to update notice")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm(
      "Delete this notice? This action cannot be undone."
    )
    if (!ok) return

    try {
      await noticeService.deleteNotice(noticeId)
      navigate("/admin/notices")
    } catch (err) {
      alert(err.message || "Failed to delete notice")
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading notice…</div>
  }

  if (!form) {
    return <div className="p-6 text-red-400">Notice not found</div>
  }

  const isExpired =
    form.expiresAt && new Date(form.expiresAt) < new Date()

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:underline"
      >
        ← Back to Notices
      </button>

      <h1 className="text-xl font-semibold text-gray-100">
        Notice Details
      </h1>

      {/* Edit Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Body *
          </label>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
          >
            <option value="General">General</option>
            <option value="Event">Event</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiresAt"
            value={form.expiresAt}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
          />
          {isExpired && (
            <p className="text-xs text-red-400 mt-1">
              This notice has expired
            </p>
          )}
        </div>

        {/* Pin */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPinned"
            checked={form.isPinned}
            onChange={handleChange}
          />
          <span className="text-sm text-gray-300">
            Pin this notice
          </span>
        </div>

        {/* Meta */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            Sent At:{" "}
            {new Date(form.sentAt).toLocaleString()}
          </p>
          <p>
            Created At:{" "}
            {new Date(form.createdAt).toLocaleString()}
          </p>
          <p className="font-mono">
            Created By: {form.createdBy}
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Updating…" : "Update Notice"}
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 rounded text-sm hover:bg-red-700"
          >
            Delete Notice
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoticeDetails
