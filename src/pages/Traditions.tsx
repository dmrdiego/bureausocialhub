import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const craftCategories = [
    {
        title: "Ofícios da Construção",
        description: "Mestres que preservam a identidade física de Lisboa.",
        items: [
            "Pedreiros especializados em alvenarias de pedra",
            "Carpinteiros de estruturas e casquinha",
            "Serralheiros de ferro forjado",
            "Azulejistas e Estucadores",
            "Canteiros de lioz e granito"
        ],
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
        color: "text-heritage-terracotta",
        bg: "bg-heritage-terracotta"
    },
    {
        title: "Artes Performáticas & Fado",
        description: "A alma sonora e teatral dos bairros históricos.",
        items: [
            "Fadistas e Cantores residentes",
            "Guitarristas (Guitarra Portuguesa)",
            "Atores de Teatro Popular",
            "Contadores de Histórias e Memória Oral"
        ],
        image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=800",
        color: "text-heritage-navy",
        bg: "bg-heritage-navy"
    },
    {
        title: "Artesanato & Têxteis",
        description: "O saber feito à mão que veste a tradição.",
        items: [
            "Bordadeiras (Viana, Castelo Branco)",
            "Rendeiras de Bilros",
            "Tecelões de teares tradicionais",
            "Sapateiros e Correeiros artesanais"
        ],
        image: "https://images.unsplash.com/photo-1605218427306-633ba8788812?auto=format&fit=crop&q=80&w=800",
        color: "text-heritage-gold",
        bg: "bg-heritage-gold"
    },
    {
        title: "Artes Visuais & Plásticas",
        description: "Novos olhares sobre técnicas ancestrais.",
        items: [
            "Pintores de Arte Tradicional e Mural",
            "Escultores em pedra e madeira",
            "Ceramistas e Oleiros",
            "Ilustradores de Património"
        ],
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800",
        color: "text-heritage-ocean",
        bg: "bg-heritage-ocean"
    }
]

export default function Traditions() {
    return (
        <div className="flex flex-col w-full min-h-screen bg-background transition-apple">
            {/* Hero Section */}
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-30 dark:opacity-10"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
                    <Badge variant="outline" className="border-heritage-navy/20 dark:border-white/20 text-heritage-navy dark:text-white/60 px-6 py-2 rounded-full uppercase text-[11px] font-black tracking-[0.3em] backdrop-blur-md">
                        Património Vivo
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-heritage-navy dark:text-white leading-[0.95] tracking-tighter transition-apple">
                        Saberes que <br /> <span className="text-heritage-terracotta">Edificam Lisboa</span>.
                    </h1>
                    <p className="text-xl md:text-2xl text-heritage-navy/60 dark:text-white/40 max-w-2xl mx-auto font-medium leading-relaxed">
                        Um programa de residência para quem preserva a alma da cidade. Você ensina, o bairro acolhe.
                    </p>
                </div>
            </section>

            {/* Crafts Grid */}
            <section className="px-6 pb-32">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {craftCategories.map((craft, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group h-full"
                        >
                            <div className="h-full glass-card rounded-[48px] overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <img
                                        src={craft.image}
                                        alt={craft.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-6 left-8 z-20">
                                        <Badge className={`${craft.bg} text-white border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1 mb-2`}>
                                            Categoria
                                        </Badge>
                                        <h3 className="text-3xl font-black text-white leading-none">{craft.title}</h3>
                                    </div>
                                </div>
                                <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                                    <div>
                                        <p className="text-lg text-heritage-navy/60 dark:text-white/80 font-medium mb-6">
                                            {craft.description}
                                        </p>
                                        <ul className="space-y-3">
                                            {craft.items.map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-heritage-navy/80 dark:text-white/90">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${craft.bg}`} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl border-heritage-navy/10 dark:border-white/10 hover:bg-heritage-sand/50 dark:hover:bg-white/5 text-heritage-navy dark:text-white font-black uppercase tracking-widest text-xs transition-apple group-hover:border-heritage-terracotta/30"
                                    >
                                        <a href="/candidatura">Candidatar-se como Mestre</a>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="px-6 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-heritage-navy dark:bg-zinc-900 rounded-[64px] p-12 md:p-20 text-center space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-heritage-terracotta/20 rounded-full blur-[100px] -mr-20 -mt-20 transition-transform duration-1000 group-hover:scale-125" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-heritage-gold/10 rounded-full blur-[80px] -ml-10 -mb-10" />

                        <div className="relative z-10 space-y-6">
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                "Você ensina, <br /> <span className="text-heritage-gold">você mora.</span>"
                            </h2>
                            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                                Se domina um destes ofícios e quer voltar a viver no centro de Lisboa, junte-se ao Programa Moradia Artesãos.
                            </p>

                            <div className="space-y-8">
                                {[
                                    "Isenção de renda para 8h mensais de oficinas.",
                                    "Moradia reabilitada no coração de Alfama ou Graça.",
                                    "Integração em comunidade de mestres."
                                ].map((point, i) => (
                                    <div key={i} className="flex items-center gap-6 text-xl font-bold justify-center text-white/90">
                                        <div className="w-3 h-3 rounded-full bg-heritage-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                                        {point}
                                    </div>
                                ))}
                            </div>

                            <Button
                                asChild
                                className="bg-white text-heritage-navy hover:bg-heritage-gold hover:text-white rounded-[24px] h-20 px-16 text-xl font-black transition-apple shadow-2xl hover:shadow-gold/20 cursor-pointer mt-8"
                            >
                                <a href="/candidatura">
                                    Candidatar-me Agora
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
