// src/redux/participationSlice.js
import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { eventService } from "../../service/eventService.js";

/**
 * Participation slice tuned to your exact API responses.
 *
 * - registerParticipants -> validate() -> { success, message, data: { ...participation } }
 * - myParticipatedEvents -> parseData() -> data: [ { ...participation, eventId: { _id, title, startDate, location } } ]
 * - getAllParticipants(eventId) -> parseData() -> data: [ { _id, userId: { _id, email }, status, createdAt } ]
 *
 * The adapter stores normalized participation entities keyed by _id (or id).
 * Each stored participation entity will have:
 *  - _id / id
 *  - userId (string)
 *  - user (optional nested user object if returned by API)
 *  - eventId (string)
 *  - event (optional nested event object if returned by API)
 *  - status, createdAt, updatedAt, etc.
 */

// Adapter: normalized by participation id
const participationAdapter = createEntityAdapter({
  selectId: (p) => p._id ?? p.id,
  sortComparer: (a, b) => {
    // newest first by createdAt if present
    const da = a.createdAt ? new Date(a.createdAt) : null;
    const db = b.createdAt ? new Date(b.createdAt) : null;
    if (!da || !db) return 0;
    return db - da;
  },
});

const initialState = participationAdapter.getInitialState({
  status: "idle", // create/update/delete
  fetchStatus: "idle", // list fetch
  error: null,
  byEvent: {}, // eventId -> [participationId, ...]
  myIds: [], // participation ids of current user
});

/* -------------------------
   Helpers: normalize payload shapes
   ------------------------- */

function unwrapValidate(payload) {
  // if payload is { success, message, data }, return data
  if (payload && typeof payload === "object" && payload.success === true && "data" in payload) {
    return payload.data;
  }
  return payload;
}

function normalizeParticipationObject(raw) {
  // raw is single participation object from API with fields:
  // - _id
  // - userId : string OR object { _id, email }
  // - eventId: string OR object { _id, title, startDate, location }
  // - status, createdAt, updatedAt, certificateId, etc.
  const p = { ...raw };

  // Normalize userId / user
  if (p.userId && typeof p.userId === "object") {
    p.user = p.userId; // keep nested user object (useful for participants list)
    p.userId = p.user._id ?? p.user.id;
  }

  // Normalize eventId / event
  if (p.eventId && typeof p.eventId === "object") {
    p.event = p.eventId; // keep nested event object (useful for myParticipations)
    p.eventId = p.event._id ?? p.event.id;
  }

  return p;
}

function normalizePayloadToArray(payload) {
  // payload may be: array, single object, or paginated object { items: [...] }
  if (!payload) return [];
  const data = unwrapValidate(payload);

  if (Array.isArray(data)) {
    return data.map(normalizeParticipationObject);
  }

  if (data && Array.isArray(data.items)) {
    return data.items.map(normalizeParticipationObject);
  }

  if (data && (data._id || data.id)) {
    return [normalizeParticipationObject(data)];
  }

  // fallback for nested shapes
  if (payload && Array.isArray(payload.data)) {
    return payload.data.map(normalizeParticipationObject);
  }

  return [];
}

/* =========================
   Thunks
   ========================= */

/**
 * Register current user for an event
 * POST /events/register/:eventId
 * service: eventService.registerParticipants(eventId) -> validate()
 * returns: { success, message, data: participation }
 */
export const registerForEvent = createAsyncThunk(
  "participation/registerForEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await eventService.registerParticipants(eventId);
      // res is validate() style -> { success, message, data }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Registration failed";
      return rejectWithValue(msg);
    }
  }
);

/**
 * Get participants for an event (admin / event page)
 * GET /participation/all-participants/:eventId
 * returns parseData() -> data: [ { _id, userId: { _id, email }, status, createdAt } ]
 */
export const fetchParticipantsByEvent = createAsyncThunk(
  "participation/fetchParticipantsByEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await eventService.getAllParticipants(eventId);
      // res is parseData() -> actual array/object
      return { eventId, payload: res };
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch participants";
      return rejectWithValue(msg);
    }
  }
);

