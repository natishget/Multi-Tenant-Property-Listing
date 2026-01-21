import { configureStore } from "@reduxjs/toolkit";
import apiReducer from "./API/ApiSlice"

export const store = configureStore({
    reducer: {
        api: apiReducer
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;