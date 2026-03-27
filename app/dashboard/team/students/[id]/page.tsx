"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Mail, GraduationCap, BookOpen, User, Building2, CheckCircle, XCircle, Clock, CalendarDays, AlertCircle, Save } from "lucide-react"
import { supabase, Profile, Application } from "@/lib/supabase"

const statusConfig: Record<string, { bg: string; dot: string; icon: any }> = {
  "Under Review": { bg: "badge-warning", dot: "bg-amber-500", icon: Clock },
  "Interview Scheduled": { bg: "badge-info", dot: "bg-blue-500", icon: CalendarDays },
  "Accepted": { bg: "badge-success", dot: "bg-emerald-500", icon: CheckCircle },
  "Rejected": { bg: "badge-danger", dot: "bg-red-500", icon: XCircle },
}

type ApplicationWithJob = Application & {
  jobs: { title: string; company: string; category: string }
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Profile | null>(null)
  const [applications, setApplications] = useState<ApplicationWithJob[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReason, setEditingReason] = useState<number | null>(null)
  const [reasonText, setReasonText] = useState("")
  const [savingReason, setSavingReason] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return

      const [profileRes, appsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('applications').select('*, jobs(title, company, category)').eq('user_id', id).order('applied_at', { ascending: false }),
      ])

      if (profileRes.data) setStudent(profileRes.data as Profile)
      if (appsRes.data) setApplications(appsRes.data as ApplicationWithJob[])
      setLoading(false)
    }
    load()
  }, [id])

  const handleSaveReason = async (appId: number) => {
    setSavingReason(true)
    const { error } = await supabase.from('applications').update({ rejection_reason: reasonText }).eq('id', appId)
    if (!error) {
      setApplications(applications.map((a) => a.id === appId ? { ...a, rejection_reason: reasonText } : a))
      setEditingReason(null)
      setReasonText("")
    }
    setSavingReason(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/dashboard/team/students">
          <Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Students</Button>
        </Link>
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent>
            <p className="text-muted-foreground">Student not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onCampusApps = applications.filter((a) => a.jobs?.category === 'On-Campus')
  const offCampusApps = applications.filter((a) => a.jobs?.category === 'Off-Campus')
  const rejectedApps = applications.filter((a) => a.status === 'Rejected')
  const acceptedApps = applications.filter((a) => a.status === 'Accepted')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Link href="/dashboard/team/students">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Button>
      </Link>

      {/* Student Profile Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1.5 bg-slate-900" />
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-200 shrink-0">
              {student.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight">{student.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${student.placement_status === "Placed" ? "badge-success" : "badge-warning"}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${student.placement_status === "Placed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {student.placement_status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  {student.branch || "No branch"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  CGPA: {student.cgpa || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Applied", value: applications.length, color: "from-indigo-500 to-indigo-600", shadow: "shadow-indigo-200", icon: Building2 },
          { label: "On-Campus", value: onCampusApps.length, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-200", icon: CalendarDays },
          { label: "Accepted", value: acceptedApps.length, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-200", icon: CheckCircle },
          { label: "Rejected", value: rejectedApps.length, color: "from-red-500 to-rose-600", shadow: "shadow-red-200", icon: XCircle },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="card-hover border-0 shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* All Applications Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-slate-900" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>{applications.length} total applications — On-Campus & Off-Campus</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Company</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Role</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Applied</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Rejection Reason</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      This student has not applied to any jobs yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const config = statusConfig[app.status] || statusConfig["Under Review"]
                    const StatusIcon = config.icon
                    const isRejected = app.status === 'Rejected'

                    return (
                      <tr key={app.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="p-5 font-medium">{app.jobs?.company || "Unknown"}</td>
                        <td className="p-5 text-muted-foreground">{app.jobs?.title || "Unknown"}</td>
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${app.jobs?.category === 'On-Campus' ? 'badge-purple' : 'badge-info'}`}>
                            {app.jobs?.category || "Unknown"}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg}`}>
                            <StatusIcon className="h-3 w-3" />
                            {app.status}
                          </span>
                        </td>
                        <td className="p-5 text-muted-foreground text-xs">
                          {new Date(app.applied_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-5">
                          {isRejected ? (
                            editingReason === app.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={reasonText}
                                  onChange={(e) => setReasonText(e.target.value)}
                                  placeholder="Enter rejection reason..."
                                  className="h-8 text-xs max-w-[200px]"
                                />
                                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => handleSaveReason(app.id)} disabled={savingReason}>
                                  <Save className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-muted-foreground" onClick={() => { setEditingReason(null); setReasonText("") }}>
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => { setEditingReason(app.id); setReasonText(app.rejection_reason || "") }}
                              >
                                {app.rejection_reason ? (
                                  <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 group-hover:border-red-300 transition-colors">
                                    <AlertCircle className="h-3 w-3 inline mr-1" />
                                    {app.rejection_reason}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                    + Add reason
                                  </span>
                                )}
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