/**
 * Get logged-in user's participations
 * GET /events/my-participation
 * returns parseData() -> data: [ { _id, userId, eventId: { _id,...,title,startDate }, status, ... } ]
 */
export const fetchMyParticipations = createAsyncThunk(
  "participation/fetchMyParticipations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await eventService.myParticipatedEvents();
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch my participations";
      return rejectWithValue(msg);
    }
  }
);

/**
 * Get participations for a specific user (admin)
 * GET /participation/user-participation/:userId
 * returns parseData() -> array or single
 */
export const fetchUserParticipation = createAsyncThunk(
  "participation/fetchUserParticipation",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await eventService.getUserParticipation(userId);
      return { userId, payload: res };
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user participation";
      return rejectWithValue(msg);
    }
  }
);

/**
 * Update participation status (admin)
 * PUT /participation/update-status/:participationId
 * eventService.updateParticipationStatus(participationId, payload) -> validate()
 * returns validate() style -> { success, message, data: updatedParticipation }
 */
export const updateParticipationStatus = createAsyncThunk(
  "participation/updateParticipationStatus",
  async ({ participationId, payload }, { rejectWithValue }) => {
    try {
      const res = await eventService.updateParticipationStatus(participationId, payload);
      return { participationId, payload: res };
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to update participation";
      return rejectWithValue(msg);
    }
  }
);

/* =========================
   Slice
   ========================= */
const participationSlice = createSlice({
  name: "participation",
  initialState,
  reducers: {
    // Clear on logout
    clearParticipationState(state) {
      participationAdapter.removeAll(state);
      state.byEvent = {};
      state.myIds = [];
      state.status = "idle";
      state.fetchStatus = "idle";
      state.error = null;
    },

    // Optional optimistic helpers (UI can dispatch these before the thunk)
    addParticipationOptimistic(state, action) {
      const p = normalizeParticipationObject(action.payload);
      const id = p._id ?? p.id;
      participationAdapter.addOne(state, p);
      // add mapping byEvent
      if (p.eventId) {
        state.byEvent[p.eventId] = state.byEvent[p.eventId] ?? [];
        if (!state.byEvent[p.eventId].includes(id)) state.byEvent[p.eventId].push(id);
      }
      // add to myIds
      if (!state.myIds.includes(id)) state.myIds.push(id);
    },

    removeParticipationOptimistic(state, action) {
      const id = action.payload;
      participationAdapter.removeOne(state, id);
      // remove from byEvent arrays
      Object.keys(state.byEvent).forEach((eid) => {
        state.byEvent[eid] = state.byEvent[eid].filter((pid) => pid !== id);
      });
      state.myIds = state.myIds.filter((pid) => pid !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      /* registerForEvent */
      .addCase(registerForEvent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        // action.payload is validate() style: { success, message, data }
        const data = unwrapValidate(action.payload);
        const items = Array.isArray(data) ? data.map(normalizeParticipationObject) : data ? [normalizeParticipationObject(data)] : [];
        if (items.length) {
          items.forEach((p) => {
            participationAdapter.upsertOne(state, p);
            const id = p._id ?? p.id;
            if (p.eventId) {
              state.byEvent[p.eventId] = state.byEvent[p.eventId] ?? [];
              if (!state.byEvent[p.eventId].includes(id)) state.byEvent[p.eventId].push(id);
            }
            // if this is current user's registration, add to myIds
            if (!state.myIds.includes(id)) state.myIds.push(id);
          });
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      })

      /* fetchParticipantsByEvent */
      .addCase(fetchParticipantsByEvent.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchParticipantsByEvent.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const { eventId, payload } = action.payload;
        const arr = normalizePayloadToArray(payload);
        if (arr.length) {
          participationAdapter.upsertMany(state, arr);
          state.byEvent[eventId] = arr.map((p) => p._id ?? p.id);
        } else {
          state.byEvent[eventId] = [];
        }
      })
      .addCase(fetchParticipantsByEvent.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || action.error?.message;
      })

      /* fetchMyParticipations */
      .addCase(fetchMyParticipations.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMyParticipations.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const arr = normalizePayloadToArray(action.payload);
        if (arr.length) {
          participationAdapter.upsertMany(state, arr);
          state.myIds = arr.map((p) => p._id ?? p.id);
          // update byEvent mapping
          arr.forEach((p) => {
            if (p.eventId) {
              state.byEvent[p.eventId] = state.byEvent[p.eventId] ?? [];
              const id = p._id ?? p.id;
              if (!state.byEvent[p.eventId].includes(id)) state.byEvent[p.eventId].push(id);
            }
          });
        } else {
          state.myIds = [];
        }
      })
      .addCase(fetchMyParticipations.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || action.error?.message;
      })

      /* fetchUserParticipation (admin) */
      .addCase(fetchUserParticipation.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchUserParticipation.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const arr = normalizePayloadToArray(action.payload.payload);
        if (arr.length) participationAdapter.upsertMany(state, arr);
      })
      .addCase(fetchUserParticipation.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || action.error?.message;
      })

      /* updateParticipationStatus (admin) */
      .addCase(updateParticipationStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateParticipationStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        // action.payload: { participationId, payload: { success, message, data } }
        const data = unwrapValidate(action.payload.payload);
        const arr = Array.isArray(data) ? data.map(normalizeParticipationObject) : data ? [normalizeParticipationObject(data)] : [];
        if (arr.length) {
          arr.forEach((p) => {
            participationAdapter.upsertOne(state, p);
            // update mappings
            const id = p._id ?? p.id;
            if (p.eventId) {
              state.byEvent[p.eventId] = state.byEvent[p.eventId] ?? [];
              if (!state.byEvent[p.eventId].includes(id)) state.byEvent[p.eventId].push(id);
            }
            // update myIds if present
            const idx = state.myIds.indexOf(action.payload.participationId);
            if (idx !== -1) state.myIds[idx] = id;
          });
        } else {
          // fallback: if server returned no object, just try to update existing entity status
          const existing = state.entities[action.payload.participationId];
          if (existing) {
            existing.status = action.payload.payload?.status ?? existing.status;
            participationAdapter.upsertOne(state, existing);
          }
        }
      })
      .addCase(updateParticipationStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      });
  },
});

