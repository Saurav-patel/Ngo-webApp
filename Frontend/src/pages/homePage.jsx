import { eventService } from "../service/eventService.js";
import { useEffect, useRef, useState } from "react";


const HomePage = () => {
  // ---- Events state ----
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState(null)
  const [eventsSectionVisible, setEventsSectionVisible] = useState(false)
  const [eventsFetched, setEventsFetched] = useState(false)

  const eventsSectionRef = useRef(null)

  // ---- IntersectionObserver for events section ----
  useEffect(() => {
    const section = eventsSectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setEventsSectionVisible(true)

          // Fetch only once when user scrolls to this section
          if (!eventsFetched) {
            setEventsFetched(true)
            setEventsLoading(true)
            try {
              // TODO: adjust according to your service method:
              // const data = await eventService.getUpcomingEvents()
              const data = await eventService.getAllEvents()
              // if your service wraps data, e.g. { data: [...] }, adjust here
              setEvents(data || [])
            } catch (err) {
              console.error(err)
              setEventsError(err.message || "Failed to load events")
            } finally {
              setEventsLoading(false)
            }
          }
        }
      },
      {
        threshold: 0.2
      }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [eventsFetched])

  return (
    <div className="bg-gray-50">
      {/* ---- HERO SECTION ---- */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/bg-image.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-[1.3fr,1fr] items-center">
            {/* Left text content */}
            <div className="space-y-4 md:space-y-6">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-yellow-300">
                Now we need your help
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Together we can rewrite{" "}
                <span className="text-yellow-300">a child&apos;s future.</span>
              </h1>
              <p className="text-sm md:text-base text-gray-100 max-w-xl">
                Your support turns empty classrooms into learning spaces and
                silent nights into dreams full of possibilities. Join us in
                funding education, health and hope for vulnerable children.
              </p>
              <p className="text-xs md:text-sm text-gray-200 max-w-md">
                Every donation sponsors notebooks, school fees, medical help or
                warm meals. No amount is small when it becomes someone&apos;s
                reason to smile.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button className="px-5 py-2.5 rounded-full bg-yellow-400 text-gray-900 text-sm font-semibold shadow-md hover:bg-yellow-300 transition">
                  Donate Now
                </button>
                <button className="px-5 py-2.5 rounded-full border border-gray-200/60 text-sm font-semibold text-gray-50 hover:bg-white/5 transition">
                  Become a Volunteer
                </button>
              </div>
            </div>

            {/* Right floating image card (img2.png) */}
            <div className="flex justify-center md:justify-end">
              <div className="group relative w-[260px] md:w-[320px] lg:w-[360px]">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-sm transform transition duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                  <img
                    src="/img2.jpg"
                    alt="Children education"
                    className="w-full h-64 md:h-80 object-cover opacity-95 group-hover:opacity-100 transition"
                  />
                </div>
                {/* small badge */}
                <div className="absolute -bottom-4 left-4 px-3 py-2 rounded-2xl bg-yellow-400 text-gray-900 text-[11px] font-semibold shadow-lg">
                  Every month, your kindness writes new chapters of hope.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- EVENTS SECTION ---- */}
      <section
        ref={eventsSectionRef}
        className="max-w-6xl mx-auto px-4 py-12 md:py-16"
      >
        <div
          className={`grid gap-10 md:grid-cols-[1fr,1.4fr] items-start transition-all duration-700 ${
            eventsSectionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          {/* Left: static image / illustration (reuse img2 or add new later) */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
            <div className="h-60 md:h-72 overflow-hidden">
              <img
                src="/img2.png"
                alt="Events"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 md:p-5">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                Upcoming events that change lives.
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                From health camps to scholarship drives, our events are designed
                to create real, measurable impact in local communities.
              </p>
            </div>
          </div>

          {/* Right: events from backend */}
          <div className="space-y-4 md:space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Events
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                Join a moment that matters.
              </h3>
              <p className="text-sm text-gray-600 max-w-xl">
                Choose an event close to your heart – volunteer on-ground, help
                with coordination, or support financially. Together, we can turn
                simple gatherings into milestones of hope.
              </p>
            </div>

            {/* Events list */}
            <div className="space-y-3">
              {eventsLoading && (
                <p className="text-sm text-gray-500">Loading events...</p>
              )}

              {eventsError && (
                <p className="text-sm text-red-500">
                  {eventsError} – please try again later.
                </p>
              )}

              {!eventsLoading && !eventsError && events.length === 0 && (
                <p className="text-sm text-gray-500">
                  No upcoming events right now. Check back soon or contact us to
                  know how you can help.
                </p>
              )}

              {!eventsLoading &&
                !eventsError &&
                events.map((event) => (
                  <EventCard key={event._id || event.id} event={event} />
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---- Event card component ----
const EventCard = ({ event }) => {
  const date = event.date ? new Date(event.date) : null

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 hover:-translate-y-1 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h4 className="text-sm md:text-base font-semibold text-gray-900">
            {event.title || "Untitled Event"}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {date
              ? date.toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })
              : "Date to be announced"}
            {" • "}
            {event.location || "Location will be shared"}
          </p>
          <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-3">
            {event.description ||
              event.shortDescription ||
              "Join us in making a direct difference through this initiative."}
          </p>
        </div>

        <div className="flex flex-col items-end justify-between gap-2 min-w-[110px]">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            {event.category || "Awareness Drive"}
          </span>
          <button className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition">
            View Details
          </button>
        </div>
      </div>
    </article>
  )
}

export default HomePage