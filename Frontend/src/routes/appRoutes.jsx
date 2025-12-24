import HomePage from "../pages/homePage";

import { Routes , Route } from "react-router-dom";
import RequireAuth from "./requireAuth";
import LoginPage from "../pages/auth/loginPage";
import RegisterPage from "../pages/auth/registerpage";
import AboutPage from "../pages/aboutPage";
import EventDetailPage from "../pages/singleEventPage";
import AllEventsPage from "../pages/eventsPage";
import ContactPage from "../pages/contactPage";
import AccountSettings from "../pages/dashboard/settings";
import DashboardPage from "../pages/dashboard/userDashboard";
import RequireAdmin from "./requireAdmin";
import AdminDashboard from "../pages/admin/adminDashboard";
import AdminLayout from "../components/layout/adminLayout";
import UsersDetails from "../pages/admin/usersDetails";
import Events from "../pages/admin/eventsPage";
import EventDetails from "../pages/admin/eventDetails";
import SingleUserDetails from "../pages/admin/singleUserDetail";
import CreateEvent from "../pages/admin/createEvent";

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
                <Route path="/dashboard" element={<DashboardPage/>} />
                <Route path="/settings" element={<AccountSettings/>} />
                


                <Route element = {<RequireAdmin />} >
                    <Route element = {<AdminLayout />} >
                    <Route path="/admin/dashboard" element={<AdminDashboard/>} />
                    <Route path="/admin/users" element={<UsersDetails/>} />
                    <Route path="/admin/events" element={<Events/>} />
                    <Route path="/admin/events/:eventId" element={<EventDetails/>} />
                    <Route path="/admin/users/:userId" element={<SingleUserDetails/>} />
                    <Route path="/admin/events/create-event" element={<CreateEvent />} />

                    {/* Admin-only routes can be added here */}
                    {/* <Route path="/admin" element={<AdminPage />} /> */}
                    </Route>
                </Route>
            </Route>
        </Routes>
    )

}

export default AppRoutes;