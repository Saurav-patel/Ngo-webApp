import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { adminService } from "../../service/adminService.js"

const AddUser = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm()

  const onSubmit = async data => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })

    try {
      await adminService.addUser(formData)
      navigate("/admin/users")
    } catch (error) {
      console.error("Failed to add user", error)
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add User</h1>
        <p className="text-sm text-gray-400 mt-1">
          Create a new user account
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm mb-1 text-gray-300">
            Username
          </label>
          <input
            type="text"
            {...register("username", { required: true })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.username && (
            <p className="text-xs text-red-400 mt-1">
              Username is required
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">
            Email
          </label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">
              Email is required
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">
            Password
          </label>
          <input
            type="password"
            {...register("password", { required: true, minLength: 6 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">
              Minimum 6 characters required
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Phone
            </label>
            <input
              type="text"
              {...register("phone")}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">
              City
            </label>
            <input
              type="text"
              {...register("city")}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">
            Profile Photo
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("profile")}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-gray-800 file:text-gray-300
              hover:file:bg-gray-700"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 text-sm bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-medium disabled:opacity-50"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddUser
