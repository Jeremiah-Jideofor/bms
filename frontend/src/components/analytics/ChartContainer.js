'use client';

import Spinner from '../Spinner';

/**
 * ChartContainer
 * 
 * Wrapper component for charts with consistent styling, loading states, and error handling.
 * Provides a uniform look and feel for all chart visualizations in the analytics page.
 * 
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {React.ReactNode} props.children - Chart component (Recharts component)
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @param {string} [props.error] - Error message to display instead of chart
 * @param {string} [props.className] - Additional Tailwind classes to apply
 */
export default function ChartContainer({
  title,
  children,
  loading = false,
  error,
  className = '',
}) {
  return (
    <div className={`bg-white/90 backdrop-blur border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 ${className}`}>
      <div className="pb-4 mb-6 border-b border-gray-100">         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>      </div>

      {loading && <Spinner label="Loading chart data..." />}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <p className="font-medium">Error loading chart</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && children}
    </div>
  );
}
