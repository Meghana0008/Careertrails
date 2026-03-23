"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

type UserRole = 'user' | 'team'

interface AuthResult {
  error: string | null
  role?: UserRole
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  role: UserRole | null
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<AuthResult>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Build a profile object from auth user data
function buildProfile(authUser: User, name?: string, userRole?: UserRole): Profile {
  return {
    id: authUser.id,
    name: name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    role: userRole || (authUser.user_metadata?.role as UserRole) || 'user',
    branch: '',
    cgpa: '',
    placement_status: 'Unplaced',
    created_at: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Try to load profile from DB, fall back to in-memory
  const loadProfile = async (authUser: User, fallbackName?: string, fallbackRole?: UserRole): Promise<Profile> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (data && !error) {
        const prof = data as Profile
        setProfile(prof)
        setRole(prof.role as UserRole)
        return prof
      }
    } catch {
      // DB call failed — use fallback
    }

    // Fallback: build from auth metadata
    const prof = buildProfile(authUser, fallbackName, fallbackRole)
    setProfile(prof)
    setRole(prof.role)

    // Try to save to DB (non-blocking, won't crash if table missing)
    supabase.from('profiles').upsert(prof, { onConflict: 'id' }).then(() => {})

    return prof
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user)
        }
      } catch {
        // Silent fail
      }
      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user)
        } else {
          setUser(null)
          setProfile(null)
          setRole(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        setUser(data.user)
        const prof = await loadProfile(data.user)
        return { error: null, role: prof.role }
      }

      return { error: 'Login failed. Please try again.' }
    } catch (err: any) {
      return { error: err?.message || 'An unexpected error occurred.' }
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    selectedRole: UserRole
  ): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: selectedRole },
        },
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        setUser(data.user)
        await loadProfile(data.user, name, selectedRole)

        // If session exists, auto-confirm is ON → user can proceed
        if (data.session) {
          return { error: null, role: selectedRole }
        }

        // No session = email verification required, but we still return success
        return { error: null, role: selectedRole }
      }

      return { error: 'Signup failed. Please try again.' }
    } catch (err: any) {
      return { error: err?.message || 'An unexpected error occurred.' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setRole(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, profile, role, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
