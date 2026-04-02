// Custom Alert component using TailwindCSS
import { FiAlertCircle } from "react-icons/fi";

export default function Alert({ children, variant = "default" }) {
  const variants = {
    default: "bg-blue-50 text-blue-800 border-blue-200",
    destructive: "bg-red-50 text-red-800 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  };
  return (
    <div className={`flex items-center gap-2 border-l-4 px-4 py-3 rounded ${variants[variant]}`}> 
      <FiAlertCircle className="text-xl" />
      <div>{children}</div>
    </div>
  );
}
