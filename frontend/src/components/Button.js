// Custom Button component using TailwindCSS
export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 border-transparent",
    outline: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700 border-transparent",
    secondary: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
