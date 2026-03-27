"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Building2, Globe, Mail, Plus, X, Loader2, Trash2 } from "lucide-react"
import { supabase, Company } from "@/lib/supabase"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newCompany, setNewCompany] = useState({ name: "", industry: "", contact: "", website: "", status: "Active" })

  useEffect(() => { loadCompanies() }, [])

  async function loadCompanies() {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
    if (data) setCompanies(data as Company[])
    setLoading(false)
  }

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
  })

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase.from('companies').insert(newCompany).select().single()
    if (!error && data) {
      setCompanies([data as Company, ...companies])
      setNewCompany({ name: "", industry: "", contact: "", website: "", status: "Active" })
      setShowAddModal(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (!error) setCompanies(companies.filter((c) => c.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 rounded-lg animate-shimmer" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl animate-shimmer" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="text-slate-900">Companies</span>
          </h2>
          <p className="text-muted-foreground mt-1">Manage recruiting partners.</p>
        </div>
        <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search companies..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {filteredCompanies.length === 0 ? (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent>
            <p className="text-muted-foreground">{searchQuery ? `No companies matching "${searchQuery}"` : "No companies added yet."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company, i) => (
            <Card key={company.id} className="card-hover border-0 shadow-md overflow-hidden group" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="h-1 bg-linear-to-r from-violet-500 to-purple-600" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-violet-200">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{company.name}</h3>
                      <p className="text-xs text-muted-foreground">{company.industry}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all" onClick={() => handleDelete(company.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {company.contact}</div>
                  <div className="flex items-center gap-2 text-primary"><Globe className="h-3.5 w-3.5" /> {company.website}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${company.status === "Active" ? "badge-success" : "badge-warning"}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${company.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {company.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-[440px] shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add New Company</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} required placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input value={newCompany.industry} onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })} required placeholder="e.g. IT Services" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input type="email" value={newCompany.contact} onChange={(e) => setNewCompany({ ...newCompany, contact: e.target.value })} required placeholder="hr@company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input value={newCompany.website} onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })} required placeholder="company.com" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-slate-900 text-white hover:bg-slate-800" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Add Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
