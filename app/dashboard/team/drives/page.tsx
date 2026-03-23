"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, MapPin, Plus, X, Eye, Loader2, Trash2, Briefcase } from "lucide-react"
import { supabase, Drive } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"

export default function DrivesPage() {
  const { user } = useAuth()
  const [drives, setDrives] = useState<Drive[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newDrive, setNewDrive] = useState({ company: "", role: "", drive_date: "", drive_time: "", venue: "", eligible: "", description: "", package: "" })

  useEffect(() => { loadDrives() }, [])

  async function loadDrives() {
    const { data } = await supabase.from('drives').select('*').order('created_at', { ascending: false })
    if (data) setDrives(data as Drive[])
    setLoading(false)
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // 1. Insert into drives table
    const { data, error } = await supabase.from('drives').insert(newDrive).select().single()
    
    if (error) {
      alert("Error scheduling drive: " + error.message)
      setSaving(false)
      return
    }

    if (data) {
      const drive = data as Drive
      
      // 2. Also insert into 'jobs' table so students see it immediately
      const { error: jobError } = await supabase.from('jobs').insert({
        title: newDrive.role,
        company: newDrive.company,
        location: newDrive.venue,
        salary: newDrive.package || 'Not specified',
        type: 'On-Campus Drive',
        category: 'On-Campus',
        description: `**Placement Drive Scheduled**\nDate: ${newDrive.drive_date}\nTime: ${newDrive.drive_time}\nEligibility: ${newDrive.eligible}\n\n${newDrive.description}`,
        requirements: [],
        responsibilities: [],
        posted_by: user?.id
      })

      if (jobError) {
        alert("Drive scheduled, but couldn't sync to jobs board: " + jobError.message)
      }

      setDrives([drive, ...drives])
      setNewDrive({ company: "", role: "", drive_date: "", drive_time: "", venue: "", eligible: "", description: "", package: "" })
      setShowScheduleModal(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    const driveToDelete = drives.find((d) => d.id === id)
    const { error } = await supabase.from('drives').delete().eq('id', id)
    
    if (error) {
      alert("Error deleting drive: " + error.message)
      return
    }
    
    setDrives(drives.filter((d) => d.id !== id))
    
    // Also delete corresponding job best-effort
    if (driveToDelete) {
      await supabase
        .from('jobs')
        .delete()
        .match({ company: driveToDelete.company, title: driveToDelete.role, location: driveToDelete.venue })
    }
  }

  const selectedDrive = showDetailModal !== null ? drives.find((d) => d.id === showDetailModal) : null

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 rounded-lg animate-shimmer" />
        {[1, 2].map((i) => <div key={i} className="h-36 rounded-xl animate-shimmer" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Placement <span className="text-slate-900">Drives</span>
          </h2>
          <p className="text-muted-foreground mt-1">Schedule and manage upcoming drives.</p>
        </div>
        <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setShowScheduleModal(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Schedule Drive
        </Button>
      </div>

      {drives.length === 0 ? (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent><p className="text-muted-foreground">No drives scheduled yet.</p></CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drives.map((drive, i) => (
            <Card key={drive.id} className="card-hover border-0 shadow-md overflow-hidden group" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="h-1 bg-slate-900" />
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200 shrink-0">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-lg font-bold">{drive.company}</h3>
                        <p className="text-sm text-muted-foreground">{drive.role} • {drive.package}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{drive.drive_date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{drive.drive_time}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{drive.venue}</span>
                      </div>
                      <div className="inline-flex px-3 py-1 badge-info rounded-full text-xs font-medium">
                        Eligibility: {drive.eligible}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowDetailModal(drive.id)}>
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all" onClick={() => handleDelete(drive.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={() => setShowDetailModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-[520px] shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{selectedDrive.company}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Role:</span> <span className="font-medium ml-1">{selectedDrive.role}</span></div>
                <div><span className="text-muted-foreground">Package:</span> <span className="font-medium ml-1">{selectedDrive.package}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium ml-1">{selectedDrive.drive_date}</span></div>
                <div><span className="text-muted-foreground">Time:</span> <span className="font-medium ml-1">{selectedDrive.drive_time}</span></div>
                <div><span className="text-muted-foreground">Venue:</span> <span className="font-medium ml-1">{selectedDrive.venue}</span></div>
              </div>
              <div className="p-3 badge-info rounded-xl text-sm font-medium">Eligibility: {selectedDrive.eligible}</div>
              {selectedDrive.description && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedDrive.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Schedule New Drive</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowScheduleModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Company</label><Input value={newDrive.company} onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })} required placeholder="Company name" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Role</label><Input value={newDrive.role} onChange={(e) => setNewDrive({ ...newDrive, role: e.target.value })} required placeholder="e.g. SDE" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Package</label><Input value={newDrive.package} onChange={(e) => setNewDrive({ ...newDrive, package: e.target.value })} required placeholder="e.g. 12 LPA" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Date</label><Input type="date" value={newDrive.drive_date} onChange={(e) => setNewDrive({ ...newDrive, drive_date: e.target.value })} required /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Time</label><Input value={newDrive.drive_time} onChange={(e) => setNewDrive({ ...newDrive, drive_time: e.target.value })} required placeholder="10:00 AM" /></div>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">Venue</label><Input value={newDrive.venue} onChange={(e) => setNewDrive({ ...newDrive, venue: e.target.value })} required placeholder="Main Auditorium" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Eligibility</label><Input value={newDrive.eligible} onChange={(e) => setNewDrive({ ...newDrive, eligible: e.target.value })} required placeholder="CSE, ECE (CGPA > 8.0)" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Description</label>
                <textarea className="flex w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm min-h-[80px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 hover:border-primary/30" value={newDrive.description} onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })} placeholder="Drive details..." />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800" className="flex-1" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
