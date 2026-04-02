export default function UsersLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
