import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"
import { Camera } from "lucide-react"

import { userService } from "../../service/userService.js"
import { fetchCurrentUser } from "../../store/slices/authSlice.js"

const Settings = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  const [profileLoading, setProfileLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [avatarPreview, setAvatarPreview] = useState(null)

  /* =========================
     PROFILE FORM
  ========================= */
  const {
    register,
    handleSubmit,
    reset
  } = useForm()

  useEffect(() => {
    if (user) {
      reset({
        address: user.address || "",
        city: user.city || "",
        fatherName: user.fatherName || "",
        phone: user.phone || "",
        dob: user.dob ? user.dob.split("T")[0] : ""
      })
    }
  }, [user, reset])

  const onUpdateProfile = async (data) => {
    try {
      setProfileLoading(true)
      await userService.updateProfile(data, user._id)
      await dispatch(fetchCurrentUser()).unwrap()
      alert("Profile updated successfully")
    } catch (err) {
      alert(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  /* =========================
     PROFILE PICTURE
  ========================= */
  const onPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const onUploadPhoto = async (e) => {
    e.preventDefault()
    const file = e.target.photo.files[0]
    if (!file) return alert("Please select an image")

    const formData = new FormData()
    formData.append("photo", file)

    try {
      setPhotoLoading(true)
      await userService.uploadProfilePicture(formData, user._id)
      await dispatch(fetchCurrentUser()).unwrap()
      setAvatarPreview(null)
      alert("Profile picture updated")
    } catch (err) {
      alert(err.message)
    } finally {
      setPhotoLoading(false)
    }
  }

  /* =========================
     PASSWORD FORM
  ========================= */
  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd
  } = useForm()

  const onChangePassword = async (data) => {
    try {
      setPasswordLoading(true)
      await userService.changePassword(data, user._id)
      resetPwd()
      alert("Password changed successfully")
    } catch (err) {
      alert(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10 text-gray-200">

      {/* ================= PROFILE INFO ================= */}
      <section className="bg-gray-900 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

        <form
          onSubmit={handleSubmit(onUpdateProfile)}
          className="grid md:grid-cols-2 gap-4"
        >
          <input {...register("address")} placeholder="Address" className="input" />
          <input {...register("city")} placeholder="City" className="input" />
          <input {...register("fatherName")} placeholder="Father's Name" className="input" />
          <input {...register("phone")} placeholder="Phone" className="input" />
          <input type="date" {...register("dob")} className="input" />

          {/* Aadhaar (read-only) */}
          <input
            value={user.aadhaarNumber || "Not provided"}
            disabled
            className="input bg-gray-800 cursor-not-allowed"
          />

          <div className="md:col-span-2">
            <button
              disabled={profileLoading}
              className="btn-primary"
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* ================= PROFILE PICTURE ================= */}
      <section className="bg-gray-900 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>

        <form onSubmit={onUploadPhoto} className="flex items-center gap-6">
          <div className="relative">
            <img
              src={
                avatarPreview ||
                user.profile_pic_url?.url ||
                "/default-avatar.png"
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border border-gray-700"
            />

            <label className="absolute bottom-0 right-0 bg-black/70 p-2 rounded-full cursor-pointer">
              <Camera size={16} />
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={onPhotoChange}
                hidden
              />
            </label>
          </div>

          <button
            disabled={photoLoading}
            className="btn-primary"
          >
            {photoLoading ? "Uploading..." : "Update Photo"}
          </button>
        </form>
      </section>

      {/* ================= CHANGE PASSWORD ================= */}
      <section className="bg-gray-900 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <form
          onSubmit={handlePwdSubmit(onChangePassword)}
          className="grid md:grid-cols-2 gap-4"
        >
          <input
            type="password"
            {...registerPwd("oldPassword")}
            placeholder="Old Password"
            className="input"
          />
          <input
            type="password"
            {...registerPwd("newPassword")}
            placeholder="New Password"
            className="input"
          />

          <div className="md:col-span-2">
            <button
              disabled={passwordLoading}
              className="btn-danger"
            >
              {passwordLoading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Settings
