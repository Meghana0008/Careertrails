"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Clock, Building2 } from "lucide-react"
import { supabase, Application } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"

const statusConfig: Record<string, { bg: string; dot: string }> = {
  "Under Review": { bg: "badge-warning", dot: "bg-amber-500" },
  "Interview Scheduled": { bg: "badge-info", dot: "bg-blue-500" },
  "Accepted": { bg: "badge-success", dot: "bg-emerald-500" },
  "Rejected": { bg: "badge-danger", dot: "bg-red-500" },
}

export default function AppliedPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<(Application & { jobs: { title: string; company: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadApplications() {
      if (!user) return
      const { data } = await supabase.from('applications').select('*, jobs(title, company)').eq('user_id', user.id).order('applied_at', { ascending: false })
      if (data) setApplications(data as any)
      setLoading(false)
    }
    loadApplications()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 rounded-lg animate-shimmer" />
        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl animate-shimmer" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Applied <span className="text-slate-900">Jobs</span>
        </h2>
        <p className="text-muted-foreground mt-1">Track your application status in real-time.</p>
      </div>

      {applications.length === 0 ? (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">No applications yet</p>
              <p className="text-sm text-muted-foreground">Browse jobs and start applying!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app, i) => {
            const config = statusConfig[app.status] || statusConfig["Under Review"]
            return (
              <Card key={app.id} className="card-hover border-0 shadow-md" style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-lg">{app.jobs?.title || "Unknown Role"}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        {app.jobs?.company || "Unknown Company"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Applied on {new Date(app.applied_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg}`}>
                      <div className={`h-2 w-2 rounded-full ${config.dot}`} />
                      {app.status}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
