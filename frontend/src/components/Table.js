// Custom Table component using TailwindCSS
export default function Table({ columns, data, actions }) {
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col}
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {col.label || col}
                </th>
              ))}
              {actions && (
                <th className="px-5 py-3 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-10 text-sm text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}

            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="hover:bg-gray-50 transition"
              >
                {columns.map((col) => (
                  <td
                    key={col.key || col}
                    className="px-5 py-3 text-sm text-gray-900"
                  >
                    {row[col.key || col]}
                  </td>
                ))}

                {actions && (
                  <td className="px-5 py-3 text-right">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}
