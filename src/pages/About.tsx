import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { LucideShieldCheck, LucideGlobe, LucideHeartHandshake, LucideScale } from "lucide-react"
import { motion } from "framer-motion"

export default function About() {
    return (
        <div className="flex flex-col w-full bg-background transition-apple">
            {/* Header Section - Modern Dark/Light */}
            <section className="pt-56 pb-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-30 dark:opacity-10 transition-apple"></div>
                <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
                    <Badge variant="outline" className="border-heritage-navy/10 dark:border-white/10 text-heritage-navy dark:text-white/60 px-6 py-2 rounded-full uppercase text-[10px] font-black tracking-[0.3em] backdrop-blur-xl">
                        A Instituição
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-heritage-navy dark:text-white leading-[0.95] tracking-tighter transition-apple">
                        Bureau Social: <br /> <span className="text-heritage-ocean">Impacto Real</span>.
                    </h1>
                    <p className="text-2xl md:text-3xl text-heritage-navy/40 dark:text-white/30 leading-relaxed font-medium italic transition-apple">
                        "Transformando desafios em oportunidades de impacto positivo através da inovação social em rede."
                    </p>
                </div>
            </section>

            {/* Content Section - Apple Dual Tone */}
            <section className="py-40 px-6 bg-white dark:bg-zinc-950 transition-apple">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-12 text-xl text-heritage-navy/60 dark:text-white/40 leading-relaxed font-medium transition-apple"
                    >
                        <p>
                            O <span className="font-black text-heritage-navy dark:text-white">Instituto Português de Negócios Sociais – Bureau Social</span> é uma associação sem fins lucrativos que promove negócios sociais e preservação cultural. Nossa missão como IPSS é clara: resolver problemas sociais de forma sustentável.
                        </p>
                        <p>
                            Atuamos na reabilitação de imóveis devolutos para garantir que a população histórica permaneça no coração de Lisboa, lutando ativamente contra a gentrificação.
                        </p>

                        <div className="grid grid-cols-2 gap-10 pt-8">
                            {[
                                { label: "IPSS Certificada", icon: LucideShieldCheck, color: "text-heritage-success" },
                                { label: "Impacto Humano", icon: LucideHeartHandshake, color: "text-heritage-gold" },
                                { label: "Justiça Social", icon: LucideScale, color: "text-heritage-terracotta" },
                                { label: "Lisboa Local", icon: LucideGlobe, color: "text-heritage-ocean" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-3 group transition-apple">
                                    <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`} />
                                    <span className="text-[10px] font-black text-heritage-navy dark:text-white uppercase tracking-[0.2em] transition-apple">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute -inset-20 bg-heritage-ocean/5 dark:bg-white/5 rounded-full blur-[120px] transition-apple" />
                        <Card className="rounded-[64px] border-none shadow-3xl overflow-hidden relative z-10 transition-apple hover:scale-[1.02]">
                            <img
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200"
                                alt="Equipe Bureau"
                                className="w-full h-[650px] object-cover"
                            />
                        </Card>
                    </div>
                </div>
            </section>

            {/* Impact Areas Section - 5 Pillars Grid */}
            <section className="py-40 px-6 bg-heritage-sand/10 dark:bg-zinc-900/30 transition-apple">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-8">
                        <Badge variant="outline" className="border-heritage-gold/20 text-heritage-gold px-6 py-2 rounded-full uppercase text-[10px] font-black tracking-widest">Impacto Social Multidimensional</Badge>
                        <h2 className="text-5xl md:text-7xl font-black text-heritage-navy dark:text-white transition-apple">As Nossas Áreas de <span className="text-heritage-terracotta">Impacto</span></h2>
                        <div className="h-1.5 w-24 bg-heritage-gold mx-auto rounded-full"></div>
                        <p className="text-xl text-heritage-navy/60 dark:text-white/40 max-w-3xl mx-auto font-medium">
                            O Bureau Social atua em 5 pilares fundamentais para criar transformação social sustentável e escalável.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Habitação Social e Reabilitação",
                                desc: "Desenvolvimento de projetos de habitação acessível e reabilitação de edifícios históricos, garantindo que as comunidades locais permaneçam nos centros urbanos.",
                                icon: LucideShieldCheck,
                                color: "text-heritage-navy",
                                bg: "bg-heritage-navy/5"
                            },
                            {
                                title: "Empreendedorismo Social",
                                desc: "Incubação e aceleração de negócios sociais que geram impacto positivo e sustentabilidade financeira, capacitando empreendedores locais.",
                                icon: LucideHeartHandshake,
                                color: "text-heritage-terracotta",
                                bg: "bg-heritage-terracotta/5"
                            },
                            {
                                title: "Sustentabilidade Ambiental",
                                desc: "Promoção da economia circular e práticas de construção sustentável, utilizando materiais ecológicos e energia 100% renovável.",
                                icon: LucideGlobe,
                                color: "text-heritage-success",
                                bg: "bg-heritage-success/5"
                            },
                            {
                                title: "Inclusão e Combate à Pobreza",
                                desc: "Programas de capacitação profissional, preservação de ofícios tradicionais e integração no mercado de trabalho para populações vulneráveis.",
                                icon: LucideHeartHandshake,
                                color: "text-heritage-gold",
                                bg: "bg-heritage-gold/5"
                            },
                            {
                                title: "Inovação e Tecnologia Social",
                                desc: "Desenvolvimento de soluções tecnológicas e metodologias inovadoras para resolver desafios sociais de forma escalável.",
                                icon: LucideScale,
                                color: "text-heritage-ocean",
                                bg: "bg-heritage-ocean/5"
                            }
                        ].map((pillar, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`glass-card p-10 rounded-[40px] shadow-sm space-y-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-none group ${i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                            >
                                <div className={`w-16 h-16 rounded-2xl ${pillar.bg} flex items-center justify-center ${pillar.color} group-hover:scale-110 transition-transform`}>
                                    <pillar.icon className="w-8 h-8" />
                                </div>
                                <h4 className="text-2xl font-black text-heritage-navy dark:text-white transition-apple leading-tight">{pillar.title}</h4>
                                <p className="text-base text-heritage-navy/60 dark:text-white/50 font-medium leading-relaxed transition-apple">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
                        {[
                            { number: "50+", label: "Famílias Apoiadas", color: "text-heritage-navy" },
                            { number: "12", label: "Negócios Sociais", color: "text-heritage-terracotta" },
                            { number: "100%", label: "Energia Renovável", color: "text-heritage-success" },
                            { number: "200+", label: "Profissionais Capacitados", color: "text-heritage-gold" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center space-y-3">
                                <div className={`text-5xl md:text-6xl font-black ${stat.color} transition-apple`}>{stat.number}</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-heritage-navy/50 dark:text-white/40 transition-apple">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
