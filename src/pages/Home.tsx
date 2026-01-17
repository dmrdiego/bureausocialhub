import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { LucideArrowRight, LucideGlobe, LucideShield, LucideUsers, LucideHistory } from "lucide-react"

export default function Home() {
    return (
        <div className="flex flex-col w-full bg-background transition-apple">
            {/* Hero Section - Apple Glass Style */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-60 dark:opacity-20 transition-apple"></div>

                <div className="max-w-5xl mx-auto space-y-10 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <Badge variant="secondary" className="bg-heritage-navy/5 dark:bg-white/5 text-heritage-navy dark:text-white/60 px-6 py-2 rounded-full uppercase text-[10px] font-black tracking-[0.3em] border border-heritage-navy/10 dark:border-white/10 backdrop-blur-xl">
                            Bureau Social • IPSS DE LISBOA
                        </Badge>

                        <h1 className="text-7xl md:text-9xl font-black text-heritage-navy dark:text-white leading-[0.9] tracking-tighter transition-apple">
                            Tradição que <br />
                            <span className="text-heritage-terracotta">Reabilita</span>.
                        </h1>

                        <p className="text-xl md:text-2xl text-heritage-navy/60 dark:text-white/40 max-w-2xl mx-auto leading-relaxed font-medium transition-apple">
                            Atuamos no coração histórico de Lisboa para preservar a alma dos bairros através da reabilitação urbana e inclusão social.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
                    >
                        <Link to="/project">
                            <Button size="lg" className="bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-white rounded-2xl h-16 px-14 text-lg font-black shadow-2xl shadow-heritage-terracotta/30 transition-apple hover:-translate-y-1">
                                Ver Projeto Piloto
                            </Button>
                        </Link>
                        <Link to="/candidatura">
                            <Button size="lg" variant="outline" className="border-2 border-heritage-navy dark:border-white text-heritage-navy dark:text-white hover:bg-heritage-navy hover:text-white dark:hover:bg-white dark:hover:text-heritage-navy rounded-2xl h-16 px-10 text-lg font-black transition-apple hover:-translate-y-1">
                                Associe-se <LucideArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>


            </section>

            {/* Mission Section - Minimalist */}
            <section className="py-40 bg-white dark:bg-zinc-950 px-6 transition-apple">
                <div className="max-w-4xl mx-auto text-center space-y-14">
                    <Badge className="bg-heritage-gold/10 text-heritage-gold border-none px-4 rounded-full font-black uppercase tracking-widest text-[10px]">Nossa Visão</Badge>
                    <h2 className="text-5xl md:text-7xl font-black text-heritage-navy dark:text-white leading-tight transition-apple">
                        O lucro humano <br />em <span className="italic font-serif">Lisboa</span>.
                    </h2>
                    <p className="text-2xl text-heritage-navy/50 dark:text-white/30 leading-relaxed font-medium max-w-3xl mx-auto transition-apple">
                        Reabilitamos edifícios devolutos para garantir que o artesão, o fadista e o idoso continuem a ser os donos das ruas de Alfama e Graça.
                    </p>
                </div>
            </section>

            {/* Pillars - Modern Grid */}
            <section className="py-40 bg-heritage-sand/30 dark:bg-zinc-900/50 px-6 transition-apple">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                        { title: "Habitação", icon: LucideShield, desc: "Renda acessível nos centros históricos.", color: "text-heritage-navy dark:text-white" },
                        { title: "Cultura", icon: LucideHistory, desc: "Preservação de ofícios e fado.", color: "text-heritage-terracotta" },
                        { title: "ESG", icon: LucideGlobe, desc: "Sustentabilidade em cada obra.", color: "text-heritage-ocean" },
                        { title: "Rede", icon: LucideUsers, desc: "Fortalecimento do tecido social.", color: "text-heritage-success" }
                    ].map((pillar, i) => (
                        <div key={i} className="glass-card p-12 rounded-[48px] shadow-sm hover:shadow-2xl transition-apple group cursor-default border-none">
                            <div className={`w-20 h-20 rounded-3xl bg-heritage-sand dark:bg-zinc-800 flex items-center justify-center mb-10 ${pillar.color} group-hover:scale-110 transition-apple`}>
                                <pillar.icon className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-heritage-navy dark:text-white mb-4 transition-apple">{pillar.title}</h3>
                            <p className="text-heritage-navy/50 dark:text-white/30 font-medium leading-relaxed transition-apple">{pillar.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

import { motion } from "framer-motion"
