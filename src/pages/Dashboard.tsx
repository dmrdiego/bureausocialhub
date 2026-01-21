import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { LucideTrendingUp, LucideCreditCard, LucideCalendar, LucideVote } from "lucide-react"
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"

const data = [
    { name: 'Jan', value: 400 },
    { name: 'Fev', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Abr', value: 450 },
    { name: 'Mai', value: 600 },
    { name: 'Jun', value: 550 },
]

export default function Dashboard() {
    const { theme } = useTheme();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const isDark = theme === "dark";
    const [candidatura, setCandidatura] = useState<any>(null)
    const [activeAssembly, setActiveAssembly] = useState<{ id: string, title: string } | null>(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Fetch Active Assembly
            const { data: assemblyData } = await supabase
                .from('assemblies')
                .select('id, title')
                .eq('status', 'open_for_voting')
                .single()
            if (assemblyData) setActiveAssembly(assemblyData)

            // Fetch Candidatura Status
            if (user) {
                const { data: appData } = await supabase
                    .from('candidaturas')
                    .select('*')
                    .eq('user_id', user.id)
                    .single() // Assuming one active application per user

                if (appData) setCandidatura(appData)
            }
        }
        fetchDashboardData()
    }, [user])

    const displayName = profile?.full_name || user?.email?.split('@')[0] || "Visitante";
    const displayRole = profile?.role === 'admin' ? 'Administrador' : (profile?.role === 'member' ? 'Membro Confirmado' : 'Visitante / Pendente');

    // Dynamic Quota Logic
    const quotaStatus = profile?.quota_status === 'active' ? 'Em dia' : (profile?.quota_status === 'late' ? 'Em atraso' : 'Pendente')
    const quotaColor = profile?.quota_status === 'active' ? 'text-heritage-success' : (profile?.quota_status === 'late' ? 'text-red-500' : 'text-heritage-gold')
    const quotaNext = profile?.quota_next_due ? new Date(profile.quota_next_due).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) : 'Indefinido'

    return (
        <div className="space-y-10 transition-apple animate-in fade-in duration-700">
            {/* Header - Apple Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-heritage-navy dark:text-white tracking-tighter transition-apple">
                        Bem-vindo, <span className="text-heritage-terracotta">{displayName}</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-heritage-success/20 text-heritage-success border-heritage-success/30 px-3 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase">
                            {displayRole}
                        </Badge>
                        <span className="text-heritage-navy/30 dark:text-white/20 text-xs font-black uppercase tracking-widest">• Status: Ativo</span>
                    </div>
                </div>
                <div className="glass-card px-6 py-3 rounded-2xl border-none shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-heritage-gold animate-pulse" />
                    <span className="text-xs font-black text-heritage-navy/60 dark:text-white/60 uppercase tracking-widest">Desde Janeiro 2025</span>
                </div>
            </div>

            {/* Active Assembly Alert Widget */}
            {activeAssembly && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-1 rounded-[32px] bg-gradient-to-r from-heritage-terracotta via-heritage-gold to-heritage-terracotta animate-gradient-xy"
                >
                    <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-heritage-terracotta/10 flex items-center justify-center shrink-0">
                                <div className="w-3 h-3 bg-heritage-terracotta rounded-full animate-ping" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-heritage-navy dark:text-white flex items-center gap-3">
                                    Assembleia a Decorrer
                                    <Badge variant="destructive" className="uppercase text-[10px]">Ao Vivo</Badge>
                                </h3>
                                <p className="text-heritage-navy/60 dark:text-white/60 font-medium">
                                    {activeAssembly.title} - A votação está aberta.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate('/assembleia/live')}
                            className="w-full md:w-auto px-8 h-14 rounded-2xl bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-white font-black text-lg shadow-lg hover:shadow-xl hover:shadow-heritage-terracotta/20 transition-all"
                        >
                            Entrar na Sala de Votação
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Candidatura Status Widget */}
            {candidatura && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-1 rounded-[32px] bg-gradient-to-r from-heritage-ocean via-heritage-success to-heritage-ocean animate-gradient-xy mb-8"
                >
                    <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-heritage-ocean/10 flex items-center justify-center shrink-0">
                                <LucideCreditCard className="w-8 h-8 text-heritage-ocean" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-heritage-navy dark:text-white flex items-center gap-3">
                                    Candidatura Recebida
                                    <Badge className="bg-heritage-ocean text-white uppercase text-[10px]">Em Análise</Badge>
                                </h3>
                                <p className="text-heritage-navy/60 dark:text-white/60 font-medium">
                                    Processo #{candidatura.id.substring(0, 8).toUpperCase()} • Submetido em {new Date(candidatura.created_at).toLocaleDateString()}.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate(`/candidatura/${candidatura.id}`)}
                            variant="outline"
                            className="w-full md:w-auto px-8 h-14 rounded-2xl border-heritage-ocean/20 text-heritage-ocean font-black text-lg hover:bg-heritage-ocean/10 transition-all"
                        >
                            Ver Detalhes
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Quotas", val: quotaStatus, sub: `Próximo: ${quotaNext}`, icon: LucideCreditCard, color: quotaColor },
                    { title: "Impacto CO2", val: "120kg", sub: "+12% este mês", icon: LucideTrendingUp, color: "text-heritage-success" },
                    { title: "Eventos", val: "02 Ativos", sub: "Azulejaria & Cal", icon: LucideCalendar, color: "text-heritage-ocean" },
                    { title: "Votações", val: "01 Disp.", sub: "Novo Projeto", icon: LucideVote, color: "text-heritage-gold" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="glass-card p-8 rounded-[32px] border-none shadow-sm space-y-4 group transition-apple"
                    >
                        <div className="flex justify-between items-start">
                            <stat.icon className={`w-6 h-6 ${stat.color} transition-apple group-hover:scale-110`} />
                            <Badge variant="outline" className="text-[9px] border-heritage-navy/5 dark:border-white/5 opacity-50">{stat.title}</Badge>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-heritage-navy dark:text-white transition-apple">{stat.val}</div>
                            <p className="text-xs text-heritage-navy/40 dark:text-white/30 font-medium transition-apple">{stat.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Chart */}
                <Card className="lg:col-span-2 rounded-[48px] shadow-sm border-none glass-card p-10 transition-apple">
                    <CardHeader className="px-0 pt-0 pb-10">
                        <CardTitle className="text-xl font-black text-heritage-navy dark:text-white transition-apple">Impacto Social Acumulado</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDark ? "#D4AF37" : "#0A1F30"} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={isDark ? "#D4AF37" : "#0A1F30"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#ffffff10" : "#00000005"} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDark ? '#ffffff40' : '#00000040', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={isDark ? "#D4AF37" : "#0A1F30"}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Info Card / Active Project */}
                <Card className="rounded-[40px] shadow-sm border-none bg-heritage-navy dark:bg-zinc-900 p-8 relative overflow-hidden transition-apple group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-terracotta/20 rounded-full blur-3xl -mr-10 -mt-10" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-6">
                            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full font-black uppercase text-[9px] tracking-widest">
                                Projeto Piloto Ativo
                            </Badge>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white leading-tight">Rua dos <br /> Froios</h3>
                                <p className="text-white/40 text-sm font-medium">Lisboa, Portugal</p>
                            </div>

                            <img
                                src="https://images.unsplash.com/photo-1549492423-40026e6f4770?auto=format&fit=crop&q=80&w=800"
                                className="w-full h-32 object-cover rounded-[24px] saturate-50 transition-apple group-hover:saturate-100"
                                alt="Obra"
                            />

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Progresso</span>
                                    <span className="text-sm font-black text-heritage-gold">45%</span>
                                </div>
                                <Progress value={45} className="h-1.5 bg-white/10 transition-apple" />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <Button className="bg-heritage-gold hover:bg-heritage-gold/80 text-heritage-navy font-black rounded-2xl h-12">Detalhamento</Button>
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-2xl h-12">Galeria</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
