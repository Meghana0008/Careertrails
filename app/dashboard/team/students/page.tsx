"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Users } from "lucide-react"
import { supabase, Profile } from "@/lib/supabase"

export default function StudentsPage() {
  const [students, setStudents] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStudents() }, [])

  async function loadStudents() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'user').order('created_at', { ascending: false })
    if (data) setStudents(data as Profile[])
    setLoading(false)
  }

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.branch.toLowerCase().includes(q)
  })

  const handleUpdateStatus = async (id: string, newStatus: 'Placed' | 'Unplaced') => {
    const { error } = await supabase.from('profiles').update({ placement_status: newStatus }).eq('id', id)
    if (!error) setStudents(students.map((s) => s.id === id ? { ...s, placement_status: newStatus } : s))
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 rounded-lg animate-shimmer" />
        <div className="h-11 max-w-sm rounded-lg animate-shimmer" />
        <div className="h-96 rounded-xl animate-shimmer" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="text-slate-900">Students</span>
          </h2>
          <p className="text-muted-foreground mt-1">Manage student data and placement status.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full badge-purple text-sm font-semibold">
          <Users className="h-4 w-4" /> {students.length} total
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        {searchQuery && <span className="absolute right-3 top-3 text-xs text-muted-foreground">{filteredStudents.length} found</span>}
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-slate-900" />
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Branch</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">CGPA</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="h-12 px-5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {student.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-5 text-muted-foreground">{student.email}</td>
                    <td className="p-5">{student.branch || "—"}</td>
                    <td className="p-5">{student.cgpa || "—"}</td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${student.placement_status === "Placed" ? "badge-success" : "badge-warning"}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${student.placement_status === "Placed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {student.placement_status}
                      </span>
                    </td>
                    <td className="p-5">
                      <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(student.id, student.placement_status === 'Placed' ? 'Unplaced' : 'Placed')}>
                        {student.placement_status === 'Placed' ? 'Mark Unplaced' : 'Mark Placed'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">{searchQuery ? `No students found matching "${searchQuery}"` : "No students registered yet."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
