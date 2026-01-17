import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
// Importando ícones extras para as novas seções
import { LucideBuilding, LucideUsers2, LucideEuro, LucideCalendarClock, LucideMapPin } from "lucide-react"
import { motion } from "framer-motion"
import BuildingFacade from "@/assets/building-facade.jpg"
import BuildingDetail from "@/assets/building-detail.jpg"

export default function HousingProject() {
    return (
        <div className="flex flex-col w-full bg-background transition-apple">
            {/* Header Obra - Apple Style */}
            <section className="pt-48 pb-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-30 dark:opacity-10 transition-apple"></div>
                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="bg-heritage-gold/20 text-heritage-gold dark:text-heritage-gold/80 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest border border-heritage-gold/30 backdrop-blur-md">
                            Reabilitação Urbana • Santa Maria Maior
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.7 }}
                        className="text-5xl md:text-8xl font-black text-heritage-navy dark:text-white leading-[0.95] tracking-tighter transition-apple"
                    >
                        Beco dos Fróis, <br /> Nº 1 a 7.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-xl md:text-2xl text-heritage-navy/50 dark:text-white/40 leading-relaxed font-medium max-w-2xl mx-auto transition-apple"
                    >
                        Recuperação de imóvel histórico para criação de 3 habitações para artesãos e 1 oficina de ofícios tradicionais.
                    </motion.p>
                </div>
            </section>

            {/* Progress & Hero Image - Apple Material */}
            <section className="px-6 -mt-12 mb-32 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="glass-card rounded-[64px] border-none shadow-2xl overflow-hidden relative group"
                    >
                        <img
                            src={BuildingFacade}
                            className="w-full h-[650px] object-cover transition-all duration-700 hover:scale-105"
                            alt="Fachada Beco dos Fróis"
                        />
                        <div className="absolute top-0 right-0 p-12 hidden md:block">
                            <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/20">
                                <LucideMapPin className="w-5 h-5 text-heritage-terracotta" />
                                <span className="text-xs font-black uppercase tracking-widest text-heritage-navy dark:text-white">Santa Maria Maior, Lisboa</span>
                            </div>
                        </div>

                        <div className="absolute bottom-12 right-6 md:right-12 left-6 md:left-auto bg-white/60 dark:bg-black/40 backdrop-blur-3xl p-8 md:p-12 rounded-[48px] border border-white/20 dark:border-white/5 md:max-w-md shadow-2xl transition-apple">
                            <div className="flex justify-between mb-6">
                                <span className="text-heritage-navy dark:text-white/60 font-black uppercase tracking-widest text-xs">Fase do Projeto</span>
                                <span className="text-heritage-terracotta dark:text-heritage-gold font-black text-xl">Licenciamento</span>
                            </div>
                            <Progress value={35} className="h-4 bg-heritage-navy/5 dark:bg-white/5" />
                            <p className="text-heritage-navy/30 dark:text-white/20 text-[10px] mt-8 font-black uppercase tracking-[0.3em]">Previsão de Obra: Jan 2027</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Key Stats - Dados Reais do Projeto */}
            <section className="py-24 bg-heritage-sand/20 dark:bg-zinc-900/40 px-6 transition-apple">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-heritage-navy dark:text-white">Ficha Técnica</h2>
                        <p className="text-heritage-navy/40 dark:text-white/40 font-medium">Dados oficiais conforme plano de reabilitação 2026.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Investimento", val: "€308k", icon: LucideEuro, color: "text-heritage-navy dark:text-white" },
                            { label: "Unidades", val: "03 + 1", icon: LucideBuilding, color: "text-heritage-terracotta", sub: "3 Habitações + 1 Oficina" },
                            { label: "Artesãos", val: "3-6", icon: LucideUsers2, color: "text-heritage-success", sub: "Beneficiários diretos" },
                            { label: "Cronograma", val: "20 Meses", icon: LucideCalendarClock, color: "text-heritage-gold", sub: "Jan 26 - Out 27" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="glass-card p-8 md:p-12 rounded-[40px] text-center space-y-4 border-none transition-apple hover:-translate-y-2 shadow-sm hover:shadow-xl"
                            >
                                <stat.icon className={`w-8 h-8 md:w-10 md:h-10 mx-auto ${stat.color} opacity-80`} />
                                <div className="text-3xl md:text-5xl font-black text-heritage-navy dark:text-white tracking-tighter transition-apple">{stat.val}</div>
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase font-black tracking-[0.2em] text-heritage-navy/40 dark:text-white/40">{stat.label}</div>
                                    {stat.sub && <div className="text-[9px] font-bold text-heritage-navy/20 dark:text-white/20">{stat.sub}</div>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical Details - Two Column Apple Style */}
            <section className="py-40 bg-white dark:bg-zinc-950 px-6 transition-apple">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
                    <div className="space-y-16">
                        <div className="space-y-6">
                            <Badge variant="outline" className="border-heritage-navy/20 text-heritage-navy dark:text-white/60 uppercase tracking-widest text-[10px]">Especificações</Badge>
                            <h2 className="text-5xl md:text-6xl font-black text-heritage-navy dark:text-white leading-tight transition-apple">Intervenção de <br /> <span className="text-heritage-ocean">Raiz Tradicional</span>.</h2>
                            <p className="text-xl text-heritage-navy/50 dark:text-white/40 leading-relaxed font-medium">
                                O projeto prevê a reabilitação integral mantendo a traça original, com introdução de conforto térmico e acústico contemporâneo.
                            </p>
                        </div>

                        <div className="space-y-12">
                            {[
                                { title: "Piso Térreo: Oficina", desc: "Espaço de 60-80m² dedicado a atelier de artesanato e exposição ao público." },
                                { title: "Eficiência Energética", desc: "Isolamento térmico e painéis solares respeitando a estética da cobertura histórica." },
                                { title: "Materiais Locais", desc: "Uso prioritário de pedra lioz, madeira de pinho e cal hidráulica portuguesa." }
                            ].map((tech, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2, duration: 0.5 }}
                                    whileHover={{ x: 10 }}
                                    key={i}
                                    className="flex gap-8 items-start group transition-apple"
                                >
                                    <div className="w-14 h-14 bg-heritage-sand dark:bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0 text-heritage-terracotta dark:text-white font-black text-xl transition-apple group-hover:bg-heritage-terracotta group-hover:text-white">0{i + 1}</div>
                                    <div className="space-y-3">
                                        <h4 className="text-2xl font-black text-heritage-navy dark:text-white transition-apple">{tech.title}</h4>
                                        <p className="text-lg text-heritage-navy/40 dark:text-white/30 font-medium leading-relaxed transition-apple">{tech.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-10 bg-heritage-terracotta/5 dark:bg-heritage-gold/5 rounded-full blur-[120px] transition-apple" />
                        <motion.img
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            src={BuildingDetail}
                            className="relative rounded-[60px] shadow-3xl z-10 w-full h-[650px] object-cover transition-apple border border-white/10 grayscale hover:grayscale-0 duration-700"
                            alt="Detalhe de Cantaria"
                        />
                    </div>
                </div>
            </section>

            {/* Funding Section */}
            <section className="py-20 px-6 bg-heritage-navy dark:bg-zinc-900 text-white transition-apple">
                <div className="max-w-5xl mx-auto text-center space-y-12">
                    <h2 className="text-4xl font-black">Estrutura de Financiamento</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { val: "49%", label: "Fundos Europeus", color: "text-heritage-gold" },
                            { val: "26%", label: "IHRU", color: "text-heritage-terracotta" },
                            { val: "16%", label: "C.M. Lisboa", color: "text-heritage-ocean" },
                            { val: "9%", label: "Mecenato", color: "text-heritage-success" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
                            >
                                <div className={`text-4xl font-black ${item.color} mb-2`}>{item.val}</div>
                                <div className="text-xs uppercase tracking-widest opacity-60">{item.label}</div>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-white/40 text-sm max-w-2xl mx-auto">
                        Valor total estimado: €308.000. O modelo financeiro garante a sustentabilidade do projeto mantendo rendas sociais entre €150-€350.
                    </p>
                </div>
            </section>
        </div>
    )
}
