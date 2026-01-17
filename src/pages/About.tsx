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

            {/* Values Section - Glass Grid */}
            <section className="py-40 px-6 bg-heritage-sand/10 dark:bg-zinc-900/30 transition-apple">
                <div className="max-w-7xl mx-auto space-y-32">
                    <div className="text-center space-y-8">
                        <h2 className="text-5xl md:text-7xl font-black text-heritage-navy dark:text-white transition-apple">Nossos Princípios</h2>
                        <div className="h-1.5 w-24 bg-heritage-gold mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Transparência",
                                desc: "Relatórios auditados e públicos para total confiança dos associados."
                            },
                            {
                                title: "Sustentabilidade",
                                desc: "Materiais ecológicos e energia 100% renovável em nossas reabilitações."
                            },
                            {
                                title: "Inclusão",
                                desc: "Garantimos habitação digna a rendas acessíveis para a comunidade local."
                            }
                        ].map((v, i) => (
                            <div key={i} className="glass-card p-14 rounded-[56px] shadow-sm space-y-8 transition-apple hover:-translate-y-4 border-none">
                                <h4 className="text-3xl font-black text-heritage-navy dark:text-white transition-apple">{v.title}</h4>
                                <p className="text-lg text-heritage-navy/40 dark:text-white/30 font-medium leading-relaxed transition-apple">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
