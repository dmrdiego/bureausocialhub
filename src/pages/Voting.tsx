import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LucideVote, LucideInfo, LucideCheck, LucideLoader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Voting() {
    const { user } = useAuth()
    const [projects, setProjects] = useState<any[]>([])
    const [userVotes, setUserVotes] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [votingId, setVotingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return
            setLoading(true)
            try {
                // Fetch Projects
                const { data: projectsData, error: projectsError } = await supabase
                    .from('projects')
                    .select('*')
                    .order('votes', { ascending: false }) // Show most popular first

                if (projectsError) throw projectsError
                if (projectsData) setProjects(projectsData)

                // Fetch User Votes
                const { data: votesData, error: votesError } = await supabase
                    .from('votes')
                    .select('project_id')
                    .eq('user_id', user.id)

                if (votesError) throw votesError
                setUserVotes(votesData.map((v: { project_id: string }) => v.project_id))
            } catch (error) {
                console.error("Error fetching voting data:", error)
                toast.error("Erro ao carregar votações")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const handleVote = async (projectId: string) => {
        if (!user) return
        setVotingId(projectId)

        try {
            const { error } = await supabase
                .from('votes')
                .insert({
                    user_id: user.id,
                    project_id: projectId,
                    value: 1
                })

            if (error) throw error

            // Update local state
            setUserVotes(prev => [...prev, projectId])
            setProjects(prev => prev.map(p =>
                p.id === projectId
                    ? { ...p, votes: p.votes + 1 }
                    : p
            ))

            toast.success("Voto registrado com sucesso!")

        } catch (error: any) {
            toast.error("Erro ao votar: " + error.message)
        } finally {
            setVotingId(null)
        }
    }

    return (
        <div className="space-y-16 transition-apple animate-in fade-in duration-700">
            {/* Header - Apple Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-3">
                    <Badge variant="outline" className="border-heritage-navy/10 dark:border-white/10 text-heritage-navy dark:text-white/60 px-4 py-1 rounded-full uppercase text-[9px] font-black tracking-[0.2em] backdrop-blur-xl">
                        Governança Ativa
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black text-heritage-navy dark:text-white tracking-tighter transition-apple">
                        Sua Voz, <br /><span className="text-heritage-gold">Nosso Futuro</span>.
                    </h1>
                </div>
                <div className="glass-card px-8 py-4 rounded-[32px] border-none shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-heritage-navy dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-heritage-gold">
                        <LucideVote className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-black text-heritage-navy/40 dark:text-white/40 uppercase tracking-widest">Assembleia Geral</div>
                        <div className="text-sm font-black text-heritage-navy dark:text-white transition-apple">Sessão 2026.01</div>
                    </div>
                </div>
            </div>

            {/* Voting Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {projects.map((p, i) => {
                    const hasVoted = userVotes.includes(p.id)
                    const isVoting = votingId === p.id

                    return (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="glass-card rounded-[48px] border-none shadow-sm overflow-hidden group transition-apple hover:shadow-2xl h-full flex flex-col">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-apple 
                                            ${hasVoted
                                                ? 'bg-heritage-success text-white'
                                                : 'bg-heritage-sand dark:bg-zinc-900 text-heritage-navy dark:text-white group-hover:bg-heritage-gold group-hover:text-heritage-navy'
                                            }`}>
                                            {hasVoted ? <LucideCheck className="w-7 h-7" /> : <LucideVote className="w-7 h-7" />}
                                        </div>
                                        <Badge className="bg-heritage-success/10 text-heritage-success border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">Ativo</Badge>
                                    </div>
                                    <CardTitle className="text-2xl font-black text-heritage-navy dark:text-white leading-tight transition-apple group-hover:text-heritage-terracotta">{p.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-10 flex-1 flex flex-col justify-between">
                                    <p className="text-heritage-navy/50 dark:text-white/30 font-medium leading-relaxed transition-apple">{p.description}</p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-heritage-navy/20 dark:text-white/20">
                                            <span>Quorum Necessário</span>
                                            <span className="text-heritage-navy dark:text-white transition-apple">{p.votes} / {p.goal}</span>
                                        </div>
                                        <div className="h-2 w-full bg-heritage-navy/5 dark:bg-white/5 rounded-full overflow-hidden transition-apple">
                                            <div
                                                className="h-full bg-heritage-navy dark:bg-heritage-gold transition-all duration-1000"
                                                style={{ width: `${Math.min((p.votes / p.goal) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleVote(p.id)}
                                        disabled={hasVoted || isVoting || loading}
                                        className={`w-full h-16 rounded-[24px] font-black uppercase tracking-widest text-xs transition-apple shadow-lg hover:shadow-xl
                                            ${hasVoted
                                                ? 'bg-heritage-success/20 text-heritage-success hover:bg-heritage-success/20'
                                                : 'bg-heritage-navy dark:bg-zinc-800 hover:bg-heritage-ocean dark:hover:bg-zinc-700'
                                            }
                                        `}>
                                        {isVoting ? (
                                            <LucideLoader2 className="w-5 h-5 animate-spin" />
                                        ) : hasVoted ? (
                                            "Voto Registrado"
                                        ) : (
                                            "Votar Agora"
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Info Section - Apple Style */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="glass-card rounded-[56px] border-none p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 transition-apple"
            >
                <div className="w-24 h-24 bg-heritage-navy dark:bg-zinc-900 rounded-[32px] flex items-center justify-center shrink-0 transition-apple">
                    <LucideInfo className="w-12 h-12 text-heritage-gold" />
                </div>
                <div className="space-y-4 flex-1 text-center lg:text-left">
                    <h3 className="text-3xl font-black text-heritage-navy dark:text-white tracking-tight transition-apple">Segurança & Transparência</h3>
                    <p className="text-xl text-heritage-navy/40 dark:text-white/30 font-medium leading-relaxed transition-apple">Cada associado com quotas em dia tem direito a 1 voto por projeto. Todos os votos são auditados e imutáveis.</p>
                </div>
                <Button variant="outline" className="border-heritage-navy/10 dark:border-white/10 text-heritage-navy dark:text-white/60 hover:bg-heritage-navy hover:text-white dark:hover:bg-white dark:hover:text-heritage-navy rounded-[24px] h-16 px-12 font-black transition-apple shrink-0">
                    Ver Estatutos
                </Button>
            </motion.div>
        </div>
    )
}
