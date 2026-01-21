import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LucideCalendar, LucideMapPin, LucideClock, LucideArrowRight, LucideFilter, LucidePlus } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { logSystemError } from "@/lib/errorLogger"

interface Event {
    id: string
    title: string
    description: string
    date: string
    end_date?: string
    location: string
    category: string
    image_url: string
    max_attendees?: number
}

const categoryColors: Record<string, string> = {
    cultura: "bg-heritage-terracotta/10 text-heritage-terracotta",
    social: "bg-heritage-ocean/10 text-heritage-ocean",
    formacao: "bg-heritage-gold/10 text-heritage-gold",
    assembleia: "bg-heritage-navy/10 text-heritage-navy"
}

export default function Events() {
    const { profile } = useAuth()
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<string | null>(null)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true })

            if (error) throw error
            setEvents(data || [])
        } catch (error: any) {
            console.error('Erro ao carregar eventos:', error)
            toast.error('Erro ao carregar eventos')
            logSystemError(error, 'Events.fetchEvents', profile?.id)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    }

    const filteredEvents = filter
        ? events.filter(e => e.category === filter)
        : events

    return (
        <div className="space-y-16 transition-apple animate-in fade-in duration-700">
            {/* Header - Apple Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-3">
                    <Badge variant="outline" className="border-heritage-navy/10 dark:border-white/10 text-heritage-navy dark:text-white/60 px-4 py-1 rounded-full uppercase text-[9px] font-black tracking-[0.2em] backdrop-blur-xl">
                        Comunidade Em Rede
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black text-heritage-navy dark:text-white tracking-tighter transition-apple">
                        Agenda <br /><span className="text-heritage-ocean">Impacto Social</span>.
                    </h1>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => setFilter(filter ? null : 'cultura')}
                        className={`flex-1 md:flex-none glass-card rounded-2xl border-none font-black h-14 px-8 uppercase tracking-widest text-[9px] transition-apple ${filter ? 'bg-heritage-ocean/20 text-heritage-ocean' : 'text-heritage-navy dark:text-white'}`}
                    >
                        <LucideFilter className="w-4 h-4 mr-2" /> {filter || 'Filtrar'}
                    </Button>
                    {profile?.role === 'admin' && (
                        <Button
                            onClick={() => window.location.href = '/admin?tab=events'}
                            className="flex-1 md:flex-none bg-heritage-navy dark:bg-zinc-800 rounded-2xl font-black h-14 px-8 uppercase tracking-widest text-[9px] text-white shadow-lg transition-apple hover:bg-heritage-ocean"
                        >
                            <LucidePlus className="w-4 h-4 mr-2" /> Gerir
                        </Button>
                    )}

                </div>
            </div>

            {/* Event Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: events.length, color: 'text-heritage-navy' },
                    { label: 'Cultura', value: events.filter(e => e.category === 'cultura').length, color: 'text-heritage-terracotta' },
                    { label: 'Social', value: events.filter(e => e.category === 'social').length, color: 'text-heritage-ocean' },
                    { label: 'Próximos 7 dias', value: events.filter(e => new Date(e.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, color: 'text-heritage-success' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-[24px] border-none shadow-sm"
                    >
                        <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                        <p className="text-xs text-heritage-navy/40 dark:text-white/30 font-bold uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-80 rounded-[48px]" />
                    ))
                ) : filteredEvents.length === 0 ? (
                    <div className="col-span-2 text-center py-20">
                        <LucideCalendar className="w-16 h-16 mx-auto text-heritage-navy/20 mb-4" />
                        <p className="text-heritage-navy/40 dark:text-white/30 font-bold">Nenhum evento encontrado</p>
                    </div>
                ) : (
                    filteredEvents.map((e, i) => (
                        <motion.div
                            key={e.id}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="glass-card rounded-[48px] border-none shadow-sm overflow-hidden group transition-all duration-500 hover:shadow-2xl">
                                <div className="flex flex-col lg:flex-row h-full">
                                    <div className="w-full lg:w-2/5 h-64 lg:h-auto overflow-hidden">
                                        <img
                                            src={e.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                            alt={e.title}
                                        />
                                    </div>
                                    <div className="w-full lg:w-3/5 p-12 space-y-8 flex flex-col justify-between">
                                        <div className="space-y-6">
                                            <Badge className={`${categoryColors[e.category] || 'bg-heritage-sand text-heritage-navy'} font-black text-[9px] uppercase tracking-widest border-none px-5 py-1.5 rounded-full transition-apple`}>
                                                {e.category}
                                            </Badge>
                                            <h3 className="text-2xl md:text-3xl font-black text-heritage-navy dark:text-white leading-tight transition-apple group-hover:text-heritage-terracotta">
                                                {e.title}
                                            </h3>
                                            <p className="text-sm text-heritage-navy/60 dark:text-white/40 line-clamp-2">
                                                {e.description}
                                            </p>
                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-center gap-4 text-sm text-heritage-navy/40 dark:text-white/30 font-bold transition-apple">
                                                    <div className="w-10 h-10 bg-heritage-sand dark:bg-zinc-900 rounded-xl flex items-center justify-center text-heritage-terracotta transition-apple">
                                                        <LucideCalendar className="w-4 h-4" />
                                                    </div>
                                                    {formatDate(e.date)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-heritage-navy/40 dark:text-white/30 font-bold transition-apple">
                                                    <div className="w-10 h-10 bg-heritage-sand dark:bg-zinc-900 rounded-xl flex items-center justify-center text-heritage-ocean transition-apple">
                                                        <LucideClock className="w-4 h-4" />
                                                    </div>
                                                    {formatTime(e.date)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-heritage-navy/40 dark:text-white/30 font-bold transition-apple">
                                                    <div className="w-10 h-10 bg-heritage-sand dark:bg-zinc-900 rounded-xl flex items-center justify-center text-heritage-success transition-apple">
                                                        <LucideMapPin className="w-4 h-4" />
                                                    </div>
                                                    {e.location}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="p-0 h-auto self-start hover:bg-transparent text-heritage-terracotta font-black uppercase tracking-widest text-[10px] flex items-center gap-3 group/btn transition-apple">
                                            Fazer Inscrição <LucideArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-3" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
