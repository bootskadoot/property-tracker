import { createContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      // Add a 10-second timeout as safety net
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      )

      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Error fetching user profile (timeout or error):', err)
      // Return null instead of hanging - user can still use app
      return null
    }
  }

  // Refresh user profile (used after onboarding)
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
    }
  }

  // Check active session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error checking user session:', error)
        // Don't block the app - continue with no user
      } finally {
        // ALWAYS set loading to false, even if there's an error
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      // Only fetch profile on actual sign-in events, not on every tab focus
      // This prevents unnecessary refetches when switching tabs
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        const profile = await fetchUserProfile(session.user.id)
        setUserProfile(profile)
      } else if (!session?.user) {
        setUserProfile(null)
      }
      // If event is 'TOKEN_REFRESHED', keep existing profile - don't refetch
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (data.user && !error) {
      // User profile will be created automatically by database trigger
      // Wait a moment for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      const profile = await fetchUserProfile(data.user.id)
      setUserProfile(profile)
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
