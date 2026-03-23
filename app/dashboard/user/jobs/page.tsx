"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Clock, CheckCircle2, Loader2, ArrowRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { supabase, Job } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadData() {
      const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
      if (jobsData) setJobs(jobsData as Job[])
      if (user) {
        const { data: apps } = await supabase.from('applications').select('job_id').eq('user_id', user.id)
        if (apps) setAppliedJobIds(apps.map((a) => a.job_id))
      }
      setLoading(false)
    }
    loadData()
  }, [user])

  const handleApply = async (e: React.MouseEvent, jobId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || appliedJobIds.includes(jobId)) return
    setApplyingId(jobId)
    const { error } = await supabase.from('applications').insert({ user_id: user.id, job_id: jobId, status: 'Under Review' })
    if (!error) setAppliedJobIds([...appliedJobIds, jobId])
    setApplyingId(null)
  }

  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase()
    return j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 rounded-lg animate-shimmer" />
        <div className="h-11 max-w-sm rounded-lg animate-shimmer" />
        {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl animate-shimmer" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Browse <span className="text-slate-900">Jobs</span>
        </h2>
        <p className="text-muted-foreground mt-1">Explore on-campus positions and apply directly.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by title, company, or location..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {filteredJobs.length === 0 ? (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent>
            <p className="text-muted-foreground">{searchQuery ? `No jobs matching "${searchQuery}"` : "No jobs posted yet. Check back later!"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job, i) => {
            const isApplied = appliedJobIds.includes(job.id)
            const isApplying = applyingId === job.id
            return (
              <Link key={job.id} href={`/dashboard/user/jobs/${job.id}`}>
                <Card className="card-hover border-0 shadow-md group cursor-pointer" style={{ animationDelay: `${i * 50}ms` }}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${job.category === "On-Campus" ? "badge-success" : "badge-info"}`}>
                            {job.category}
                          </span>
                        </div>
                        <p className="text-muted-foreground font-medium">{job.company}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                          <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> {job.salary}</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {job.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground/80 line-clamp-1 mt-1">{job.description}</p>
                      </div>
                      <div className="shrink-0 ml-4">
                        {isApplied ? (
                          <Button disabled variant="outline" size="sm" className="gap-2 border-emerald-200 text-emerald-700 bg-emerald-50">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                          </Button>
                        ) : (
                          <Button onClick={(e) => handleApply(e, job.id)} disabled={isApplying} size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                            {isApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
