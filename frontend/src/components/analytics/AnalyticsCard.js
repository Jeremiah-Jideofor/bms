'use client';

/**
 * AnalyticsCard
 * 
 * A reusable KPI summary card for displaying key metrics with icon and optional change indicator.
 * Used in the Analytics dashboard to show high-level business metrics.
 * Premium styling with backdrop blur, smooth interactions, and semantic icons.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (e.g., "Total Revenue")
 * @param {string|number} props.value - Primary metric value
 * @param {React.ReactNode} props.icon - Icon element (e.g., <FiDollarSign />)
 * @param {string} props.iconBg - Tailwind classes for icon background (e.g., "bg-indigo-100")
 * @param {string} props.iconColor - Tailwind classes for icon color (e.g., "text-indigo-600")
 * @param {string|number} [props.change] - Optional change value (e.g., "+12.5%")
 * @param {boolean} [props.positive] - Whether change is positive (true = green, false = red)
 * @param {string} [props.subtitle] - Optional subtitle or description
 */
export default function AnalyticsCard({
  title,
  value,
  icon,
  iconBg = 'bg-indigo-100',
  iconColor = 'text-indigo-600',
  change,
  positive,
  subtitle,
}) {
  return (
    <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${iconBg}`}>
          <span className={`text-xl ${iconColor}`}>{icon}</span>
        </div>
      </div>

      {change !== undefined && (
        <div className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{positive ? '↑' : '↓'} {change}</span>
        </div>
      )}
    </div>
  );
}
