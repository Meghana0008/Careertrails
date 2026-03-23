"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Loader2, DollarSign, Calendar, Briefcase, Trophy } from "lucide-react"
import { supabase, Offer } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"

const statusStyle: Record<string, string> = {
  Accepted: "badge-success",
  Declined: "badge-danger",
  Pending: "badge-warning",
}

export default function OffersPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOffers() {
      if (!user) return
      const { data } = await supabase.from('offers').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (data) setOffers(data as Offer[])
      setLoading(false)
    }
    loadOffers()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 rounded-lg animate-shimmer" />
        {[1, 2].map((i) => <div key={i} className="h-32 rounded-xl animate-shimmer" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Your <span className="text-slate-900">Offers</span>
        </h2>
        <p className="text-muted-foreground mt-1">Congratulations on your achievements!</p>
      </div>

      {offers.length > 0 ? (
        <div className="grid gap-4">
          {offers.map((offer, i) => (
            <Card key={offer.id} className="card-hover border-0 shadow-md overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-1 bg-linear-to-r from-emerald-400 to-teal-500" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">{offer.company}</h3>
                      <p className="text-muted-foreground font-medium">{offer.role}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> {offer.salary}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {offer.offer_date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyle[offer.status] || "badge-warning"}`}>
                      {offer.status}
                    </span>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Letter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-md text-center py-16">
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">No offers yet</p>
              <p className="text-sm text-muted-foreground">Keep applying — great things are coming!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
