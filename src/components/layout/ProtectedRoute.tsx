import { useAuth } from "@/context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"
import { LucideLoader2 } from "lucide-react"

export default function ProtectedRoute() {
    const { session, loading } = useAuth()

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-heritage-sand/10 dark:bg-zinc-950">
                <LucideLoader2 className="w-8 h-8 animate-spin text-heritage-navy dark:text-white" />
            </div>
        )
    }

    if (!session) {
        return <Navigate to="/auth" replace />
    }

    return <Outlet />
}
