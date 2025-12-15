import { BrowserRouter } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { fetchMyParticipations } from "./store/slices/participationSlice.js"
import { fetchCurrentUser, selectIsAuthenticated } from "./store/slices/authSlice.js"

import Navbar from "./components/layout/navBar.jsx"
import Footer from "./components/layout/footer.jsx"
import AppRoutes from "./routes/appRoutes.jsx"

import UserDrawer from "./components/userDrawer.jsx"
import UserDrawerButton from "./components/userDrawerButton.jsx"

function App() {
  const dispatch = useDispatch()
  const isAuth = useSelector(selectIsAuthenticated)
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* =========================
     AUTH HYDRATION (RUN ONCE)
  ========================= */
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  /* =========================
     DATA HYDRATION (AFTER AUTH)
  ========================= */
  useEffect(() => {
    if (!isAuth) return
    dispatch(fetchMyParticipations())
  }, [isAuth, dispatch])

  /* =========================
     UI CLEANUP ON LOGOUT
  ========================= */
  useEffect(() => {
    if (!isAuth) setDrawerOpen(false)
  }, [isAuth])

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {isAuth && (
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

        <main className="flex-1">
          <AppRoutes />
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
