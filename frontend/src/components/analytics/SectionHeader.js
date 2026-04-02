'use client';

/**
 * SectionHeader
 * 
 * Reusable section header component for analytics page sections.
 * Provides consistent typography and spacing for visual hierarchy.
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} [props.description] - Optional section description
 * @param {React.ReactNode} [props.action] - Optional action element (button, dropdown, etc.)
 */
export default function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-12 flex items-start justify-between">
      <div className="flex-1">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
