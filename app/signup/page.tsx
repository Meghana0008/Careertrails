"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle2, Sparkles, ArrowRight, GraduationCap, Shield } from "lucide-react"

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState<"user" | "team">("user")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const result = await signup(name, email, password, activeTab)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Navigate based on role
      const dest = result.role === 'team' ? '/dashboard/team' : '/dashboard/user'
      router.push(dest)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-[440px] animate-slide-up">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-2">Select your role and get started today</p>
        </div>

        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6 md:p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 text-sm text-red-600 rounded-lg animate-scale-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("user")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  activeTab === "user"
                    ? "border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900 ring-offset-0"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className={`h-5 w-5 ${activeTab === "user" ? "text-slate-900" : "text-slate-500"}`} />
                <span className={`text-sm font-medium ${activeTab === "user" ? "text-slate-900" : "text-slate-500"}`}>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("team")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  activeTab === "team"
                    ? "border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900 ring-offset-0"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Shield className={`h-5 w-5 ${activeTab === "team" ? "text-slate-900" : "text-slate-500"}`} />
                <span className={`text-sm font-medium ${activeTab === "team" ? "text-slate-900" : "text-slate-500"}`}>Placement Team</span>
              </button>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  disabled={isLoading} 
                  className="rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:ring-1"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isLoading} 
                  className="rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:ring-1"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Minimum 6 characters" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={isLoading} 
                  className="rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:ring-1"
                />
              </div>
              <Button type="submit" className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white mt-4" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-slate-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
