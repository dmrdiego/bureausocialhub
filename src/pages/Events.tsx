import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LucideCalendar, LucideMapPin, LucideClock, LucideArrowRight, LucideFilter, LucidePlus } from "lucide-react"
import { motion } from "framer-motion"

const events = [
    {
        id: 1,
        title: "Workshop: Azulejaria Tradicional",
        date: "15 Fev, 2026",
        time: "10:00 - 13:00",
        location: "Sede Alfama",
        category: "Cultura",
        image: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        title: "Assembleia de Moradores",
        date: "22 Fev, 2026",
        time: "18:00 - 20:00",
        location: "Rua dos Froios",
        category: "Social",
        image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800"
    }
]

export default function Events() {
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
                    <Button variant="outline" className="flex-1 md:flex-none glass-card rounded-2xl border-none font-black h-14 px-8 uppercase tracking-widest text-[9px] text-heritage-navy dark:text-white transition-apple hover:bg-heritage-sand/50 dark:hover:bg-zinc-800">
                        <LucideFilter className="w-4 h-4 mr-2" /> Filtrar
                    </Button>
                    <Button className="flex-1 md:flex-none bg-heritage-navy dark:bg-zinc-800 rounded-2xl font-black h-14 px-8 uppercase tracking-widest text-[9px] text-white shadow-lg transition-apple hover:bg-heritage-ocean">
                        <LucidePlus className="w-4 h-4 mr-2" /> Sugerir
                    </Button>
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {events.map((e, i) => (
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
                                        src={e.image}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                        alt={e.title}
                                    />
                                </div>
                                <div className="w-full lg:w-3/5 p-12 space-y-8 flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <Badge className="bg-heritage-sand dark:bg-zinc-900 text-heritage-navy dark:text-white/60 font-black text-[9px] uppercase tracking-widest border-none px-5 py-1.5 rounded-full transition-apple">
                                            {e.category}
                                        </Badge>
                                        <h3 className="text-2xl md:text-3xl font-black text-heritage-navy dark:text-white leading-tight transition-apple group-hover:text-heritage-terracotta">
                                            {e.title}
                                        </h3>
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center gap-4 text-sm text-heritage-navy/40 dark:text-white/30 font-bold transition-apple">
                                                <div className="w-10 h-10 bg-heritage-sand dark:bg-zinc-900 rounded-xl flex items-center justify-center text-heritage-terracotta transition-apple">
                                                    <LucideCalendar className="w-4 h-4" />
                                                </div>
                                                {e.date}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-heritage-navy/40 dark:text-white/30 font-bold transition-apple">
                                                <div className="w-10 h-10 bg-heritage-sand dark:bg-zinc-900 rounded-xl flex items-center justify-center text-heritage-ocean transition-apple">
                                                    <LucideClock className="w-4 h-4" />
                                                </div>
                                                {e.time}
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
                ))}
            </div>
        </div>
    )
}
