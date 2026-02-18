import HomePage from "../pages/homePage";

import { Routes , Route } from "react-router-dom";
import RequireAuth from "./requireAuth";
import LoginPage from "../pages/auth/loginPage";
import RegisterPage from "../pages/auth/registerPage";
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
import Certificates from "../pages/admin/certificates";
import CertificateDetails from "../pages/admin/certificateDetails";
import ContactInbox from "../pages/admin/contactInbox";
import ContactMessage from "../pages/admin/contactMessages";
import Notices from "../pages/admin/notices";
import CreateNotice from "../pages/admin/createNotice";
import NoticeDetails from "../pages/admin/noticeDetails";
import MyIdCard from "../pages/dashboard/idCard";
import AddUser from "../pages/admin/addUser";
import DonationCheckout from "../pages/donation/donationCheckout";
import DonationHistory from "../pages/donation/myDonations";

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
            <Route path="/donate" element={<DonationCheckout />} />
            {/* Protected routes can be added here using RequireAuth */}
            <Route element = {<RequireAuth />} >
                <Route path="/dashboard" element={<DashboardPage/>} />
                <Route path="/settings" element={<AccountSettings/>} />
                <Route path="/id-card" element={<MyIdCard/>} />
                <Route path="/my-donations" element={<DonationHistory/>} />


                <Route element = {<RequireAdmin />} >
                    <Route element = {<AdminLayout />} >
                    <Route path="/admin/dashboard" element={<AdminDashboard/>} />
                    <Route path="/admin/users" element={<UsersDetails/>} />
                    <Route path="/admin/events" element={<Events/>} />
                    <Route path="/admin/events/:eventId" element={<EventDetails/>} />
                    <Route path="/admin/users/:userId" element={<SingleUserDetails/>} />
                    <Route path="/admin/events/create-event" element={<CreateEvent />} />
                    <Route path="/admin/certificates" element={<Certificates />} />
                    <Route path="/admin/certificates/:certificateId" element={<CertificateDetails />} />
                    <Route path="/admin/contacts" element={<ContactInbox />} />
                    <Route path="/admin/contacts/:contactId" element={<ContactMessage />} />
                    <Route path="/admin/notices" element={<Notices />} />
                    <Route path="/admin/notices/create" element={<CreateNotice />} />
                    <Route path="/admin/notices/:noticeId" element={<NoticeDetails />} />
                    <Route path="/admin/users/add" element={<AddUser />} />

                    {/* Admin-only routes can be added here */}
                    {/* <Route path="/admin" element={<AdminPage />} /> */}
                    </Route>
                </Route>
            </Route>
        </Routes>
    )

}

export default AppRoutes;