// src/components/events/EventShowcase.jsx
import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"

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

const EventShowcase = ({ events = [] }) => {
  // only events with photos, sorted latest first
  const eventsWithPhotos = useMemo(() => {
    return events
      .filter((e) => e?.photos && e.photos.length > 0)
      .sort(
        (a, b) =>
          new Date(b.startDate || 0).getTime() -
          new Date(a.startDate || 0).getTime()
      )
  }, [events])

  // active photo index per event
  const [photoIndices, setPhotoIndices] = useState({})
  // which cards have become visible (for scroll animation)
  const [visibleMap, setVisibleMap] = useState({})
  const cardRefs = useRef([])

  // scroll-in animation using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-event-id")
          if (entry.isIntersecting && id) {
            setVisibleMap((prev) => ({ ...prev, [id]: true }))
          }
        })
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -80px 0px"
      }
    )

    cardRefs.current.forEach((el) => el && observer.observe(el))

    return () => observer.disconnect()
  }, [eventsWithPhotos])

  const changePhoto = (eventId, total, direction) => {
    setPhotoIndices((prev) => {
      const current = prev[eventId] ?? 0
      let next = current

      if (direction === "next") {
        next = current + 1 < total ? current + 1 : 0
      } else {
        next = current - 1 >= 0 ? current - 1 : total - 1
      }

      return { ...prev, [eventId]: next }
    })
  }

  if (!eventsWithPhotos.length) return null

  return (
    <section className="w-full bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-10 md:py-14 space-y-6">
        {/* Section heading */}
        <header className="space-y-2 px-1 md:px-0">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">
            Recent Events
          </p>
          <h2 className="text-xl md:text-3xl font-bold">
            See how your support creates real impact.
          </h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-2xl">
            Every event tells a story of change — from skills training to hunger
            relief. Explore moments captured from the ground.
          </p>
        </header>

        {/* Event cards */}
        {eventsWithPhotos.map((event, idx) => {
          const photos = event.photos || []
          const currentIndex = photoIndices[event._id] ?? 0
          const currentPhoto = photos[currentIndex] || photos[0]
          const isVisible = visibleMap[event._id]

          return (
            <Link
              key={event._id}
              to={`/events/${event._id}`}
              data-event-id={event._id}
              ref={(el) => (cardRefs.current[idx] = el)}
              className={`
                block rounded-3xl focus:outline-none
                focus-visible:ring-2 focus-visible:ring-emerald-400/80
                focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950
                transform transition-all duration-[900ms] ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }
              `}
            >
              <article
                className={`
                  group cursor-pointer
                  bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-gray-900/40
                  rounded-3xl border border-gray-700/70 shadow-[0_18px_45px_rgba(0,0,0,0.65)]
                  overflow-hidden
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(0,0,0,0.75)]
                  hover:border-emerald-500/70
                `}
              >
                <div className="p-4 md:p-6 lg:p-7 space-y-5 md:space-y-6">
                  {/* Title + meta */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="text-lg md:text-2xl font-semibold tracking-tight">
                        {event.title || "Untitled Event"}
                      </h3>
                      {(event.startDate || event.location) && (
                        <p className="text-xs md:text-sm text-gray-300 mt-1">
                          {event.startDate && formatDate(event.startDate)}
                          {event.startDate && event.location && " • "}
                          {event.location}
                        </p>
                      )}
                    </div>

                    {/* Small tag / label */}
                    <div className="inline-flex items-center gap-2 self-start md:self-auto">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-400/40 px-3 py-1 text-[10px] md:text-xs font-medium text-emerald-300 uppercase tracking-wide">
                        Field Report
                      </span>
                    </div>
                  </div>

                  {/* Photo area */}
                  <div className="relative w-full">
                    <div
                      className="
                        bg-black/70 border border-gray-700/80 rounded-2xl
                        flex items-center justify-center
                        h-72 md:h-[420px] lg:h-[480px]
                        overflow-hidden
                      "
                    >
                      {currentPhoto && (
                        <img
                          src={currentPhoto.url}
                          alt={event.title || "Event photo"}
                          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      )}

                      {/* subtle gradient at bottom for overlay info */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    </div>

                    {photos.length > 1 && (
                      <>
                        {/* Premium glassmorphism arrows */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault() // prevent navigation when just changing photo
                            changePhoto(event._id, photos.length, "prev")
                          }}
                          className="
                            absolute left-4 top-1/2 -translate-y-1/2
                            flex items-center justify-center
                            h-9 w-9 md:h-10 md:w-10
                            rounded-full
                            bg-white/10 backdrop-blur-md
                            border border-white/25
                            text-xs md:text-sm text-gray-100
                            hover:bg-emerald-500/90 hover:text-white hover:border-emerald-300
                            shadow-[0_10px_25px_rgba(0,0,0,0.6)]
                            transition
                          "
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            changePhoto(event._id, photos.length, "next")
                          }}
                          className="
                            absolute right-4 top-1/2 -translate-y-1/2
                            flex items-center justify-center
                            h-9 w-9 md:h-10 md:w-10
                            rounded-full
                            bg-white/10 backdrop-blur-md
                            border border-white/25
                            text-xs md:text-sm text-gray-100
                            hover:bg-emerald-500/90 hover:text-white hover:border-emerald-300
                            shadow-[0_10px_25px_rgba(0,0,0,0.6)]
                            transition
                          "
                        >
                          ›
                        </button>

                        {/* Dots + counter */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                          <div className="flex gap-1.5 mb-0.5">
                            {photos.map((_, dotIdx) => (
                              <button
                                key={dotIdx}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setPhotoIndices((prev) => ({
                                    ...prev,
                                    [event._id]: dotIdx
                                  }))
                                }}
                                className={`
                                  h-1.5 rounded-full transition
                                  ${
                                    dotIdx === currentIndex
                                      ? "w-4 bg-white"
                                      : "w-1.5 bg-white/40 hover:bg-white/80"
                                  }
                                `}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-gray-200 border border-white/20">
                            {currentIndex + 1} / {photos.length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm md:text-base leading-relaxed text-gray-100 whitespace-pre-line">
                    {event.description ||
                      "Details about this event will be available soon."}
                  </p>
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default EventShowcase
