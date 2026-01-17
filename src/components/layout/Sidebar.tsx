import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import {
    LucideLayoutDashboard,
    LucideFiles,
    LucideVote,
    LucideCalendar,
    LucideUserCircle,
    LucideLogOut,
    LucideShield
} from "lucide-react"

const baseMenuItems = [
    { label: "Painel Geral", icon: LucideLayoutDashboard, path: "/dashboard" },
    { label: "Documentos", icon: LucideFiles, path: "/docs" },
    { label: "Votação", icon: LucideVote, path: "/voting" },
    { label: "Eventos", icon: LucideCalendar, path: "/events" },
    { label: "Meus Dados", icon: LucideUserCircle, path: "/profile" },
]

export default function Sidebar() {
    const location = useLocation()
    const { profile, signOut } = useAuth()

    // Adiciona link de Admin se o usuário for admin
    const menuItems = profile?.role === 'admin'
        ? [...baseMenuItems, { label: "Administração", icon: LucideShield, path: "/admin" }]
        : baseMenuItems

    return (
        <aside className="w-80 hidden lg:flex flex-col bg-white dark:bg-zinc-900 border-r border-heritage-navy/5 dark:border-white/5 h-screen sticky top-0 pt-28 pb-10 px-6 transition-colors">
            <div className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-300",
                                isActive
                                    ? "bg-heritage-navy dark:bg-heritage-gold text-white dark:text-heritage-navy shadow-lg shadow-heritage-navy/20 dark:shadow-heritage-gold/20"
                                    : "text-heritage-navy/60 dark:text-white/60 hover:bg-heritage-sand dark:hover:bg-zinc-800 hover:text-heritage-navy dark:hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-heritage-gold dark:text-heritage-navy" : "")} />
                            {item.label}
                        </Link>
                    )
                })}
            </div>

            <div className="pt-6 border-t border-heritage-navy/5 dark:border-white/10 space-y-4">
                <div className="bg-heritage-sand/50 dark:bg-zinc-800 p-6 rounded-3xl text-center">
                    <p className="text-sm font-bold text-heritage-navy dark:text-white mb-2">Suporte Direto</p>
                    <p className="text-xs text-heritage-navy/40 dark:text-white/40 mb-4">Dúvida sobre as suas quotas?</p>
                    <Link to="/help" className="text-xs font-bold text-heritage-terracotta hover:underline">
                        Falar com a Direção
                    </Link>
                </div>

                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-4 px-4 py-3 w-full text-heritage-navy/40 dark:text-white/40 hover:text-heritage-terracotta font-bold transition-colors"
                >
                    <LucideLogOut className="w-5 h-5" />
                    Sair do Portal
                </button>
            </div>
        </aside>
    )
}
