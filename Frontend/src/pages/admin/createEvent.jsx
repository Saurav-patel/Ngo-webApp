import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { eventService } from "../../service/eventService.js"

const CreateEvent = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("startDate", data.date)
      formData.append("location", data.location)

      // 🔒 FIELD NAME MUST MATCH MULTER: "photos"
      Array.from(data.photos).forEach(file => {
        formData.append("photos", file)
      })

      await eventService.createEvent(formData)
      navigate("/admin/events")
    } catch (error) {
      console.error("Failed to create event", error)
      alert(error?.response?.data?.message || "Failed to create event")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-200">
      <h1 className="text-2xl font-semibold mb-6">Create Event</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 bg-gray-900 border border-gray-800 rounded-2xl p-8"
      >
        {/* GRID SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TITLE */}
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-sm mb-1">Location</label>
            <input
              type="text"
              {...register("location", {
                required: "Location is required"
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
            />
            {errors.location && (
              <p className="text-red-400 text-xs mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm mb-1">Event Date</label>
            <input
              type="date"
              {...register("date", {
                required: "Event date is required"
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
            />
            {errors.date && (
              <p className="text-red-400 text-xs mt-1">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* PHOTOS */}
          <div>
            <label className="block text-sm mb-1">
              Event Photos <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png"
              {...register("photos", {
                required: "At least one event photo is required"
              })}
              className="text-sm"
            />
            {errors.photos && (
              <p className="text-red-400 text-xs mt-1">
                {errors.photos.message}
              </p>
            )}
          </div>
        </div>

        {/* DESCRIPTION (FULL WIDTH) */}
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            rows={6}
            {...register("description", {
              required: "Description is required"
            })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateEvent
