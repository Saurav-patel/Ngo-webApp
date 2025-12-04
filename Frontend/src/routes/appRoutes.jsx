import HomePage from "../pages/homePage";

import { Routes , Route } from "react-router-dom";
import RequireAuth from "./requireAuth";
import LoginPage from "../pages/auth/loginPage";
import RegisterPage from "../pages/auth/registerpage";
import AboutPage from "../pages/aboutPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* Protected routes can be added here using RequireAuth */}
            <Route element = {<RequireAuth />} >
            <Route path = "/Dashboard " element = "" >



            </Route>
            </Route>
        </Routes>
    )

}

export default AppRoutes;