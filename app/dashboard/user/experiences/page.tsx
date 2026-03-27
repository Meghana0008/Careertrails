"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MessageSquare, Send, Building2, Briefcase, Trash2, CheckCircle, XCircle, Clock, Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import { supabase, InterviewExperience } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"

const resultConfig: Record<string, { bg: string; icon: any }> = {
  "Selected": { bg: "badge-success", icon: CheckCircle },
  "Rejected": { bg: "badge-danger", icon: XCircle },
  "Pending": { bg: "badge-warning", icon: Clock },
}

export default function ExperiencesPage() {
  const { user } = useAuth()
  const [experiences, setExperiences] = useState<InterviewExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [form, setForm] = useState({
    company: "", role: "", type: "On-Campus" as "On-Campus" | "Off-Campus",
    rounds: "", experience: "", result: "Selected" as "Selected" | "Rejected" | "Pending", tips: "",
  })

  useEffect(() => { loadExperiences() }, [])

  async function loadExperiences() {
    const { data } = await supabase
      .from('interview_experiences')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
    if (data) setExperiences(data as InterviewExperience[])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)

    const { error } = await supabase.from('interview_experiences').insert({
      user_id: user.id,
      company: form.company,
      role: form.role,
      type: form.type,
      rounds: form.rounds,
      experience: form.experience,
      result: form.result,
      tips: form.tips,
    })

    if (!error) {
      setForm({ company: "", role: "", type: "On-Campus", rounds: "", experience: "", result: "Selected", tips: "" })
      setShowForm(false)
      await loadExperiences()
    }
    setSubmitting(false)
  }

  async function handleDelete(id: number) {
    const { error } = await supabase.from('interview_experiences').delete().eq('id', id)
    if (!error) setExperiences(experiences.filter((e) => e.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Interview <span className="text-slate-900">Experiences</span>
            </h2>
            <p className="text-muted-foreground">Share and learn from real interview experiences.</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={`gap-2 ${showForm ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          {showForm ? <>Cancel</> : <><Send className="h-4 w-4" /> Share Experience</>}
        </Button>
      </div>

      {/* Post Form */}
      {showForm && (
        <Card className="border-0 shadow-md overflow-hidden animate-fade-in">
          <div className="h-1 bg-linear-to-r from-orange-500 to-pink-500" />
          <CardHeader>
            <CardTitle className="text-lg">Share Your Interview Experience</CardTitle>
            <CardDescription>Help others prepare — share what the process was like.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company *</label>
                  <Input placeholder="e.g. TechCorp" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role *</label>
                  <Input placeholder="e.g. Software Engineer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="On-Campus">On-Campus</option>
                    <option value="Off-Campus">Off-Campus</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Result *</label>
                  <select
                    value={form.result}
                    onChange={(e) => setForm({ ...form, result: e.target.value as any })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rounds *</label>
                  <Input placeholder="e.g. Aptitude → Technical → HR" value={form.rounds} onChange={(e) => setForm({ ...form, rounds: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Experience *</label>
                <textarea
                  placeholder="Describe your interview process, questions asked, difficulty level, etc."
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  required
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tips for Others (optional)</label>
                <textarea
                  placeholder="Any tips, resources, or advice for future candidates?"
                  value={form.tips}
                  onChange={(e) => setForm({ ...form, tips: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Post Experience
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Experience Posts */}
      {experiences.length === 0 ? (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent>
            <div className="space-y-2">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-lg font-medium text-muted-foreground">No experiences shared yet</p>
              <p className="text-sm text-muted-foreground">Be the first to share your interview experience!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, i) => {
            const config = resultConfig[exp.result] || resultConfig["Pending"]
            const ResultIcon = config.icon
            const isExpanded = expandedId === exp.id
            const isOwner = user?.id === exp.user_id

            return (
              <Card key={exp.id} className="card-hover border-0 shadow-md overflow-hidden" style={{ animationDelay: `${i * 40}ms` }}>
                <CardContent className="p-0">
                  {/* Post Header */}
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
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              {exp.company}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" />
                              {exp.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg}`}>
                              <ResultIcon className="h-3 w-3" />
                              {exp.result}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${exp.type === 'On-Campus' ? 'badge-purple' : 'badge-info'}`}>
                              {exp.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); handleDelete(exp.id) }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
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
