'use client';

/**
 * RoleBadge - Displays user role with appropriate styling
 * @param {string} role - 'ADMIN' or 'STAFF'
 */
export default function RoleBadge({ role }) {
  if (!role) return null;

  const isAdmin = role === 'ADMIN';
  const bgColor = isAdmin ? 'bg-red-100' : 'bg-blue-100';
  const textColor = isAdmin ? 'text-red-800' : 'text-blue-800';
  const label = isAdmin ? 'Admin' : 'Staff';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
