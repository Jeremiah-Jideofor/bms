// Custom Badge component using TailwindCSS
export default function Badge({ children, color = "gray", className = "" }) {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    red: "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    indigo: "bg-indigo-100 text-indigo-700",
    blue: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors[color] || colors.gray} ${className}`}>
      {children}
    </span>
  );
}
