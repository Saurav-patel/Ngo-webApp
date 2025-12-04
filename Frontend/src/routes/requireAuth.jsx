import { Navigate , Outlet , useLocation  } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/slices/authSlice";

const RequireAuth = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;