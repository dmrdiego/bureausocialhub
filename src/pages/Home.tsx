import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { LucideArrowRight, LucideGlobe, LucideShield, LucideUsers, LucideHistory, LucideRocket, LucideLeaf, LucideHeart } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
    const [content, setContent] = useState<any>({
        hero: {
            title: "Tradição que <br /> <span class='text-heritage-terracotta'>Reabilita</span>.",
            subtitle: "Atuamos no coração histórico de Lisboa para preservar a alma dos bairros através da reabilitação urbana e inclusão social."
        },
        mission: {
            title: "O lucro humano <br />em <span class='italic font-serif'>Lisboa</span>.",
            text: "Reabilitamos edifícios devolutos para garantir que o artesão, o fadista e o idoso continuem a ser os donos das ruas de Alfama e Graça."
        }
    })

    useEffect(() => {
        const fetchCMS = async () => {
            const { data } = await supabase.from('cms_content').select('*')
            if (data && data.length > 0) {
                const mapped = data.reduce((acc: any, item: any) => {
                    acc[item.section_key] = item.content
                    return acc
                }, {})

                // Merge carefully to avoid undefined errors if partial content
                setContent((prev: any) => ({
                    hero: { ...prev.hero, ...mapped.hero },
                    mission: { ...prev.mission, ...mapped.mission }
                }))
            }
        }
        fetchCMS()
    }, [])

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

                        <h1
                            className="text-7xl md:text-9xl font-black text-heritage-navy dark:text-white leading-[0.9] tracking-tighter transition-apple"
                            dangerouslySetInnerHTML={{ __html: content.hero.title }}
                        />

                        <p className="text-xl md:text-2xl text-heritage-navy/60 dark:text-white/40 max-w-2xl mx-auto leading-relaxed font-medium transition-apple">
                            {content.hero.subtitle}
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
                    <h2
                        className="text-5xl md:text-7xl font-black text-heritage-navy dark:text-white leading-tight transition-apple"
                        dangerouslySetInnerHTML={{ __html: content.mission.title }}
                    />
                    <p className="text-2xl text-heritage-navy/50 dark:text-white/30 leading-relaxed font-medium max-w-3xl mx-auto transition-apple">
                        {content.mission.text}
                    </p>
                </div>
            </section>

            {/* Pillars - Modern Grid with 5 Areas */}
            <section className="py-40 bg-heritage-sand/30 dark:bg-zinc-900/50 px-6 transition-apple">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-6">
                        <Badge className="bg-heritage-terracotta/10 text-heritage-terracotta border-none px-4 rounded-full font-black uppercase tracking-widest text-[10px]">5 Pilares de Impacto</Badge>
                        <h2 className="text-4xl md:text-6xl font-black text-heritage-navy dark:text-white transition-apple">Atuação <span className="text-heritage-terracotta">Multidimensional</span></h2>
                        <p className="text-lg text-heritage-navy/60 dark:text-white/40 max-w-2xl mx-auto font-medium">
                            Do empreendedorismo social à tecnologia de impacto, criamos soluções integradas para desafios complexos.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            {
                                title: "Habitação Social",
                                subtitle: "Reabilitação Urbana",
                                icon: LucideShield,
                                desc: "Projetos de habitação acessível nos centros históricos",
                                color: "text-heritage-navy dark:text-white",
                                bg: "bg-heritage-navy/5 dark:bg-white/5"
                            },
                            {
                                title: "Empreendedorismo",
                                subtitle: "Negócios Sociais",
                                icon: LucideRocket,
                                desc: "Incubação de startups com impacto social positivo",
                                color: "text-heritage-terracotta",
                                bg: "bg-heritage-terracotta/5"
                            },
                            {
                                title: "Sustentabilidade",
                                subtitle: "Economia Circular",
                                icon: LucideLeaf,
                                desc: "Materiais ecológicos e energia 100% renovável",
                                color: "text-heritage-success",
                                bg: "bg-heritage-success/5"
                            },
                            {
                                title: "Inclusão Social",
                                subtitle: "Combate à Pobreza",
                                icon: LucideHeart,
                                desc: "Capacitação profissional e preservação de ofícios",
                                color: "text-heritage-gold",
                                bg: "bg-heritage-gold/5"
                            },
                            {
                                title: "Inovação",
                                subtitle: "Tecnologia Social",
                                icon: LucideUsers,
                                desc: "Soluções tecnológicas para desafios sociais",
                                color: "text-heritage-ocean",
                                bg: "bg-heritage-ocean/5"
                            }
                        ].map((pillar, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="glass-card p-8 rounded-[32px] shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-default border-none hover:-translate-y-2"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${pillar.bg} flex items-center justify-center mb-6 ${pillar.color} group-hover:scale-110 transition-transform`}>
                                    <pillar.icon className="w-7 h-7" />
                                </div>
                                <div className="space-y-2 mb-4">
                                    <h3 className="text-xl font-black text-heritage-navy dark:text-white transition-apple leading-tight">{pillar.title}</h3>
                                    <p className="text-xs font-bold text-heritage-navy/50 dark:text-white/40 uppercase tracking-widest">{pillar.subtitle}</p>
                                </div>
                                <p className="text-sm text-heritage-navy/60 dark:text-white/40 font-medium leading-relaxed transition-apple">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
