import { useEffect } from "react";
import { loginUser , fetchCurrentUser } from "../../store/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { selectAuthStatus } from "../../store/slices/authSlice.js";


const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ FIX: status is a STRING
  const authStatus = useSelector(selectAuthStatus);
  
  const isAuthLoading = authStatus === "loading";
  

  const onSubmit = async (data) => {
  clearErrors("root");

  try {
    // 1️⃣ Login (token only, partial user is OK)
    await dispatch(
      loginUser({
        email: data.email,
        password: data.password,
      })
    ).unwrap();

    // 2️⃣ Hydrate full user (THIS FIXES YOUR BUG)
    const fullUser = await dispatch(fetchCurrentUser()).unwrap();

    // 3️⃣ Navigate AFTER hydration
    if (fullUser.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }

  } catch (err) {
    setError("root", {
      type: "manual",
      message: err?.message || "Failed to login. Please try again.",
    });
  }
};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const globalError = errors.root?.message;

  return (
    <div className="min-h-[calc(100vh-4rem-4rem)] flex items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-6xl border border-slate-800 rounded-3xl bg-slate-950/80 shadow-2xl shadow-black/40 overflow-hidden">
        <div className="grid md:grid-cols-2 md:divide-x md:divide-slate-800">
          {/* LEFT PANEL – content + pills */}
          <section className="h-full flex flex-col justify-center px-6 sm:px-10 py-10 bg-gradient-to-br from-sky-500/10 via-emerald-500/10 to-fuchsia-500/10 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),_radial-gradient(circle_at_bottom,_#0ea5e922,_transparent_55%)]" />

            <div className="relative max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-950/60 px-3 py-1 text-[11px] tracking-wide text-emerald-200 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Making every hour of service count
              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 leading-tight mb-3">
                Turn your time into a{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                  brighter future
                </span>
                .
              </h1>

              <p className="text-sm sm:text-base text-slate-300/90 max-w-md mb-8">
                Join{" "}
                <span className="font-semibold text-slate-100">
                  Bright Future Foundation
                </span>{" "}
                and keep every event, certificate and membership organised in
                one simple dashboard.
              </p>

              <div className="space-y-4">
                <div className="h-11 rounded-full bg-slate-950/80 border border-slate-700/80 px-4 flex items-center shadow-[0_0_35px_rgba(56,189,248,0.18)]">
                  <p className="text-xs sm:text-sm text-slate-200">
                    Register for events in a few clicks and never miss an
                    opportunity to serve.
                  </p>
                </div>

                <div className="h-11 rounded-full bg-slate-950/80 border border-slate-700/80 px-4 flex items-center shadow-[0_0_35px_rgba(45,212,191,0.18)]">
                  <p className="text-xs sm:text-sm text-slate-200">
                    Download verified certificates that strengthen your profile
                    and career.
                  </p>
                </div>

                <div className="h-11 rounded-full bg-slate-950/80 border border-slate-700/80 px-4 flex items-center shadow-[0_0_35px_rgba(129,140,248,0.22)]">
                  <p className="text-xs sm:text-sm text-slate-200">
                    Keep memberships, ID cards and documents safe in one secure
                    place.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL – logo + form */}
          <section className="flex flex-col items-center justify-center px-6 sm:px-10 py-10 bg-slate-950">
            {/* circular logo */}
            <div className="mb-6 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden mb-3 border border-slate-300">
            <img
                src="/logo.png"
                alt="NGO logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                e.currentTarget.src = "/fallback-logo.png"; // optional
                }}
            />
            </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Member / Volunteer Access
              </p>
            </div>

            <div className="w-full max-w-sm">
              <h2 className="text-xl font-semibold text-slate-50 mb-1.5">
                Login to your account
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Use your registered email or username to continue.
              </p>

              {globalError && (
                <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {globalError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* email / username */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-[11px] font-medium text-slate-300"
                  >
                    Email 
                  </label>
                  <input
                    id="email"
                    type="text"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full rounded-full border px-4 py-2.5 text-sm bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                      errors.emailOrUsername
                        ? "border-red-500"
                        : "border-slate-700"
                    }`}
                    {...register("email", {
                      required: "Email is required",
                      minLength: {
                        value: 6,
                        message: "Must be at least 6 characters",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label
                      htmlFor="password"
                      className="font-medium text-slate-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sky-400 hover:text-sky-300"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full rounded-full border px-4 py-2.5 text-sm bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                      errors.password ? "border-red-500" : "border-slate-700"
                    }`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="text-[11px] text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isAuthLoading}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting || isAuthLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-slate-900 border-t-transparent" />
                      Signing you in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <p className="mt-4 text-[11px] text-slate-400 text-center">
                Don&apos;t have an account?{" "}
                <Link
                  to="/auth/register"
                  className="font-medium text-sky-400 hover:text-sky-300"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;