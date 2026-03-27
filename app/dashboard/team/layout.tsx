"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Building2, Calendar, LogOut, Sparkles, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

export default function TeamDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { profile, logout } = useAuth()

  const sidebarItems = [
    { name: "Dashboard", href: "/dashboard/team", icon: LayoutDashboard },
    { name: "Students", href: "/dashboard/team/students", icon: Users },
    { name: "Companies", href: "/dashboard/team/companies", icon: Building2 },
    { name: "Drives", href: "/dashboard/team/drives", icon: Calendar },
    { name: "Experiences", href: "/dashboard/team/experiences", icon: MessageSquare },
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Careertrails</h1>
              <p className="text-xs text-slate-500 font-medium">Placement Team</p>
            </div>
          </div>
        </div>

        {profile && (
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                {profile.name?.charAt(0)?.toUpperCase() || "T"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{profile.name}</p>
                <p className="text-xs text-slate-500 truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                {item.name}
                {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-900" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
