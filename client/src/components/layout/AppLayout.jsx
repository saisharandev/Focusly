import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen p-6 pt-16 lg:pt-6">
        {children}
      </main>
    </div>
  )
}
