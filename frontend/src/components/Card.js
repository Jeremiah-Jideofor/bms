// Custom Card component using TailwindCSS
export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}
