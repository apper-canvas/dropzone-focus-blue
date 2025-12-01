import { Outlet } from "react-router-dom"

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout