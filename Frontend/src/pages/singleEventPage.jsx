// src/pages/singleEventPage.jsx
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { eventService } from "../service/eventService.js"

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

const EventDetailPage = () => {
  const { eventId } = useParams()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await eventService.getEventDetails(eventId)
        if (!cancelled) setEvent(data)
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load event")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (eventId) fetchEvent()

    return () => {
      cancelled = true
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-300">
        <div className="space-y-3 text-center">
          <div className="h-4 w-32 bg-gray-800 rounded-full mx-auto animate-pulse" />
          <div className="h-4 w-52 bg-gray-800 rounded-full mx-auto animate-pulse" />
          <div className="h-48 w-72 bg-gray-900 rounded-3xl mx-auto animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="max-w-sm w-full bg-gray-900/90 border border-red-500/50 rounded-2xl p-5 text-center text-sm text-red-200">
          <p className="mb-3">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[11px] text-gray-200 hover:text-emerald-300"
          >
            <span>←</span>
            Back to events
          </Link>
        </div>
      </div>
    )
  }

  if (!event) return null

  const photos = Array.isArray(event.photos) ? event.photos : []

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ✅ same container spacing as EventShowcase */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-10 md:py-14 space-y-8 md:space-y-10">
        {/* Top: breadcrumb + back */}
        <div className="flex items-center justify-between gap-3 text-[11px] md:text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-gray-100 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="hover:text-gray-100 transition-colors">
              Events
            </span>
            <span>/</span>
            <span className="text-gray-300 truncate max-w-[160px] md:max-w-[260px]">
              {event.title || "Event"}
            </span>
          </div>

          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1.5 text-gray-300 hover:text-emerald-300"
          >
            <span className="text-xs">←</span>
            Back to home page
          </Link>
        </div>

        {/* Title + meta – matches premium feel */}
        <header className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400">
            Field Report
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
            {event.title || "Untitled Event"}
          </h1>
          {(event.startDate || event.location) && (
            <p className="text-xs md:text-sm text-gray-300">
              {event.startDate && formatDate(event.startDate)}
              {event.startDate && event.location && " • "}
              {event.location}
            </p>
          )}
        </header>

        {/* GALLERY – same side spacing, consistent gaps */}
        {photos.length > 0 && (
          <section
            className="
              rounded-3xl border border-gray-800/80
              bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90
              p-3 md:p-4 lg:p-5
              shadow-[0_18px_45px_rgba(0,0,0,0.8)]
            "
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] md:text-xs text-gray-400">
                Event photo gallery
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-200 border border-gray-700/70">
                {photos.length} photo{photos.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {photos.map((photo, idx) => (
                <div
                  key={photo._id || idx}
                  className="
                    relative group overflow-hidden rounded-2xl
                    bg-black/40 border border-gray-800/90
                    hover:border-emerald-400/60 transition-colors
                  "
                >
                  <img
                    src={photo.url}
                    alt={`${event.title || "Event photo"} - ${idx + 1}`}
                    className="
                      w-full h-52 md:h-56 lg:h-60 object-cover
                      transition-transform duration-500
                      group-hover:scale-[1.03]
                    "
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-gray-100 border border-white/15">
                    Photo {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main content + side card – consistent gaps & padding */}
        <section className="grid md:grid-cols-[2.1fr,1fr] gap-5 md:gap-7 lg:gap-8 items-start">
          {/* LEFT: description card */}
          <div
            className="
              rounded-3xl
              bg-gradient-to-b from-gray-900/95 via-gray-900/85 to-gray-950
              border border-gray-800
              p-4 md:p-5 lg:p-6
              space-y-5 md:space-y-6
              shadow-[0_16px_45px_rgba(0,0,0,0.85)]
            "
          >
            <div className="space-y-2">
              <h2 className="text-base md:text-lg font-semibold text-gray-50">
                About this event
              </h2>
              <p className="text-sm md:text-[15px] leading-relaxed text-gray-200 whitespace-pre-line">
                {event.description ||
                  "Details about this event will be available soon."}
              </p>
            </div>

          

            {Array.isArray(event.highlights) && event.highlights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-semibold text-gray-50">
                  Highlights from the field
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-200">
                  {event.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT: info card */}
          <aside className="space-y-4 md:space-y-5">
            <div
              className="
                rounded-3xl
                bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-950
                border border-gray-800
                p-4 md:p-5
                space-y-3
                shadow-[0_14px_40px_rgba(0,0,0,0.9)]
              "
            >
              <h3 className="text-sm font-semibold text-gray-50 mb-1">
                Event details
              </h3>

              <div className="space-y-2 text-[11px] md:text-xs text-gray-200">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Starts</span>
                  <span className="font-medium">
                    {formatDate(event.startDate) || "Not specified"}
                  </span>
                </div>

               

                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Location</span>
                  <span className="font-medium text-right">
                    {event.location || "To be announced"}
                  </span>
                </div>

                
              </div>

              <button
                type="button"
                className="
                  mt-4 w-full inline-flex items-center justify-center gap-2
                  rounded-2xl bg-emerald-500/90 text-gray-950 text-xs font-semibold
                  py-2.5
                  hover:bg-emerald-400 transition
                  shadow-[0_12px_30px_rgba(16,185,129,0.6)]
                "
              >
                Finished
              </button>
            </div>

            <Link
              to="/"
              className="
                inline-flex md:hidden items-center gap-1.5 text-[11px]
                text-gray-300 hover:text-emerald-300
              "
            >
              <span className="text-xs">←</span>
              Back to all events
            </Link>
          </aside>
        </section>
      </div>
    </div>
  )
}

export default EventDetailPage
