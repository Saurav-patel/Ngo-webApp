import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyParticipations } from "./store/slices/participationSlice.js";
import { selectIsAuthenticated } from "./store/slices/authSlice.js";
import RequireAuth from "./routes/requireAuth.jsx";
import Navbar from "./layout/navBar.jsx";
import Footer from "./layout/footer.jsx";
import HomePage from "./pages/homePage.jsx";
import AppRoutes from "./routes/appRoutes.jsx";
// import EventsPage, AboutPage, ContactPage later

function App() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuthenticated);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      if (!isAuth || !mounted) return;
      try {
        await dispatch(fetchMyParticipations()).unwrap();
      } catch (err) {
        console.warn("Failed to hydrate participations:", err);
      }
    };
    hydrate();
    return () => {
      mounted = false;
    };
  }, [isAuth, dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
         <AppRoutes />
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
