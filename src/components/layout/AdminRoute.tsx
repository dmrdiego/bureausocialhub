import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * AdminRoute - Rota protegida para administradores
 * Verifica se o usuário está logado E se tem role 'admin'
 * Redireciona para /dashboard se não tiver permissão
 */
export default function AdminRoute() {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 rounded-full border-4 border-heritage-navy/20 border-t-heritage-terracotta animate-spin" />
            </div>
        )
    }

    // Se não está logado, redireciona para auth
    if (!user) {
        return <Navigate to="/auth" replace />
    }

    // Se não é admin, redireciona para dashboard
    if (profile?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
