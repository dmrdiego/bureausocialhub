import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
    LucideCheckCircle2,
    LucideXCircle,
    LucideMinusCircle,
    LucideLoader2,
    LucideGavel,
    LucideCalendar
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Assembly {
    id: string
    title: string
    date: string
    status: 'scheduled' | 'open_for_voting' | 'closed' | 'completed'
}

interface AssemblyItem {
    id: string
    title: string
    description: string
    type: 'discussion' | 'voting_simple' | 'election'
    order_index: number
}

interface UserVote {
    assembly_item_id: string
    vote_option: 'approve' | 'reject' | 'abstain'
}

export default function AssemblyLive() {
    const { profile } = useAuth()
    const [activeAssembly, setActiveAssembly] = useState<Assembly | null>(null)
    const [agendaItems, setAgendaItems] = useState<AssemblyItem[]>([])
    const [userVotes, setUserVotes] = useState<UserVote[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [votingItem, setVotingItem] = useState<string | null>(null)

    // Poll for active assembly and data
    const fetchLiveData = async () => {
        try {
            // 1. Get active assembly
            const { data: assemblyData, error: assemblyError } = await supabase
                .from('assemblies')
                .select('*')
                .eq('status', 'open_for_voting')
                .single()

            if (assemblyError || !assemblyData) {
                setActiveAssembly(null)
                setIsLoading(false)
                return
            }

            setActiveAssembly(assemblyData)

            // 2. Get Agenda Items
            const { data: itemsData, error: itemsError } = await supabase
                .from('assembly_items')
                .select('*')
                .eq('assembly_id', assemblyData.id)
                .order('order_index', { ascending: true })

            if (itemsError) throw itemsError
            setAgendaItems(itemsData || [])

            // 3. Get User's Votes for this assembly's items
            if (profile) {
                const { data: votesData, error: votesError } = await supabase
                    .from('votes')
                    .select('assembly_item_id, vote_option')
                    .eq('user_id', profile.id)
                    .in('assembly_item_id', itemsData?.map((i: any) => i.id) || [])

                if (votesError) throw votesError
                setUserVotes(votesData || [])
            }

        } catch (err: any) {
            console.error("Error fetching live assembly data:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLiveData()
        // Simple polling every 10s for updates
        const interval = setInterval(fetchLiveData, 10000)
        return () => clearInterval(interval)
    }, [profile])


    const handleVote = async (itemId: string, option: 'approve' | 'reject' | 'abstain') => {
        if (!profile || !activeAssembly) return
        setVotingItem(itemId)

        // Determine weight based on profile category (simplified logic)
        // Founder = 3, Effective = 1 (Default)
        const weight = profile.member_category === 'fundador' ? 3 : 1

        try {
            const { error } = await supabase
                .from('votes')
                .insert([{
                    user_id: profile.id,
                    assembly_item_id: itemId,
                    vote_option: option,
                    weight: weight
                }])

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast.error("Você já votou neste item.")
                } else {
                    throw error
                }
            } else {
                toast.success("Voto registrado com sucesso!")
                // Optimistic update
                setUserVotes([...userVotes, { assembly_item_id: itemId, vote_option: option }])
            }
        } catch (err: any) {
            toast.error("Erro ao registrar voto", { description: err.message })
        } finally {
            setVotingItem(null)
        }
    }

    const hasVoted = (itemId: string) => userVotes.some(v => v.assembly_item_id === itemId)
    const getMyVote = (itemId: string) => userVotes.find(v => v.assembly_item_id === itemId)?.vote_option

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LucideLoader2 className="w-8 h-8 animate-spin text-heritage-navy/20" />
            </div>
        )
    }

    if (!activeAssembly) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-20 h-20 bg-heritage-navy/5 rounded-full flex items-center justify-center">
                    <LucideGavel className="w-10 h-10 text-heritage-navy/20" />
                </div>
                <h2 className="text-2xl font-black text-heritage-navy dark:text-white">Nenhuma Assembleia Ativa</h2>
                <p className="text-heritage-navy/40 dark:text-white/40 max-w-sm">
                    No momento não há nenhuma votação decorrendo ao vivo.
                    Verifique o calendário ou aguarde a notificação.
                </p>
                <Button variant="outline" className="rounded-xl mt-4" onClick={fetchLiveData}>
                    Verificar Novamente
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-heritage-navy text-white rounded-[32px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="destructive" className="animate-pulse bg-red-500 hover:bg-red-600 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
                            Ao Vivo
                        </Badge>
                        <span className="text-white/60 text-sm font-medium flex items-center gap-2">
                            <LucideCalendar className="w-4 h-4" />
                            {new Date(activeAssembly.date || new Date()).toLocaleDateString('pt-PT')}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">{activeAssembly.title}</h1>
                    <p className="text-white/70 max-w-xl">
                        Participe das decisões do Bureau Social. Vote nos itens abaixo conforme chamados pela mesa.
                    </p>
                </div>
            </div>

            {/* Agenda Items */}
            <div className="space-y-6">
                {agendaItems.map((item, index) => {
                    const voted = hasVoted(item.id)
                    const myVote = getMyVote(item.id)
                    const isVotingType = item.type === 'voting_simple' || item.type === 'election'

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`
                                border-none shadow-lg rounded-[24px] overflow-hidden transition-all
                                ${voted
                                    ? 'bg-heritage-sand/10 dark:bg-zinc-900 border-2 border-heritage-success/20'
                                    : 'bg-white dark:bg-zinc-800 ring-1 ring-black/5'}
                            `}>
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-heritage-navy/10 dark:bg-white/10 flex items-center justify-center font-black text-heritage-navy dark:text-white shrink-0">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-heritage-navy dark:text-white">{item.title}</h3>
                                                <Badge variant="outline" className="uppercase text-[10px]">
                                                    {item.type === 'voting_simple' ? 'Votação' : item.type === 'election' ? 'Eleição' : 'Discussão'}
                                                </Badge>
                                            </div>
                                            <p className="text-heritage-navy/60 dark:text-white/60 leading-relaxed">
                                                {item.description || "Sem descrição detalhada."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Voting Area */}
                                    {isVotingType && (
                                        <div className="pl-14">
                                            {voted ? (
                                                <div className="p-4 rounded-xl bg-heritage-success/10 border border-heritage-success/20 flex items-center gap-3 text-heritage-success font-bold">
                                                    <LucideCheckCircle2 className="w-5 h-5" />
                                                    Voto registrado: {
                                                        myVote === 'approve' ? 'A Favor' :
                                                            myVote === 'reject' ? 'Contra' : 'Abstenção'
                                                    }
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-3">
                                                    <Button
                                                        onClick={() => handleVote(item.id, 'approve')}
                                                        disabled={!!votingItem}
                                                        className="flex-1 bg-heritage-success hover:bg-heritage-success/90 text-white font-bold h-12 rounded-xl"
                                                    >
                                                        <LucideCheckCircle2 className="w-5 h-5 mr-2" />
                                                        A Favor
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleVote(item.id, 'reject')}
                                                        disabled={!!votingItem}
                                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl"
                                                    >
                                                        <LucideXCircle className="w-5 h-5 mr-2" />
                                                        Contra
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleVote(item.id, 'abstain')}
                                                        disabled={!!votingItem}
                                                        variant="secondary"
                                                        className="flex-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 text-gray-600 dark:text-gray-300 font-bold h-12 rounded-xl"
                                                    >
                                                        <LucideMinusCircle className="w-5 h-5 mr-2" />
                                                        Abster-se
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
