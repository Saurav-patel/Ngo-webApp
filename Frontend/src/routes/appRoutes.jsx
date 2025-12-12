import HomePage from "../pages/homePage";

import { Routes , Route } from "react-router-dom";
import RequireAuth from "./requireAuth";
import LoginPage from "../pages/auth/loginPage";
import RegisterPage from "../pages/auth/registerpage";
import AboutPage from "../pages/aboutPage";
import EventDetailPage from "../pages/singleEventPage";
import AllEventsPage from "../pages/eventsPage";
import ContactPage from "../pages/contactPage";
import DashboardPage from "../pages/dashboardPage";
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/events" element={<AllEventsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Protected routes can be added here using RequireAuth */}
            <Route element = {<RequireAuth />} >
            <Route path = "/dashboard" element = {<DashboardPage />} >



            </Route>
            </Route>
        </Routes>
    )

}

export default AppRoutes;