/* =========================
   Exports
   ========================= */

export const {
  clearParticipationState,
  addParticipationOptimistic,
  removeParticipationOptimistic,
} = participationSlice.actions;

export default participationSlice.reducer;

/* =========================
   Selectors
   ========================= */

// base selector safety: returns initialState if slice not present
const selectParticipationState = (state) => state.participation ?? initialState;

export const {
  selectAll: selectAllParticipations,
  selectById: selectParticipationById,
  selectIds: selectParticipationIds,
  selectEntities: selectParticipationEntities,
} = participationAdapter.getSelectors((s) => selectParticipationState(s));

/**
 * selectParticipationsByEvent(state, eventId)
 * returns array of participation entities (each may contain .user or .event objects if returned by API)
 */
export const selectParticipationsByEvent = (state, eventId) => {
  const ps = selectParticipationState(state);
  const ids = ps.byEvent?.[eventId] ?? [];
  return ids.map((id) => ps.entities[id]).filter(Boolean);
};

/**
 * My participations (current user)
 */
export const selectMyParticipationIds = (state) => selectParticipationState(state).myIds ?? [];
export const selectMyParticipations = (state) => {
  const ps = selectParticipationState(state);
  return (ps.myIds ?? []).map((id) => ps.entities[id]).filter(Boolean);
};

export const selectParticipationStatus = (state) => selectParticipationState(state).status;
export const selectParticipationFetchStatus = (state) => selectParticipationState(state).fetchStatus;
export const selectParticipationError = (state) => selectParticipationState(state).error;
