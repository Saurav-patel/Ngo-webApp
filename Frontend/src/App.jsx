import { BrowserRouter } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import {
  fetchCurrentUser,
  selectIsAuthenticated,
  selectAuthUser
} from "./store/slices/authSlice.js"

import { fetchMyParticipations } from "./store/slices/participationSlice.js"
import NoticeFloating from "./components/noticeFloating.jsx"

import Navbar from "./components/layout/navBar.jsx"
import Footer from "./components/layout/footer.jsx"
import AppRoutes from "./routes/appRoutes.jsx"

import UserDrawer from "./components/userDrawer.jsx"
import UserDrawerButton from "./components/userDrawerButton.jsx"

function App() {
  const dispatch = useDispatch()

  const isAuth = useSelector(selectIsAuthenticated)
  const user = useSelector(selectAuthUser)
  const authChecked = useSelector(state => state.auth.authChecked) // ✅

  const isAdmin = user?.role === "admin"
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* =========================
     AUTH HYDRATION (RUN ONCE)
  ========================= */
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  /* =========================
     DATA HYDRATION (USER ONLY)
  ========================= */
  useEffect(() => {
    if (!isAuth || isAdmin) return
    dispatch(fetchMyParticipations())
  }, [isAuth, isAdmin, dispatch])

  /* =========================
     UI CLEANUP ON LOGOUT
  ========================= */
  useEffect(() => {
    if (!isAuth) setDrawerOpen(false)
  }, [isAuth])

  /* =========================
     ⛔ FIX BLINKING (DO NOT RENDER EARLY)
  ========================= */
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-950">

        {/* USER NAVBAR ONLY */}
        {!isAdmin && <Navbar />}

        {/* USER DRAWER ONLY */}
        {isAuth && !isAdmin && (
          <>
            <UserDrawerButton
              open={drawerOpen}
              toggle={() => setDrawerOpen(prev => !prev)}
            />
            <UserDrawer
              open={drawerOpen}
              close={() => setDrawerOpen(false)}
            />
          </>
        )}

        <main className="flex-1 bg-gray-950">
          <AppRoutes />
        </main>

        {/* USER FOOTER ONLY */}
        {!isAdmin && <Footer />}

         {!isAdmin && <NoticeFloating />}
      </div>
    </BrowserRouter>
  )
}

export default App
