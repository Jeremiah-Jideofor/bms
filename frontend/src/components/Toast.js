// Custom Toast for success/error messages
import { useEffect } from "react";

export default function Toast({ open, message, type = "success", onClose }) {

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`
      fixed bottom-6 right-6 z-50
      px-5 py-3
      rounded-lg
      shadow-lg
      text-white text-sm
      flex items-center gap-2
      animate-slideIn
      ${type === "success"
        ? "bg-green-600"
        : "bg-red-600"}
    `}
    >
      {type === "success" ? "✓" : "⚠"} {message}
    </div>
  );
}