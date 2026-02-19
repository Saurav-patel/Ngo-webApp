export const Card = ({ title, children }) => (
  <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
    <div className="absolute inset-x-0 top-0 h-[2px] bg-yellow-400 rounded-t-2xl" />
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {title}
    </h3>
    <div className="mt-3">{children}</div>
  </div>
)

export const Section = ({ title, onAction, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {onAction && (
        <button
          onClick={onAction}
          className="text-sm font-semibold text-yellow-400 hover:text-yellow-300"
        >
          View
        </button>
      )}
    </div>
    {children}
  </div>
)

export const StatCard = ({ label, value, accent }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
    <p className="text-sm text-gray-400">{label}</p>
    <p
      className={`text-2xl font-bold mt-1 ${
        accent === "green"
          ? "text-green-400"
          : "text-yellow-400"
      }`}
    >
      {value}
    </p>
  </div>
)