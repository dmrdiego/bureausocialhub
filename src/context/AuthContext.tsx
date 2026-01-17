import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface Profile {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'member' | 'pending'
    quota_status: 'active' | 'late' | 'pending'
    quota_next_due?: string
    nif?: string
    phone?: string
    member_category?: 'fundador' | 'efetivo' | 'contribuinte' | 'voluntario' | 'profissional' | 'benemerito' | 'patrocinador' | 'institucional'
    created_at: string
}

interface AuthContextType {
    session: Session | null
    user: User | null
    profile: Profile | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const refreshProfile = async () => {
        if (session?.user) {
            await fetchProfile(session.user.id)
        }
    }

    useEffect(() => {
        // Obter sessão inicial
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
            } catch (error) {
                console.error("Erro na inicialização da auth:", error)
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        // Escutar mudanças de auth
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
