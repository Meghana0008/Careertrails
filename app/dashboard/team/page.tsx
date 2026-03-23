"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, CheckCircle, Calendar, Loader2, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function TeamDashboardPage() {
  const [stats, setStats] = useState([
    { name: "Total Students", value: "...", icon: Users, gradient: "from-indigo-500 to-indigo-600", shadow: "shadow-indigo-200" },
    { name: "Active Companies", value: "...", icon: Building2, gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-200" },
    { name: "Placed Students", value: "...", icon: CheckCircle, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-200" },
    { name: "Upcoming Drives", value: "...", icon: Calendar, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-200" },
  ])
  const [activities, setActivities] = useState<{ color: string; text: string; time: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const [students, companies, placed, drives, recentApps] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('placement_status', 'Placed'),
        supabase.from('drives').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*, jobs(title, company), profiles(name)').order('applied_at', { ascending: false }).limit(6),
      ])

      setStats([
        { name: "Total Students", value: String(students.count || 0), icon: Users, gradient: "from-indigo-500 to-indigo-600", shadow: "shadow-indigo-200" },
        { name: "Active Companies", value: String(companies.count || 0), icon: Building2, gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-200" },
        { name: "Placed Students", value: String(placed.count || 0), icon: CheckCircle, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-200" },
        { name: "Upcoming Drives", value: String(drives.count || 0), icon: Calendar, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-200" },
      ])

      if (recentApps.data) {
        setActivities(
          recentApps.data.map((app: any) => ({
            color: app.status === 'Accepted' ? 'bg-emerald-500' : app.status === 'Interview Scheduled' ? 'bg-blue-500' : 'bg-amber-500',
            text: `${app.profiles?.name || 'A student'} applied for ${app.jobs?.title || 'a role'} at ${app.jobs?.company || 'a company'}`,
            time: new Date(app.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          }))
        )
      }

      setLoading(false)
    }
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Team <span className="text-slate-900">Dashboard</span>
        </h2>
        <p className="text-muted-foreground mt-1">Overview of placement activities and metrics.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="card-hover border-0 shadow-md" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.name}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Activity feed */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest application updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length > 0 ? activities.map((act, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted transition-colors">
                  <div className={`h-2.5 w-2.5 rounded-full ${act.color} shrink-0`} />
                  <p className="text-sm text-foreground/80 flex-1">{act.text}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{act.time}</span>
                </div>
              )) : (
                <p className="text-center py-8 text-muted-foreground">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                { label: "Manage Students", href: "/dashboard/team/students", icon: Users, color: "text-indigo-600 bg-indigo-50" },
                { label: "Manage Companies", href: "/dashboard/team/companies", icon: Building2, color: "text-violet-600 bg-violet-50" },
                { label: "Schedule Drives", href: "/dashboard/team/drives", icon: Calendar, color: "text-amber-600 bg-amber-50" },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <a key={action.label} href={action.href} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-white hover:bg-muted/30 transition-all cursor-pointer group">
                    <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{action.label}</span>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
