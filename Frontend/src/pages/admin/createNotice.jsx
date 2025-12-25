import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { noticeService } from "../../service/noticeService.js"

const CreateNotice = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "General",
    isPinned: false,
    expiresAt: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required")
      return
    }

    try {
      setLoading(true)

      await noticeService.addNotice({
        title: form.title,
        body: form.body,
        category: form.category,
        isPinned: form.isPinned,
        expiresAt: form.expiresAt || undefined,
      })

      navigate("/admin/notices")
    } catch (err) {
      setError(err.message || "Failed to add notice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:underline"
        >
          ← Back to Notices
        </button>

        <h1 className="text-xl font-semibold text-gray-100 mt-2">
          Add New Notice
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-5"
      >
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
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 outline-none"
            placeholder="Enter notice title"
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
            rows={5}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 outline-none resize-none"
            placeholder="Enter notice content"
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
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
          >
            <option value="General">General</option>
            <option value="Event">Event</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Expiry Date (optional)
          </label>
          <input
            type="date"
            name="expiresAt"
            value={form.expiresAt}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
          />
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

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Add Notice"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateNotice
