"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { MapPin, DollarSign, Globe, ExternalLink, Loader2, ArrowRight, Briefcase, TrendingUp, Award } from "lucide-react"
import { supabase, Job } from "@/lib/supabase"
import { fetchOffCampusJobs } from "@/lib/jobsApi"
import { OffCampusJob } from "@/lib/jobTypes"

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc']

export default function UserDashboardPage() {
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [offCampusJobs, setOffCampusJobs] = useState<OffCampusJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [offCampusLoading, setOffCampusLoading] = useState(true)
  const [placementStats, setPlacementStats] = useState([
    { name: 'Placed', value: 0 },
    { name: 'Unplaced', value: 0 },
  ])
  const [counts, setCounts] = useState({ jobs: 0, apps: 0, offers: 0 })

  useEffect(() => {
    async function loadData() {
      const [jobsRes, profilesPlaced, profilesUnplaced, jobCount, appCount, offerCount] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('placement_status', 'Placed'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('placement_status', 'Unplaced'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('offers').select('*', { count: 'exact', head: true }),
      ])

      if (jobsRes.data) setRecentJobs(jobsRes.data as Job[])
      setPlacementStats([
        { name: 'Placed', value: profilesPlaced.count || 0 },
        { name: 'Unplaced', value: profilesUnplaced.count || 0 },
      ])
      setCounts({ jobs: jobCount.count || 0, apps: appCount.count || 0, offers: offerCount.count || 0 })
      setJobsLoading(false)
    }

    async function loadOffCampusJobs() {
      try {
        const data = await fetchOffCampusJobs({ page: 1 })
        setOffCampusJobs(data.jobs.slice(0, 3))
      } catch { /* silent */ } finally { setOffCampusLoading(false) }
    }

    loadData()
    loadOffCampusJobs()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back <span className="text-slate-900">!</span>
        </h2>
        <p className="text-muted-foreground mt-1">Here&apos;s an overview of your placement journey.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Open Positions", value: counts.jobs, icon: Briefcase, color: "from-indigo-500 to-indigo-600", shadow: "shadow-indigo-200" },
          { label: "Applications", value: counts.apps, icon: TrendingUp, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-200" },
          { label: "Offers Received", value: counts.offers, icon: Award, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-200" },
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

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Jobs */}
        <Card className="lg:col-span-4 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent On-Campus Jobs</CardTitle>
              <CardDescription>Latest opportunities from the placement cell</CardDescription>
            </div>
            <Link href="/dashboard/user/jobs">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl animate-shimmer" />)}
              </div>
            ) : recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.map((job, i) => (
                  <Link key={job.id} href={`/dashboard/user/jobs/${job.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white hover:bg-accent/30 transition-all duration-200 cursor-pointer group" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
                          <span className="badge-success px-2 py-0.5 rounded-full text-[10px] font-semibold">{job.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {job.salary}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No jobs posted yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Placement Stats */}
        <Card className="lg:col-span-3 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Placement Stats</CardTitle>
            <CardDescription>Current placement overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={placementStats} cx="50%" cy="50%" innerRadius={60} outerRadius={85} fill="#8884d8" paddingAngle={5} dataKey="value" strokeWidth={0}>
                    {placementStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Off-Campus Section */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-slate-900" />
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <CardTitle>Off-Campus Opportunities</CardTitle>
            </div>
            <CardDescription className="mt-1 ml-10">Live from LinkedIn, Indeed, Naukri &amp; more</CardDescription>
          </div>
          <Link href="/dashboard/user/offcampus">
            <Button variant="outline" size="sm" className="gap-1.5">
              Explore All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {offCampusLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl animate-shimmer" />)}
            </div>
          ) : offCampusJobs.length > 0 ? (
            <div className="space-y-3">
              {offCampusJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white hover:bg-blue-50/50 transition-all duration-200 group">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{job.title}</h3>
                      {job.remote && <span className="badge-success px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0">Remote</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      <span>• {job.postedAt}</span>
                    </div>
                  </div>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 shrink-0 ml-4">
                      <ExternalLink className="h-3.5 w-3.5" /> Apply
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Could not load off-campus jobs.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
