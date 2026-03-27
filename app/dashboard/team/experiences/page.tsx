"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MessageSquare, Building2, Briefcase, CheckCircle, XCircle, Clock, Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import { supabase, InterviewExperience } from "@/lib/supabase"

const resultConfig: Record<string, { bg: string; icon: any }> = {
  "Selected": { bg: "badge-success", icon: CheckCircle },
  "Rejected": { bg: "badge-danger", icon: XCircle },
  "Pending": { bg: "badge-warning", icon: Clock },
}

export default function TeamExperiencesPage() {
  const [experiences, setExperiences] = useState<InterviewExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('interview_experiences')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
      if (data) setExperiences(data as InterviewExperience[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Interview <span className="text-slate-900">Experiences</span>
          </h2>
          <p className="text-muted-foreground">Student-submitted interview experiences.</p>
        </div>
      </div>

      {experiences.length === 0 ? (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent>
            <div className="space-y-2">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-lg font-medium text-muted-foreground">No experiences shared yet</p>
              <p className="text-sm text-muted-foreground">Students have not shared any interview experiences yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, i) => {
            const config = resultConfig[exp.result] || resultConfig["Pending"]
            const ResultIcon = config.icon
            const isExpanded = expandedId === exp.id

            return (
              <Card key={exp.id} className="card-hover border-0 shadow-md overflow-hidden" style={{ animationDelay: `${i * 40}ms` }}>
                <CardContent className="p-0">
                  <div
                    className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {exp.profiles?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{exp.profiles?.name || "Anonymous"}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(exp.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" /> {exp.company}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" /> {exp.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg}`}>
                              <ResultIcon className="h-3 w-3" /> {exp.result}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${exp.type === 'On-Campus' ? 'badge-purple' : 'badge-info'}`}>
                              {exp.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-border/30 animate-fade-in">
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Interview Rounds</p>
                          <p className="text-sm bg-muted/50 rounded-lg p-3 border border-border/30">{exp.rounds}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Interview Experience</p>
                          <div className="text-sm bg-muted/50 rounded-lg p-3 border border-border/30 whitespace-pre-wrap">{exp.experience}</div>
                        </div>
                        {exp.tips && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Tips
                            </p>
                            <div className="text-sm bg-amber-50 rounded-lg p-3 border border-amber-100 whitespace-pre-wrap">{exp.tips}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
