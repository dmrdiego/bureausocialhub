import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LucideLoader2 } from 'lucide-react'

// This component wraps the app content to enforce onboarding rules
export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { session, profile, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (loading) return

        // 1. If user is logged in
        if (session && profile) {
            // 2. If role is pending and NOT on onboarding page -> Redirect to onboarding
            if (profile.role === 'pending' && location.pathname !== '/onboarding') {
                navigate('/onboarding')
            }

            // 3. If role is NOT pending (member/admin) and ON onboarding page -> Redirect to dashboard
            if (profile.role !== 'pending' && location.pathname === '/onboarding') {
                navigate('/dashboard')
            }
        }
    }, [session, profile, loading, location.pathname, navigate])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-heritage-sand/30 dark:bg-zinc-950">
                <LucideLoader2 className="w-10 h-10 text-heritage-navy animate-spin" />
            </div>
        )
    }

    return <>{children}</>
}
