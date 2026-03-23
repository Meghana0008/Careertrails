"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, ExternalLink, ChevronLeft, ChevronRight, Globe, Loader2, RefreshCw, Briefcase } from "lucide-react"
import { fetchOffCampusJobs } from "@/lib/jobsApi"
import { OffCampusJob } from "@/lib/jobTypes"

export default function OffCampusPage() {
  const [jobs, setJobs] = useState<OffCampusJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOffCampusJobs({ search: debouncedSearch, page })
      setJobs(data.jobs)
      setHasMore(data.hasMore)
    } catch {
      setError("Failed to load jobs. Please try again.")
    } finally { setLoading(false) }
  }, [debouncedSearch, page])

  useEffect(() => { loadJobs() }, [loadJobs])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Off-Campus <span className="text-slate-900">Jobs</span>
            </h2>
            <p className="text-muted-foreground">Live from LinkedIn, Indeed, Naukri &amp; more</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by role, company, or skill..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent className="space-y-4">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={loadJobs} className="gap-2"><RefreshCw className="h-4 w-4" /> Retry</Button>
          </CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent>
            <p className="text-muted-foreground">{debouncedSearch ? `No jobs found for "${debouncedSearch}"` : "No jobs available right now."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job, i) => (
            <Card key={job.id} className="card-hover border-0 shadow-md group" style={{ animationDelay: `${i * 30}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 min-w-0 flex-1">
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} className="h-11 w-11 rounded-xl object-cover shrink-0 border border-border/50" />
                    ) : (
                      <div className="h-11 w-11 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
                        {job.remote && <span className="badge-success px-2 py-0.5 rounded-full text-[10px] font-semibold">Remote</span>}
                        {job.salary && job.salary !== "Not disclosed" && (
                          <span className="badge-purple px-2 py-0.5 rounded-full text-[10px] font-semibold">{job.salary}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                        <span>• {job.postedAt}</span>
                        {job.source && <span className="text-primary/60">via {job.source}</span>}
                      </div>
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {job.tags.slice(0, 4).map((tag, ti) => (
                            <span key={ti} className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800" className="gap-1.5 shrink-0">
                      <ExternalLink className="h-3.5 w-3.5" /> Apply
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && jobs.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="px-4 py-2 rounded-lg bg-muted text-sm font-medium">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasMore} className="gap-1.5">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
