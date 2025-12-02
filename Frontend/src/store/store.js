import {configureStore} from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import eventReducer from './slices/eventSlice.js'
import participationReducer from './slices/participationSlice.js'

export const store = configureStore({
    reducer:{
        auth: authReducer,
        events: eventReducer,
        participation: participationReducer,
    }
})