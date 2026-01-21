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
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800",
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

            {/* Introduction Section */}
            <section className="px-6 pb-20">
                <div className="max-w-4xl mx-auto glass-card p-10 md:p-16 rounded-[48px] border-none shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-heritage-terracotta/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-3xl font-black text-heritage-navy dark:text-white tracking-tight">Preservando a Nossa Herança</h2>
                        <div className="space-y-6 text-lg text-heritage-navy/70 dark:text-white/50 font-medium leading-relaxed">
                            <p>
                                Portugal possui um rico património de ofícios tradicionais que representa séculos de conhecimento acumulado e transmitido de geração em geração. Estas profissões, que outrora constituíam a base da economia local, encontram-se hoje em risco de desaparecimento devido às transformações económicas e sociais das últimas décadas.
                            </p>
                            <p>
                                O Programa Moradia Artesãos do Bureau Social visa preservar este património através da criação de condições para que os mestres destes ofícios possam continuar a exercer a sua atividade e transmitir os seus conhecimentos às novas gerações.
                            </p>
                        </div>
                    </div>
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

            {/* Categorized Professions Glossary Section */}
            <section className="px-6 pb-32">
                <div className="max-w-6xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className="border-heritage-gold/20 text-heritage-gold px-6 py-2 rounded-full uppercase text-[10px] font-black tracking-widest">Compêndio de Ofícios</Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-heritage-navy dark:text-white tracking-tight">
                            Glossário de <span className="text-heritage-terracotta">Saberes Tradicionais</span>
                        </h2>
                        <p className="text-heritage-navy/60 dark:text-white/40 font-medium max-w-2xl mx-auto">
                            Uma lista abrangente dos ofícios que compõem o ecossistema do Programa Moradia Artesãos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
                        {[
                            {
                                category: "1. Têxteis e Vestuário",
                                professions: [
                                    { name: "Alfaiate", desc: "Confecção de vestuário masculino por medida, dominando técnicas de corte e ajuste perfeito." },
                                    { name: "Costureira / Modista", desc: "Confecção de vestuário feminino utilizando técnicas tradicionais de corte e costura." },
                                    { name: "Bordadeira", desc: "Especialista em bordado manual: ponto cruz, ponto cheio, ponto de Arraiolos, etc." },
                                    { name: "Tecelão / Tecelã", desc: "Operação de teares manuais para produzir tecidos, tapetes e mantas artesanais." },
                                    { name: "Rendeira", desc: "Produção de rendas de bilros (Vila do Conde, Peniche) ou rendas de agulha." },
                                    { name: "Tapeceiro", desc: "Produção de tapeçarias decorativas utilizando técnicas de tecelagem artística." },
                                    { name: "Chapeleiro", desc: "Artesão especializado na produção de chapéus de feltro e modelos elaborados." }
                                ]
                            },
                            {
                                category: "2. Calçado e Couro",
                                professions: [
                                    { name: "Sapateiro", desc: "Produção e reparação de calçado, dominando o corte de couro e montagem manual." },
                                    { name: "Marroquineiro", desc: "Produção de malas, carteiras e cintos através de técnicas artesanais em couro." },
                                    { name: "Correeiro", desc: "Produção de arreios e equipamentos em couro para animais, forte tradição rural." },
                                    { name: "Estofador", desc: "Revestimento de móveis utilizando técnicas tradicionais de trabalho com tecidos e couros." }
                                ]
                            },
                            {
                                category: "3. Cerâmica e Olaria",
                                professions: [
                                    { name: "Oleiro", desc: "Trabalho do barro para peças utilitárias através de modelagem manual ou em roda." },
                                    { name: "Ceramista", desc: "Produção artística em cerâmica com técnicas de modelagem e cozedura complexas." },
                                    { name: "Azulejista", desc: "Produção e pintura de azulejos, arte identitária portuguesa desde o século XV." },
                                    { name: "Pintor de Azulejos", desc: "Decoração manual de azulejos com motivos tradicionais ou contemporâneos." }
                                ]
                            },
                            {
                                category: "4. Madeira e Mobiliário",
                                professions: [
                                    { name: "Marceneiro", desc: "Produção de móveis especializados com técnicas de corte e assemblagem fina." },
                                    { name: "Carpinteiro", desc: "Trabalho de madeira para construção, estruturas, portas e elementos arquitetónicos." },
                                    { name: "Entalhador", desc: "Escultura decorativa em madeira através de técnicas de entalhe e cinzelagem." },
                                    { name: "Torneiro de Madeira", desc: "Criação de peças cilíndricas e decorativas utilizando o torno manual." },
                                    { name: "Cesteiro", desc: "Produção de cestos através do entrelaçamento de vime, palha ou cana." },
                                    { name: "Restaurador", desc: "Recuperação de peças antigas devolvendo a aparência e funcionalidade originais." }
                                ]
                            },
                            {
                                category: "5. Metais",
                                professions: [
                                    { name: "Ferreiro", desc: "Trabalho do ferro em forja para ferramentas e elementos decorativos artísticos." },
                                    { name: "Serralheiro", desc: "Produção de grades, portões e estruturas metálicas em ferro ou aço." },
                                    { name: "Caldeireiro", desc: "Produção de recipientes e utensílios metálicos através de moldagem e soldadura." },
                                    { name: "Ourives", desc: "Trabalho de metais preciosos como ouro e prata para joias e objetos de valor." },
                                    { name: "Joalheiro", desc: "Criação de joias combinando metais preciosos com pedras e outros materiais." },
                                    { name: "Latoeiro", desc: "Trabalho do latão para produzir utensílios domésticos e objetos decorativos." },
                                    { name: "Funileiro", desc: "Especialista em folha-de-flandres para recipientes e candeeiros tradicionais." }
                                ]
                            },
                            {
                                category: "6. Pedra",
                                professions: [
                                    { name: "Canteiro", desc: "Trabalho da pedra para elementos arquitetónicos e esculturas através de talhe." },
                                    { name: "Calceteiro", desc: "Colocação de calçada portuguesa utilizando calcário e basalto em padrões." },
                                    { name: "Pedreiro Tradicional", desc: "Técnicas ancestrais de construção e restauro de edifícios históricos em pedra." }
                                ]
                            },
                            {
                                category: "7. Alimentação e Ervanária",
                                professions: [
                                    { name: "Ervanário", desc: "Conhecimento e utilização medicinal e aromática de plantas da flora portuguesa." },
                                    { name: "Padeiro Tradicional", desc: "Produção de pão com fermentação natural e utilização de fornos a lenha." },
                                    { name: "Confeiteiro / Doceiro", desc: "Produção de doces e bolos de raízes conventuais com receitas centenárias." },
                                    { name: "Queijeiro", desc: "Produção artesanal de queijos através de técnicas tradicionais de cura." },
                                    { name: "Salsicheiro", desc: "Produção de enchidos e charcutaria utilizando receitas tradicionais." }
                                ]
                            },
                            {
                                category: "8. Construção Tradicional",
                                professions: [
                                    { name: "Estucador", desc: "Trabalhos decorativos em estuque para ornamentos e acabamentos de teto." },
                                    { name: "Caiador", desc: "Aplicação tradicional de cal para proteção e acabamento de paredes históricas." },
                                    { name: "Telheiro", desc: "Produção e colocação de telhas com cerâmica de construção tradicional." },
                                    { name: "Vidraceiro", desc: "Trabalho do vidro para vitrais e janelas com técnicas de moldagem manual." }
                                ]
                            },
                            {
                                category: "9. Outros Ofícios",
                                professions: [
                                    { name: "Relojoeiro", desc: "Produção e reparação de mecanismos complexos de relógios de precisão." },
                                    { name: "Encadernador", desc: "Restauro e produção de livros com técnicas de costura e colagem manual." },
                                    { name: "Tipógrafo", desc: "Impressão tradicional com tipos móveis, a arte que precedeu o digital." },
                                    { name: "Luthier / Organeiro", desc: "Construção e restauro de instrumentos musicais de corda e órgãos de tubos." },
                                    { name: "Tanoeiro", desc: "Produção de barris e pipas em madeira para armazenamento de vinho." },
                                    { name: "Barbeiro Tradicional", desc: "Serviço clássico de corte e barba em ambientes de preservação histórica." },
                                    { name: "Amolador", desc: "Profissional itinerante que afia utensílios cortantes nas ruas tradicionais." }
                                ]
                            }
                        ].map((cat, idx) => (
                            <div key={idx} className="space-y-6">
                                <h3 className="text-xl font-black text-heritage-navy dark:text-white flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-heritage-terracotta/10 text-heritage-terracotta flex items-center justify-center text-xs">{idx + 1}</span>
                                    {cat.category}
                                </h3>
                                <div className="space-y-3">
                                    {cat.professions.map((prof, pIdx) => (
                                        <details key={pIdx} className="group glass-card rounded-2xl border-none cursor-pointer transition-all duration-300">
                                            <summary className="flex items-center justify-between p-5 font-bold text-heritage-navy/80 dark:text-white/80 list-none text-sm">
                                                <span>{prof.name}</span>
                                                <div className="w-5 h-5 rounded-full bg-heritage-navy/5 flex items-center justify-center transition-transform group-open:rotate-180">
                                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </summary>
                                            <div className="px-5 pb-5 text-xs text-heritage-navy/60 dark:text-white/40 font-medium leading-relaxed animate-in fade-in slide-in-from-top-1">
                                                {prof.desc}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
