import { useState, useMemo, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { LucideFileText, LucideSearch, LucideLock, LucideExternalLink, LucideLoader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { filterDocuments, categoryLabels, type Document } from "@/lib/documentsData"
import { useAuth } from "@/context/AuthContext"

const categories = ['todos', 'institucional', 'programa', 'financeiro', 'politica'] as const

export default function Docs() {
    const [activeCategory, setActiveCategory] = useState<string>('todos')
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const { profile } = useAuth()

    const handleCategoryChange = (cat: string) => {
        setIsLoading(true)
        setActiveCategory(cat)
        setTimeout(() => setIsLoading(false), 800)
    }

    // Initial load simulation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredDocs = useMemo(() => {
        return filterDocuments(activeCategory, searchTerm, profile?.role)
    }, [activeCategory, searchTerm, profile?.role])

    const handleDownload = (doc: Document) => {
        toast.success("Documento Localizado", {
            description: `Abrindo ${doc.title} em nova aba...`,
            duration: 2000,
        })
        window.open(doc.path, '_blank')
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="flex flex-col w-full bg-background transition-apple min-h-screen">
            {/* Header Docs - Apple Glass Style */}
            <section className="pt-56 pb-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-30 dark:opacity-10 transition-apple"></div>
                <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="border-heritage-navy/10 dark:border-white/10 text-heritage-navy dark:text-white/60 px-6 py-2 rounded-full uppercase text-[10px] font-black tracking-[0.3em] backdrop-blur-xl">
                            Acesso Restrito & Público
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.7 }}
                        className="text-6xl md:text-8xl font-black text-heritage-navy dark:text-white leading-[0.95] tracking-tighter transition-apple"
                    >
                        Central de <br /><span className="text-heritage-terracotta">Transparência</span>.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-2xl md:text-3xl text-heritage-navy/40 dark:text-white/30 leading-relaxed font-medium max-w-2xl mx-auto transition-apple"
                    >
                        Documentação auditada e disponível para todos os associados.
                    </motion.p>
                </div>
            </section>

            {/* Docs Content */}
            <section className="py-40 px-6 bg-white dark:bg-zinc-950 transition-apple min-h-[600px]">
                <div className="max-w-5xl mx-auto space-y-16">
                    {/* Filter & Search - Apple Style Glass */}
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-10 p-4 border-b border-heritage-navy/5 dark:border-white/5 pb-16 sticky top-24 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-[32px]">
                        <div className="flex gap-2 p-2 bg-heritage-sand/30 dark:bg-zinc-900 rounded-[24px] flex-wrap justify-center">
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant="ghost"
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`rounded-2xl px-6 h-11 font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeCategory === cat
                                        ? "bg-heritage-navy text-white dark:bg-heritage-gold dark:text-heritage-navy shadow-lg scale-105"
                                        : "text-heritage-navy/40 dark:text-white/30 hover:bg-white/50 dark:hover:bg-white/5"
                                        }`}
                                >
                                    {categoryLabels[cat]}
                                </Button>
                            ))}
                        </div>
                        <div className="relative w-full lg:w-96 group">
                            <LucideSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-heritage-navy/20 dark:text-white/20 transition-apple group-focus-within:text-heritage-terracotta" />
                            <input
                                placeholder="Pesquisar documento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-heritage-sand/20 dark:bg-zinc-900 rounded-[28px] pl-16 pr-8 py-5 text-sm focus:outline-none focus:ring-4 focus:ring-heritage-navy/5 dark:focus:ring-white/5 font-bold transition-all duration-300 text-heritage-navy dark:text-white placeholder:text-heritage-navy/20 dark:placeholder:text-white/20 border-none hover:bg-heritage-sand/40"
                            />
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between px-4">
                        <span className="text-sm text-heritage-navy/40 dark:text-white/30 font-bold flex items-center gap-2">
                            {isLoading ? <LucideLoader2 className="animate-spin w-4 h-4" /> : `${filteredDocs.length} documento${filteredDocs.length !== 1 ? 's' : ''}`}
                        </span>
                        {!profile && (
                            <Badge variant="outline" className="text-[9px] border-heritage-gold/30 text-heritage-gold">
                                Login necessário para documentos restritos
                            </Badge>
                        )}
                    </div>

                    {/* Documents List */}
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="skeletons"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-10 rounded-[40px] flex gap-10 items-center border border-heritage-navy/5 dark:border-white/5">
                                        <Skeleton className="w-20 h-20 rounded-3xl" />
                                        <div className="space-y-4 flex-1">
                                            <Skeleton className="h-8 w-1/3 rounded-lg" />
                                            <Skeleton className="h-4 w-1/4 rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : filteredDocs.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-32"
                            >
                                <p className="text-heritage-navy/30 dark:text-white/20 font-bold text-xl">
                                    Nenhum documento encontrado.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                {filteredDocs.map((doc) => (
                                    <motion.div
                                        key={doc.id}
                                        variants={itemVariants}
                                        className="group p-8 md:p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-10 transition-all duration-500 hover:bg-heritage-sand/30 dark:hover:bg-zinc-900/60 border border-transparent hover:border-heritage-navy/5 dark:hover:border-white/5 hover:shadow-xl hover:-translate-y-1"
                                    >
                                        <div className="flex items-center gap-10 text-center md:text-left w-full lg:w-auto">
                                            <div className="w-24 h-24 rounded-3xl bg-heritage-sand dark:bg-zinc-900/50 flex items-center justify-center text-heritage-navy dark:text-white transition-all duration-500 group-hover:scale-110 group-hover:bg-heritage-navy group-hover:text-white dark:group-hover:bg-heritage-gold dark:group-hover:text-heritage-navy shrink-0 shadow-sm">
                                                {doc.restricted ? <LucideLock className="w-8 h-8" /> : <LucideFileText className="w-9 h-9" />}
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4 justify-center md:justify-start flex-wrap">
                                                    <h3 className="text-2xl font-black text-heritage-navy dark:text-white transition-colors group-hover:text-heritage-terracotta">{doc.title}</h3>
                                                    {doc.restricted && (
                                                        <Badge variant="outline" className="text-[8px] border-heritage-terracotta/20 text-heritage-terracotta uppercase px-2 font-black">
                                                            Restrito
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                                    <Badge className="bg-white dark:bg-zinc-800 text-heritage-navy dark:text-white/60 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
                                                        {categoryLabels[doc.category]}
                                                    </Badge>
                                                    <span className="text-[10px] text-heritage-navy/30 dark:text-white/20 font-black uppercase tracking-[0.2em]">
                                                        {doc.date}
                                                    </span>
                                                </div>
                                                {doc.description && (
                                                    <p className="text-sm text-heritage-navy/40 dark:text-white/30 font-medium max-w-md hidden md:block">
                                                        {doc.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleDownload(doc)}
                                            className="bg-heritage-navy dark:bg-zinc-800 text-white hover:bg-heritage-ocean dark:hover:bg-white dark:hover:text-heritage-navy rounded-[24px] h-16 px-10 font-black border-none transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 w-full lg:w-auto group/btn"
                                        >
                                            <LucideExternalLink className="w-5 h-5 mr-3 transition-transform group-hover/btn:translate-x-1" />
                                            Visualizar
                                        </Button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    )
}
