import { Button } from "@/components/ui/button"
import { LucideMenu, LucideGlobe, LucideX, LucideLayoutDashboard, LucideFiles, LucideVote, LucideCalendar, LucideUserCircle } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "../ThemeToggle"
import { useAuth } from "@/context/AuthContext"

export default function Navbar() {
    const location = useLocation()
    const [scrolled, setScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { session } = useAuth()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    const mainLinks = [
        { name: "Associação", path: "/about" },
        { name: "Projetos", path: "/project" },
        { name: "Tradições", path: "/traditions" },
        { name: "Transparência", path: "/docs" },
    ]

    const dashboardLinks = [
        { name: "Painel Geral", path: "/dashboard", icon: LucideLayoutDashboard },
        { name: "Documentos", path: "/docs", icon: LucideFiles },
        { name: "Votação", path: "/voting", icon: LucideVote },
        { name: "Eventos", path: "/events", icon: LucideCalendar },
        { name: "Meus Dados", path: "/profile", icon: LucideUserCircle },
    ]

    const isActive = (path: string) => location.pathname === path

    return (
        <>
            <nav className={cn(
                "fixed top-0 w-full z-50 transition-apple h-24 flex items-center px-6",
                scrolled || isMobileMenuOpen
                    ? "bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl border-b border-heritage-navy/5 dark:border-white/5 shadow-sm"
                    : "bg-transparent"
            )}>
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 relative z-[60]">
                        <img src="/logo-symbol.png" alt="Logo" className="w-12 h-12 object-contain" />
                        <div className="flex flex-col">
                            <span className="text-heritage-navy dark:text-white font-black text-lg tracking-tighter leading-none">Bureau Social</span>
                            <span className="text-heritage-terracotta text-[9px] font-black uppercase tracking-[0.2em]">IPSS Lisboa</span>
                        </div>
                    </Link>

                    <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-widest text-heritage-navy/80 dark:text-white/60">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "hover:text-heritage-terracotta dark:hover:text-white transition-colors relative py-1",
                                    isActive(link.path) && "text-heritage-terracotta dark:text-white"
                                )}
                            >
                                {link.name}
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-heritage-terracotta dark:bg-white"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </Link>
                        ))}

                        <div className="h-6 w-px bg-heritage-navy/10 dark:bg-white/10 mx-2" />

                        <div className="flex items-center gap-4">
                            <motion.a
                                href="https://donate.stripe.com/test_demo"
                                target="_blank"
                                className="text-heritage-terracotta hover:text-heritage-terracotta/80 transition-colors flex items-center gap-1.5 mr-2 group"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-heritage-terracotta animate-pulse" />
                                <span>Doe Agora</span>
                            </motion.a>
                            <div className="flex items-center gap-2 cursor-pointer hover:text-heritage-terracotta dark:hover:text-white transition-colors group">
                                <LucideGlobe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                <span>PT</span>
                            </div>
                            <ThemeToggle />
                        </div>

                        {session ? (
                            <Link to="/dashboard">
                                <Button variant="default" className="bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-white rounded-xl px-6 h-11 font-black border-none text-[11px] uppercase tracking-widest shadow-lg shadow-heritage-terracotta/20 transition-apple hover:-translate-y-0.5 active:translate-y-0">
                                    Portal Ativo
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/auth">
                                <Button variant="default" className="bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-white rounded-xl px-6 h-11 font-black border-none text-[11px] uppercase tracking-widest shadow-lg shadow-heritage-terracotta/20 transition-apple hover:-translate-y-0.5 active:translate-y-0">
                                    Acesso Associado
                                </Button>
                            </Link>

                        )}
                    </div>

                    <div className="flex lg:hidden items-center gap-4 relative z-[60]">
                        <ThemeToggle />
                        <button
                            className="p-2 text-heritage-navy dark:text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <LucideX className="w-8 h-8" /> : <LucideMenu className="w-8 h-8" />}
                        </button>
                    </div>
                </div>
            </nav >

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed inset-0 z-[55] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl flex flex-col pt-32 px-10 overflow-y-auto pb-10"
                    >
                        <div className="flex flex-col gap-6 text-center mt-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-navy/20 dark:text-white/20 mb-2">Navegação Principal</span>
                            {mainLinks.map((link, i) => (
                                <motion.div
                                    key={link.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 + 0.1 }}
                                >
                                    <Link
                                        to={link.path}
                                        className={cn(
                                            "text-2xl font-black uppercase tracking-tighter text-heritage-navy/40 dark:text-white/40 hover:text-heritage-navy dark:hover:text-white transition-colors",
                                            isActive(link.path) && "text-heritage-navy dark:text-white"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}

                            <div className="h-px bg-heritage-navy/5 dark:bg-white/5 w-20 mx-auto my-4" />

                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-navy/20 dark:text-white/20 mb-2">Área do Associado</span>
                            <div className="grid grid-cols-1 gap-3">
                                {dashboardLinks.map((link, i) => (
                                    <motion.div
                                        key={link.path}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.05) }}
                                    >
                                        <Link
                                            to={link.path}
                                            className={cn(
                                                "flex items-center justify-center gap-3 py-3 rounded-2xl font-bold text-sm transition-apple",
                                                isActive(link.path)
                                                    ? "bg-heritage-navy dark:bg-white text-white dark:text-heritage-navy shadow-lg shadow-heritage-navy/10"
                                                    : "text-heritage-navy/40 dark:text-white/40 hover:bg-heritage-sand dark:hover:bg-zinc-900 hover:text-heritage-navy dark:hover:text-white"
                                            )}
                                        >
                                            <link.icon className="w-4 h-4" />
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
