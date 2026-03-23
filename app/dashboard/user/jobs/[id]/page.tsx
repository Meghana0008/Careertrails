"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, DollarSign, Clock, Building2, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, Job } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [isApplied, setIsApplied] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)

  useEffect(() => {
    async function loadJob() {
      const { data } = await supabase.from('jobs').select('*').eq('id', parseInt(id)).single()
      if (data) setJob(data as Job)
      if (user) {
        const { data: app } = await supabase.from('applications').select('id').eq('user_id', user.id).eq('job_id', parseInt(id)).single()
        if (app) setIsApplied(true)
      }
      setLoading(false)
    }
    loadJob()
  }, [id, user])

  const handleApply = async () => {
    if (!user || isApplied) return
    setApplyLoading(true)
    const { error } = await supabase.from('applications').insert({ user_id: user.id, job_id: parseInt(id), status: 'Under Review' })
    if (!error) setIsApplied(true)
    setApplyLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-24 rounded-lg animate-shimmer" />
        <div className="h-12 w-80 rounded-lg animate-shimmer" />
        <div className="h-96 rounded-xl animate-shimmer" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-xl font-semibold text-muted-foreground">Job not found</h2>
        <Link href="/dashboard/user/jobs" className="text-primary hover:underline mt-2 inline-block">Back to Jobs</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/dashboard/user/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${job.category === "On-Campus" ? "badge-success" : "badge-info"}`}>
                {job.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-lg text-muted-foreground">
              <Building2 className="h-5 w-5" />
              {job.company}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { icon: MapPin, label: job.location },
              { icon: DollarSign, label: job.salary },
              { icon: Clock, label: job.type },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {item.label}
                </div>
              )
            })}
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-md overflow-hidden sticky top-8">
            <div className="h-1 bg-slate-900" />
            <CardHeader>
              <CardTitle>Apply Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isApplied ? (
                <Button disabled className="w-full gap-2 badge-success border-0" size="lg">
                  <CheckCircle2 className="h-5 w-5" /> Already Applied
                </Button>
              ) : (
                <Button className="bg-slate-900 text-white hover:bg-slate-800" className="w-full gap-2" size="lg" onClick={handleApply} disabled={applyLoading}>
                  {applyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Apply for this Job
                </Button>
              )}
              <p className="text-xs text-center text-muted-foreground">
                Your profile will be shared with {job.company}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
