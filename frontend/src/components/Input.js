// Custom Input component using TailwindCSS
export default function Input({ className = "", labelClassName, ...props }) {
  return (
    <input
      className={`
        w-full px-3 py-2.5
        border border-gray-300
        rounded-md
        text-sm text-gray-900
        bg-white
        placeholder:text-gray-400
        transition
        focus:outline-none
        focus:ring-2 focus:ring-indigo-500/30
        focus:border-indigo-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
}
