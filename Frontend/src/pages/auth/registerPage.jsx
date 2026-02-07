import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../../store/slices/authSlice";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    clearErrors("root");

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      await dispatch(
        registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
        })
      ).unwrap();

      navigate("/auth/login");
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err?.message || "Failed to create account",
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
          
          <section className="h-full flex flex-col justify-center px-6 sm:px-10 py-10 bg-gradient-to-br from-sky-500/10 via-emerald-500/10 to-fuchsia-500/10 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),_radial-gradient(circle_at_bottom,_#0ea5e922,_transparent_55%)]" />

            <div className="relative max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-950/60 px-3 py-1 text-[11px] tracking-wide text-emerald-200 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Start your journey as a changemaker
              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 leading-tight mb-3">
                Join a community that{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                  actually cares
                </span>
                .
              </h1>

              <p className="text-sm sm:text-base text-slate-300/90 max-w-md mb-8">
                Create your account to sign up for events, earn recognised
                certificates and keep all your NGO documents in one secure
                place.
              </p>

              <div className="space-y-4">
                <div className="h-11 rounded-full bg-slate-950/80 border border-slate-700/80 px-4 flex items-center shadow-[0_0_35px_rgba(56,189,248,0.18)]">
                  <p className="text-xs sm:text-sm text-slate-200">
                    Simple registration for members, students and volunteers.
                  </p>
                </div>

                <div className="h-11 rounded-full bg-slate-950/80 border border-slate-700/80 px-4 flex items-center shadow-[0_0_35px_rgba(45,212,191,0.18)]">
                  <p className="text-xs sm:text-sm text-slate-200">
                    Get official participation certificates after every event.
                  </p>
                </div>

                <div className="h-11 rounded-full bg-slate-950/80 border border-slate-700/80 px-4 flex items-center shadow-[0_0_35px_rgba(129,140,248,0.22)]">
                  <p className="text-xs sm:text-sm text-slate-200">
                    Access membership details and ID cards from anywhere.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col items-center justify-center px-6 sm:px-10 py-10 bg-slate-950">
            
            <div className="mb-6 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden mb-3 border border-slate-300">
                <img
                  src="/logo.png"
                  alt="NGO logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Create your account
              </p>
            </div>

            <div className="w-full max-w-sm">
              <h2 className="text-xl font-semibold text-slate-50 mb-1.5">
                Sign up to get started
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                It takes less than a minute to join our community.
              </p>

              {globalError && (
                <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {globalError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-[11px] font-medium text-slate-300"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className={`w-full rounded-full border px-4 py-2.5 text-sm bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.name ? "border-red-500" : "border-slate-700"
                    }`}
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 3,
                        message: "Name must be at least 3 characters",
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-[11px] font-medium text-slate-300"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full rounded-full border px-4 py-2.5 text-sm bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.email ? "border-red-500" : "border-slate-700"
                    }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="text-[11px] font-medium text-slate-300"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className={`w-full rounded-full border px-4 py-2.5 text-sm bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
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

                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="text-[11px] font-medium text-slate-300"
                    >
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`w-full rounded-full border px-4 py-2.5 text-sm bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-slate-700"
                      }`}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-red-400">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-slate-900 border-t-transparent" />
                      Creating your account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <p className="mt-4 text-[11px] text-slate-400 text-center">
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  className="font-medium text-sky-400 hover:text-sky-300"
                >
                  Login
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
