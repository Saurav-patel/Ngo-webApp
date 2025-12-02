// src/features/home/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllEvents,
  fetchEventDetails,
  selectAllEvents,
  selectEventById,
  selectEventsFetchStatus,
  selectEventsError,
} from "../store/slices/eventSlice.js";
import { useNavigate } from "react-router-dom";

/* -------------------------
   Configuration
   ------------------------- */
const HOMEPAGE_LIMIT = 6;

/* -------------------------
   Hook: useEvents
   ------------------------- */
function useEvents() {
  const dispatch = useDispatch();
  const events = useSelector(selectAllEvents);
  const status = useSelector(selectEventsFetchStatus);
  const error = useSelector(selectEventsError);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllEvents());
    }
  }, [dispatch, status]);

  const refresh = () => dispatch(fetchAllEvents());

  return { events, status, error, refresh, dispatch };
}

/* -------------------------
   EventDetailModal (same as before)
   ------------------------- */
function EventDetailModal({ id, open, onClose }) {
  const dispatch = useDispatch();
  const event = useSelector((state) => selectEventById(state, id));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && id && !event) {
      setLoading(true);
      dispatch(fetchEventDetails(id)).finally(() => setLoading(false));
    }
  }, [open, id, event, dispatch]);

  if (!open) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white p-6 rounded shadow w-11/12 max-w-xl">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white p-6 rounded shadow w-11/12 max-w-xl">
          <div className="text-red-600">Event not found</div>
          <div className="mt-4 flex justify-end">
            <button className="px-3 py-1 border rounded" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded shadow w-11/12 max-w-xl">
        <header className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-sm text-gray-500">
              {event.startDate ? new Date(event.startDate).toLocaleString() : "No date"}
            </p>
            <p className="text-sm text-gray-600 mt-1">{event.location}</p>
          </div>
          <div>
            <button className="text-sm text-gray-500" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>

        <section className="mt-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.description}</p>
        </section>

        {Array.isArray(event.photos) && event.photos.length > 0 && (
          <section className="mt-4 grid grid-cols-2 gap-2">
            {event.photos.map((p) => (
              <img
                key={p._id ?? p.publicId ?? p.url}
                src={p.url}
                alt={event.title}
                className="w-full h-28 object-cover rounded"
              />
            ))}
          </section>
        )}

        <footer className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 rounded border" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

/* -------------------------
   EventCard (homepage variant: read-only + View)
   ------------------------- */
function EventCard({ event, onView }) {
  const navigate = useNavigate();

  return (
    <div className="border p-4 rounded shadow-sm bg-white flex flex-col h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <p className="text-sm text-gray-500">
            {event.startDate ? new Date(event.startDate).toLocaleString() : "No date"}
          </p>
          <p className="text-sm text-gray-600 mt-1">{event.location}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onView(event._id ?? event.id)}
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
          >
            View
          </button>

          <button
            onClick={() => navigate(`/events/${event._id ?? event.id}`)}
            className="text-xs text-gray-500 mt-1"
            title="Open detail page"
          >
            Open page →
          </button>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-700 line-clamp-3">{event.description}</div>
    </div>
  );
}

/* -------------------------
   HomePage
   ------------------------- */
export default function HomePage() {
  const { events, status, error, refresh } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

  const openDetail = (id) => {
    setSelectedEventId(id);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedEventId(null);
  };

  // take latest N events (adapter sorted by startDate desc already)
  const visibleEvents = (events || []).slice(0, HOMEPAGE_LIMIT);

  return (
    <main className="p-6">
      {/* Hero */}
      <section className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome — Upcoming Events</h1>
          <p className="text-gray-600 mt-2">
            Check out the latest events. Click view for details or browse all events.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/events")}
            className="px-4 py-2 rounded border"
          >
            See all events
          </button>

          <button
            onClick={() => refresh()}
            className="px-4 py-2 rounded bg-blue-600 text-white"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {/* Status / empty states */}
      {status === "loading" && events.length === 0 && (
        <div className="text-center py-12">Loading events...</div>
      )}

      {status === "failed" && (
        <div className="text-red-600 mb-4">
          {error || "Failed to load events"}
          <button className="ml-4 px-2 py-1 border rounded" onClick={refresh}>
            Retry
          </button>
        </div>
      )}

      {/* Events grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleEvents.map((ev) => (
            <EventCard key={ev._id ?? ev.id} event={ev} onView={openDetail} />
          ))}
        </div>

        {visibleEvents.length === 0 && status === "succeeded" && (
          <div className="text-center py-8 text-gray-600">No upcoming events.</div>
        )}
      </section>

      {/* CTA */}
      <section className="mt-8 flex justify-center">
        <button onClick={() => navigate("/events")} className="px-4 py-2 rounded border">
          Browse all events
        </button>
      </section>

      <EventDetailModal id={selectedEventId} open={isDetailOpen} onClose={closeDetail} />
    </main>
  );
}
