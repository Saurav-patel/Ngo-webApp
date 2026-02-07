import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { userService } from "../../service/userService.js"
import { Camera, Lock } from "lucide-react"

const AccountSettings = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm()

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { isSubmitting: pwdSubmitting }
  } = useForm()

  useEffect(() => {
    const load = async () => {
      const data = await userService.getUserDetails()
      setUser(data)
      reset({
        fatherName: data.fatherName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        dob: data.dob?.split("T")[0]
      })
      setLoading(false)
    }
    load()
  }, [reset])

  const onUpdateProfile = async (data) => {
    await userService.updateProfile(data)
  }

  const onChangePassword = async (data) => {
    await userService.changePassword(data)
    resetPwd()
  }

  const onUploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("profile", file)
    setUploading(true)
    await userService.uploadProfilePicture(formData)
    const updated = await userService.getUserDetails()
    setUser(updated)
    setUploading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading Account Settings...
      </div>
    )
  }

  const cardClass = `
    bg-gray-900/60 border border-gray-700 rounded-3xl
    shadow-lg p-8
    transition-all duration-300 ease-out
    hover:border-emerald-400/40
    hover:shadow-2xl
    hover:-translate-y-0.5
  `

  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-10 space-y-12">
        <div>
          <p className="uppercase text-emerald-400 tracking-[0.25em] text-[11px]">
            Account
          </p>
          <h1 className="text-3xl font-bold mt-1">
            Account Settings
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Manage your personal details and security
          </p>
        </div>

        <section className={`${cardClass} flex flex-col md:flex-row gap-8 items-center`}>
          <div className="relative">
            <img
              src={user.profile_pic_url}
              alt="Profile"
              className="
                w-28 h-28 rounded-full object-cover
                border border-gray-700
                transition hover:scale-[1.02]
              "
            />
            <label className="absolute bottom-1 right-1 bg-black/70 p-2 rounded-full cursor-pointer hover:bg-black transition">
              <Camera size={16} className="text-white" />
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={onUploadPhoto}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-xl font-semibold text-white">
              {user.username}
            </h2>
            <p className="text-sm text-gray-400">{user.email}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-gray-400 pt-2">
              <span className="bg-gray-900 border border-gray-700 px-3 py-1 rounded-full">
                {user.city}
              </span>
              <span className="bg-gray-900 border border-gray-700 px-3 py-1 rounded-full">
                DOB: {new Date(user.dob).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>
        </section>

        <form
          onSubmit={handleSubmit(onUpdateProfile)}
          className={cardClass}
        >
          <h2 className="text-xl font-semibold mb-6">
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              ["Father’s Name", "fatherName"],
              ["Phone Number", "phone"],
              ["City", "city"],
              ["Date of Birth", "dob", "date"]
            ].map(([label, name, type]) => (
              <div key={name}>
                <p className="text-xs text-gray-400 mb-2">{label}</p>
                <input
                  type={type || "text"}
                  {...register(name)}
                  className="
                    w-full bg-gray-900 border border-gray-700
                    rounded-xl px-5 py-3 text-gray-200
                    focus:outline-none focus:border-emerald-400/50
                  "
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-xs text-gray-400 mb-2">Address</p>
            <textarea
              {...register("address")}
              className="
                w-full bg-gray-900 border border-gray-700
                rounded-xl px-5 py-3 h-28 text-gray-200
                focus:outline-none focus:border-emerald-400/50
              "
            />
          </div>

          <button
            disabled={isSubmitting}
            className="mt-6 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold transition"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold mb-4">
            Identity Information
          </h2>

          <div className="flex items-center gap-4 bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <Lock size={18} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-400">Aadhaar Number</p>
              <p className="text-sm text-gray-200 tracking-widest">
                {user.aadhaarNumber}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                This information cannot be edited
              </p>
            </div>
          </div>
        </section>

        <form
          onSubmit={handlePwdSubmit(onChangePassword)}
          className={cardClass}
        >
          <h2 className="text-xl font-semibold mb-5">
            Security
          </h2>

          <input
            type="password"
            {...registerPwd("oldPassword", { required: true })}
            placeholder="Current password"
            className="
              w-full bg-gray-900 border border-gray-700
              rounded-xl px-5 py-3 text-gray-200
              focus:outline-none focus:border-red-400/50
            "
          />

          <input
            type="password"
            {...registerPwd("newPassword", { required: true })}
            placeholder="New password"
            className="
              w-full mt-4 bg-gray-900 border border-gray-700
              rounded-xl px-5 py-3 text-gray-200
              focus:outline-none focus:border-red-400/50
            "
          />

          <button
            disabled={pwdSubmitting}
            className="mt-6 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-sm font-semibold transition"
          >
            {pwdSubmitting ? "Updating..." : "Change Password"}
          </button>
        </form>

      </div>
    </div>
  )
}

export default AccountSettings
