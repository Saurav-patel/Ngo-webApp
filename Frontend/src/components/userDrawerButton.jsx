import { ChevronLeft } from "lucide-react"

const UserDrawerButton = ({ open, toggle }) => {
  return (
    <button
      onClick={toggle}
      className={`fixed top-1/2 right-0 z-50
        bg-gray-900 text-white p-2 rounded-l-xl shadow-lg
        transition-all duration-300 hover:bg-gray-800
        ${open ? "right-72" : "right-0"}`}
    >
      <ChevronLeft
        className={`w-5 h-5 transition-transform ${
          open ? "rotate-180" : ""
        }`}
      />
    </button>
  )
}

export default UserDrawerButton
