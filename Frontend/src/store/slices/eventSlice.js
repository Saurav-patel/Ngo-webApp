import { createSlice, createAsyncThunk, createEntityAdapter  } from "@reduxjs/toolkit";
import { eventService } from "../../service/eventService.js";

const eventsAdapter = createEntityAdapter({
  selectId: (e) => e._id ?? e.id,
  sortComparer: (a, b) => {
    // prefer startDate (your API uses startDate)
    const da = a.startDate ?? a.date ?? a.eventDate ?? a.createdAt ?? null
    const db = b.startDate ?? b.date ?? b.eventDate ?? b.createdAt ?? null
    if (!da || !db) return 0
    return new Date(db) - new Date(da)
  },
})

/* =========================
   Initial state
   ========================= */
const initialState = eventsAdapter.getInitialState({
  fetchStatus: 'idle', // for list fetch
  status: 'idle', // for single/create/update/delete flows
  error: null,
  meta: { total: null }, // optional, if backend returns totals later
})

/* =========================
   Helper: normalize various payload shapes
   - supports:
     - arrays: data = [ ... ]
     - single object: data = { _id: ..., ... }
     - paginated object: data = { items: [...], total: N }
     - validate() style: { success, message, data: ... }  (we unwrap it)
   Returns: { items: Array, single: Object|null, meta: {} }
   ========================= */
function normalizeServicePayload(payload) {
  if (payload == null) return { items: [], single: null, meta: {} }

  // If validate() returned: { success, message, data }
  if (typeof payload === 'object' && payload.success === true && 'data' in payload) {
    payload = payload.data
  }

  // Array of events
  if (Array.isArray(payload)) return { items: payload, single: null, meta: {} }

  // Paginated: { items: [...], total: N }
  if (typeof payload === 'object' && Array.isArray(payload.items)) {
    return { items: payload.items, single: null, meta: { total: payload.total ?? null } }
  }

  // Single event object (has _id or id)
  if (typeof payload === 'object' && (payload._id || payload.id)) {
    return { items: [], single: payload, meta: {} }
  }

  // Fallback: check nested shapes commonly used
  if (payload.data && Array.isArray(payload.data)) return { items: payload.data, single: null, meta: {} }
  if (payload.data && Array.isArray(payload.data.items)) return { items: payload.data.items, single: null, meta: { total: payload.data.total ?? null } }

  return { items: [], single: null, meta: {} }
}

/* =========================
   Thunks
   ========================= */

/**
 * GET /events/all-events
 * eventService.getAllEvents() calls parseData() and returns inner data (per your BaseService)
 */
export const fetchAllEvents = createAsyncThunk(
  'events/fetchAllEvents',
  async (_, { rejectWithValue }) => {
    try {
      const res = await eventService.getAllEvents()
      return res
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch events'
      return rejectWithValue(msg)
    }
  }
)

/**
 * GET /events/single-event/:id
 */
export const fetchEventDetails = createAsyncThunk(
  'events/fetchEventDetails',
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await eventService.getEventDetails(eventId)
      return res
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch event details'
      return rejectWithValue(msg)
    }
  }
)

/**
 * POST /event/create-event
 * eventService.createEvent uses validate() -> returns { success, message, data }
 */
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await eventService.createEvent(formData)
      return res
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create event'
      return rejectWithValue(msg)
    }
  }
)

/**
 * PUT /event/update-event/:id
 */
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, formData }, { rejectWithValue }) => {
    try {
      const res = await eventService.updateEvent(eventId, formData)
      return res
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to update event'
      return rejectWithValue(msg)
    }
  }
)

/**
 * DELETE /event/delete-event/:id
 * eventService.deleteEvent uses validate(); reducer only needs the id
 */
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await eventService.deleteEvent(eventId)
      return eventId
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete event'
      return rejectWithValue(msg)
    }
  }
)

/* =========================
   Slice
   ========================= */
const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Used for logout/cleanup or manual reset
    clearEventsState(state) {
      eventsAdapter.removeAll(state)
      state.fetchStatus = 'idle'
      state.status = 'idle'
      state.error = null
      state.meta.total = null
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchAllEvents */
      .addCase(fetchAllEvents.pending, (state) => {
        state.fetchStatus = 'loading'
        state.error = null
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        const { items, single, meta } = normalizeServicePayload(action.payload)
        if (items && items.length) {
          eventsAdapter.setAll(state, items)
        } else if (single) {
          eventsAdapter.upsertOne(state, single)
        } else {
          eventsAdapter.removeAll(state)
        }
        state.meta.total = meta?.total ?? state.meta.total
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.fetchStatus = 'failed'
        state.error = action.payload || action.error?.message
      })

      /* fetchEventDetails */
      .addCase(fetchEventDetails.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { items, single } = normalizeServicePayload(action.payload)
        if (single) {
          eventsAdapter.upsertOne(state, single)
        } else if (items && items.length === 1) {
          eventsAdapter.upsertOne(state, items[0])
        } else if (items && items.length > 1) {
          eventsAdapter.upsertMany(state, items)
        }
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })

      /* createEvent */
      .addCase(createEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { items, single } = normalizeServicePayload(action.payload)
        if (single) {
          eventsAdapter.addOne(state, single)
        } else if (Array.isArray(items) && items.length) {
          eventsAdapter.addMany(state, items)
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })

      /* updateEvent */
      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { items, single } = normalizeServicePayload(action.payload)
        if (single) {
          eventsAdapter.upsertOne(state, single)
        } else if (Array.isArray(items) && items.length) {
          eventsAdapter.upsertMany(state, items)
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })

      /* deleteEvent */
      .addCase(deleteEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        eventsAdapter.removeOne(state, action.payload)
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })
  },
})

export const { clearEventsState } = eventSlice.actions

/* =========================
   Selectors
   ========================= */
export const {
  selectAll: selectAllEvents,
  selectById: selectEventById,
  selectIds: selectEventIds,
  selectEntities: selectEventEntities,
  selectTotal: selectEventsCount,
} = eventsAdapter.getSelectors((state) => state.events)

export const selectEventsFetchStatus = (state) => state.events.fetchStatus
export const selectEventsStatus = (state) => state.events.status
export const selectEventsError = (state) => state.events.error
export const selectEventsMeta = (state) => state.events.meta

export default eventSlice.reducer