import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyParticipations } from "./store/slices/participationSlice";
import { selectIsAuthenticated } from "./store/slices/authSlice";
import HomePage from "./components/homePage.jsx";

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
  return () => { mounted = false; };
}, [isAuth, dispatch]);

  return <HomePage />;
}

export default App;
