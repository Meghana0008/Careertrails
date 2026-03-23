"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await login(email, password)

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
      <div className="w-full max-w-[400px] animate-slide-up">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in to Careertrails</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your credentials to continue</p>
        </div>

        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 text-sm text-red-600 rounded-lg animate-scale-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                  <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 hover:underline">Forgot password?</Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={isLoading}
                  className="rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:ring-1"
                />
              </div>
              <Button type="submit" className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white mt-2" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-slate-900 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
