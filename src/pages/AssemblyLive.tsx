import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { logSystemError } from "@/lib/errorLogger"
import {
    LucideCheckCircle2,
    LucideXCircle,
    LucideMinusCircle,
    LucideLoader2,
    LucideGavel,
    LucideCalendarDays,
    LucideClock,
    LucideChevronRight,
    LucideVote,
    LucideMessageSquare,
    LucideUsers,
    LucideLogIn
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

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
    const [attendanceCount, setAttendanceCount] = useState(0)
    const [isCheckedIn, setIsCheckedIn] = useState(false)
    const [isCheckingIn, setIsCheckingIn] = useState(false)
    const [elapsedTime, setElapsedTime] = useState("00:00:00")

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

                // 4. Check if user is checked in
                const { data: attendanceData } = await supabase
                    .from('assembly_attendances')
                    .select('id')
                    .eq('assembly_id', assemblyData.id)
                    .eq('user_id', profile.id)
                    .single()

                setIsCheckedIn(!!attendanceData)
            }

            // 5. Get total attendance count
            const { data: allAttendance } = await supabase
                .from('assembly_attendances')
                .select('id')
                .eq('assembly_id', assemblyData.id)

            setAttendanceCount(allAttendance?.length || 0)

        } catch (err: any) {
            console.error("Error fetching live assembly data:", err)
            logSystemError(err, 'AssemblyLive.fetchLiveData', profile?.id)
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

    // Elapsed time timer
    useEffect(() => {
        if (!activeAssembly) return

        const updateTimer = () => {
            const start = new Date(activeAssembly.date).getTime()
            const now = Date.now()
            const diff = Math.max(0, now - start)

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setElapsedTime(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            )
        }

        updateTimer()
        const timerInterval = setInterval(updateTimer, 1000)
        return () => clearInterval(timerInterval)
    }, [activeAssembly])


    const handleVote = async (itemId: string, option: 'approve' | 'reject' | 'abstain') => {
        if (!profile || !activeAssembly) return

        // 1. Permission Check
        if (!profile.can_vote || profile.quota_status !== 'active') {
            toast.error("A sua categoria ou status de quota não permite votar nesta assembleia.")
            return
        }

        setVotingItem(itemId)

        // Determine weight based on profile category
        const weight = profile.member_category === 'fundador' ? 3 : 1

        try {
            const { error } = await supabase
                .from('votes')
                .insert([{
                    user_id: profile.id,
                    assembly_item_id: itemId,
                    vote_option: option,
                    weight: weight,
                    project_id: null // Explicitly null to avoid constraint issues if table allows nulls now
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
            console.error(err)
            toast.error("Erro ao registrar voto", { description: err.message || "Tente novamente." })
            logSystemError(err, 'AssemblyLive.handleVote', profile?.id)
        } finally {
            setVotingItem(null)
        }
    }

    // Handle Check-In
    const handleCheckIn = async () => {
        if (!profile || !activeAssembly || isCheckedIn) {
            console.warn("Cannot check-in:", { profile: !!profile, activeAssembly: !!activeAssembly, isCheckedIn });
            return
        }
        setIsCheckingIn(true)

        console.log("Checking into assembly:", activeAssembly.id, "for user:", profile.id);

        try {
            const { error } = await supabase
                .from('assembly_attendances')
                .insert([{
                    assembly_id: activeAssembly.id,
                    user_id: profile.id
                }])

            if (error) {
                console.error("Supabase check-in error:", error);
                if (error.code === '23505') {
                    toast.info("Você já está registado nesta assembleia.")
                    setIsCheckedIn(true)
                } else {
                    throw error
                }
            } else {
                console.log("Check-in success!");
                toast.success("Presença registada com sucesso!")
                setIsCheckedIn(true)
                setAttendanceCount(prev => prev + 1)
            }
        } catch (err: any) {
            console.error("Catch check-in error:", err);
            toast.error("Erro ao registar presença")
            logSystemError(err, 'AssemblyLive.handleCheckIn', profile?.id)
        } finally {
            setIsCheckingIn(false)
        }
    }

    // Generate Minutes (Ata 2.0)
    const handleGenerateMinutes = async () => {
        if (!activeAssembly || !profile || profile.role !== 'admin') return
        const loadingToast = toast.loading("Gerando Ata consolidada...")

        try {
            // 1. Fetch full attendance with names
            const { data: attendance, error: attError } = await supabase
                .from('assembly_attendances')
                .select(`
                    id,
                    user_id,
                    profiles:user_id (full_name, member_number, member_category)
                `)
                .eq('assembly_id', activeAssembly.id)

            if (attError) throw attError

            // 2. Fetch full votes for consolidation
            const { data: votes, error: votesError } = await supabase
                .from('votes')
                .select('*')
                .in('assembly_item_id', agendaItems.map(i => i.id))

            if (votesError) throw votesError

            // 3. Create PDF
            const doc = new jsPDF()
            const primaryColor = "#1B2B44" // Heritage Navy

            // Header
            doc.setFillColor(primaryColor)
            doc.rect(0, 0, 210, 40, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(22)
            doc.setFont("helvetica", "bold")
            doc.text("ATA DE ASSEMBLEIA GERAL", 105, 20, { align: "center" })
            doc.setFontSize(10)
            doc.text(`BUREAU SOCIAL HUB - REABILITAÇÃO E TRADIÇÃO`, 105, 30, { align: "center" })

            // Info Section
            doc.setTextColor(60, 60, 60)
            doc.setFontSize(12)
            doc.text(`Assembleia: ${activeAssembly.title}`, 20, 50)
            doc.text(`Data: ${new Date(activeAssembly.date).toLocaleString('pt-PT')}`, 20, 57)
            doc.text(`Local: Portal Digital Bureau Social`, 20, 64)
            doc.text(`Quórum: ${attendance.length} Associados Registados`, 20, 71)

            // Attendees Table
            doc.setFont("helvetica", "bold")
            doc.text("1. LISTA DE PRESENÇAS", 20, 85)
            const attendeeRows = attendance.map((at: any) => [
                at.profiles?.full_name || "Desconhecido",
                at.profiles?.member_number || "-",
                at.profiles?.member_category || "Membro"
            ])

                ; (doc as any).autoTable({
                    startY: 90,
                    head: [['Nome Completo', 'Nº Sócio', 'Categoria']],
                    body: attendeeRows,
                    theme: 'striped',
                    headStyles: { fillStyle: primaryColor }
                })

            // Voting Results
            let currentY = (doc as any).lastAutoTable.finalY + 15
            doc.setFont("helvetica", "bold")
            doc.text("2. DELIBERAÇÕES E VOTAÇÕES", 20, currentY)
            currentY += 10

            agendaItems.forEach((item, index) => {
                if (currentY > 250) {
                    doc.addPage()
                    currentY = 20
                }

                const itemVotes = votes.filter((v: any) => v.assembly_item_id === item.id)
                const approves = itemVotes.filter((v: any) => v.vote_option === 'approve').reduce((acc: number, v: any) => acc + (v.weight || 1), 0)
                const rejects = itemVotes.filter((v: any) => v.vote_option === 'reject').reduce((acc: number, v: any) => acc + (v.weight || 1), 0)
                const abstains = itemVotes.filter((v: any) => v.vote_option === 'abstain').reduce((acc: number, v: any) => acc + (v.weight || 1), 0)
                const total = approves + rejects + abstains

                doc.setFontSize(11)
                doc.setFont("helvetica", "bold")
                doc.text(`${index + 1}. ${item.title}`, 25, currentY)
                currentY += 7
                doc.setFont("helvetica", "normal")
                doc.setFontSize(10)
                doc.text(`Resultado: ${approves} Favor | ${rejects} Contra | ${abstains} Abstenções (Peso Total: ${total})`, 30, currentY)

                const resultText = total > 0 && approves > (rejects + abstains) ? "APROVADO" : "REJEITADO / NÃO DELIBERADO"
                doc.setFont("helvetica", "bold")
                doc.text(`Conclusão: ${resultText}`, 30, currentY + 6)

                currentY += 18
            })

            // Footer / Signatures
            if (currentY > 240) {
                doc.addPage()
                currentY = 20
            }
            currentY += 20
            doc.line(20, currentY, 90, currentY)
            doc.line(120, currentY, 190, currentY)
            doc.setFontSize(9)
            doc.text("A Direção", 55, currentY + 5, { align: "center" })
            doc.text("O Secretariado", 155, currentY + 5, { align: "center" })

            doc.save(`Ata_${activeAssembly.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`)

            toast.dismiss(loadingToast)
            toast.success("Ata gerada com sucesso!")

        } catch (err: any) {
            console.error(err)
            toast.dismiss(loadingToast)
            toast.error("Erro ao gerar ata", { description: err.message })
        }
    }


    const hasVoted = (itemId: string) => userVotes.some(v => v.assembly_item_id === itemId)
    const getMyVote = (itemId: string) => userVotes.find(v => v.assembly_item_id === itemId)?.vote_option

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <LucideLoader2 className="w-10 h-10 animate-spin text-heritage-gold" />
            </div>
        )
    }

    if (!activeAssembly) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md space-y-6"
                >
                    <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[32px] flex items-center justify-center shadow-xl mx-auto mb-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-heritage-navy/5 to-heritage-gold/20" />
                        <LucideGavel className="w-10 h-10 text-heritage-navy dark:text-white relative z-10" />
                    </div>

                    <h2 className="text-3xl font-black text-heritage-navy dark:text-white tracking-tight">
                        Nenhuma Assembleia Ativa
                    </h2>
                    <p className="text-lg text-heritage-navy/60 dark:text-white/60 leading-relaxed font-medium">
                        No momento não há sessões de votação decorrendo ao vivo.<br />
                        Consulte as notificações ou o calendário.
                    </p>
                    <Button
                        size="lg"
                        variant="ghost"
                        className="rounded-full mt-4 text-heritage-navy dark:text-white hover:bg-heritage-navy/5"
                        onClick={fetchLiveData}
                    >
                        Verificar Novamente <LucideChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] dark:bg-zinc-950 transition-colors pb-32">
            {/* Immersive Hero Header */}
            <header className="relative w-full h-[320px] lg:h-[380px] bg-heritage-navy-fixed overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577415124269-fc1140a69e91?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-heritage-navy-fixed via-heritage-navy-fixed/80 to-transparent"></div>


                <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-red-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-red-500/20 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                                Em Direto
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                                <LucideCalendarDays className="w-3.5 h-3.5" />
                                {new Date(activeAssembly.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
                            {activeAssembly.title}
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl font-medium leading-relaxed">
                            Participe democraticamente na governação do Bureau Social.
                            <br className="hidden md:block" /> A sua voz define o nosso futuro.
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* Agenda Container */}
            <main className="container mx-auto px-4 md:px-6 -mt-8 relative z-20 space-y-6">

                {/* Stats / Info Bar */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-heritage-navy/5 p-4 flex flex-wrap gap-6 md:gap-12 items-center justify-between border border-heritage-navy/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-heritage-sand/30 dark:bg-white/5 flex items-center justify-center text-heritage-gold">
                            <LucideUsers className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-heritage-navy/40 dark:text-white/40 tracking-wider">Quórum Atual</p>
                            <p className="text-lg font-bold text-heritage-navy dark:text-white">{attendanceCount} Membros</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-heritage-sand/30 dark:bg-white/5 flex items-center justify-center text-heritage-gold">
                            <LucideClock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-heritage-navy/40 dark:text-white/40 tracking-wider">Tempo Decorrido</p>
                            <p className="text-lg font-bold text-heritage-navy dark:text-white">{elapsedTime}</p>
                        </div>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-heritage-navy/10 dark:bg-white/10"></div>

                    {/* Check-In Button */}
                    {!isCheckedIn ? (
                        <Button
                            onClick={handleCheckIn}
                            disabled={isCheckingIn}
                            className="bg-heritage-success hover:bg-heritage-success/90 rounded-xl h-12 px-6 font-bold text-sm shadow-lg"
                        >
                            {isCheckingIn ? (
                                <LucideLoader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <LucideLogIn className="w-4 h-4 mr-2" />
                            )}
                            Registar Presença
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 text-heritage-success font-bold">
                            <LucideCheckCircle2 className="w-5 h-5" />
                            <span className="text-sm">Presença Confirmada</span>
                        </div>
                    )}

                    <div className="ml-auto text-right hidden md:block">
                        <p className="text-sm font-medium text-heritage-navy/60 dark:text-white/60">Sessão ID: #{activeAssembly.id.slice(0, 8)}</p>
                    </div>
                </div>

                <div className="h-6"></div> {/* Spacer */}

                <h3 className="text-sm font-bold uppercase tracking-widest text-heritage-navy/40 dark:text-white/40 px-2">Ordem de Trabalhos</h3>

                {/* Agenda Items List */}
                <div className="grid gap-6">
                    {agendaItems.map((item, index) => {
                        const voted = hasVoted(item.id)
                        const myVote = getMyVote(item.id)
                        const isVotingType = item.type === 'voting_simple' || item.type === 'election'
                        const isActive = true // You could add logic to highlight only the current item needing vote

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={`relative group ${isActive ? 'scale-[1.01]' : 'opacity-80'}`}>
                                    {/* Connectivity Line */}
                                    {index !== agendaItems.length - 1 && (
                                        <div className="absolute left-[28px] top-16 bottom-[-24px] w-0.5 bg-heritage-navy/10 dark:bg-white/10 z-0"></div>
                                    )}

                                    <Card className={`
                                        border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] overflow-hidden
                                        ${voted
                                            ? 'bg-gradient-to-br from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-900/50'
                                            : 'bg-white dark:bg-zinc-800'}
                                    `}>
                                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 relative z-10">

                                            {/* Index Number */}
                                            <div className="flex-shrink-0">
                                                <div className={`
                                                    w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner
                                                    ${voted
                                                        ? 'bg-heritage-success/10 text-heritage-success'
                                                        : 'bg-heritage-navy text-white shadow-heritage-navy/30 dark:shadow-none'}
                                                `}>
                                                    {voted ? <LucideCheckCircle2 className="w-7 h-7" /> : (index + 1)}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow space-y-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <Badge variant={item.type === 'discussion' ? 'secondary' : 'default'} className="rounded-full px-3 py-1 uppercase text-[10px] tracking-wider font-bold shadow-none">
                                                        {item.type === 'voting_simple' ? (
                                                            <><LucideVote className="w-3 h-3 mr-1.5" /> Votação</>
                                                        ) : item.type === 'election' ? (
                                                            <><LucideUsers className="w-3 h-3 mr-1.5" /> Eleição</>
                                                        ) : (
                                                            <><LucideMessageSquare className="w-3 h-3 mr-1.5" /> Discussão</>
                                                        )}
                                                    </Badge>
                                                    {voted && (
                                                        <Badge variant="outline" className="text-heritage-success border-heritage-success/30 bg-heritage-success/5 rounded-full px-3 py-1 uppercase text-[10px] tracking-wider font-bold">
                                                            Voto Registrado
                                                        </Badge>
                                                    )}
                                                </div>

                                                <h3 className="text-2xl font-bold text-heritage-navy dark:text-white leading-tight">
                                                    {item.title}
                                                </h3>
                                                <p className="text-heritage-navy/70 dark:text-white/70 text-base leading-relaxed max-w-2xl">
                                                    {item.description || "Sem descrição disponível."}
                                                </p>

                                                {/* Action Area */}
                                                {isVotingType && (
                                                    <div className="pt-6">
                                                        {voted ? (
                                                            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-heritage-success/10 border border-heritage-success/10 text-heritage-success font-bold">
                                                                <span className="text-sm uppercase tracking-wide opacity-70">A sua escolha:</span>
                                                                <span className="text-lg">
                                                                    {myVote === 'approve' && 'A Favor'}
                                                                    {myVote === 'reject' && 'Contra'}
                                                                    {myVote === 'abstain' && 'Abstenção'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                                                                <Button
                                                                    onClick={() => handleVote(item.id, 'approve')}
                                                                    disabled={!!votingItem}
                                                                    className="h-14 rounded-2xl bg-heritage-success hover:bg-heritage-success/90 text-white font-bold text-base shadow-lg shadow-heritage-success/20 hover:-translate-y-0.5 transition-all"
                                                                >
                                                                    <LucideCheckCircle2 className="w-5 h-5 mr-2" />
                                                                    A Favor
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleVote(item.id, 'reject')}
                                                                    disabled={!!votingItem}
                                                                    className="h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all"
                                                                >
                                                                    <LucideXCircle className="w-5 h-5 mr-2" />
                                                                    Contra
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleVote(item.id, 'abstain')}
                                                                    disabled={!!votingItem}
                                                                    className="h-14 rounded-2xl bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 text-gray-600 dark:text-white font-bold text-base border border-transparent hover:border-gray-300 hover:-translate-y-0.5 transition-all"
                                                                >
                                                                    <LucideMinusCircle className="w-5 h-5 mr-2" />
                                                                    Abster-se
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Admin Controls: Generate Minutes (Visible only to Admin) */}
                {profile?.role === 'admin' && (
                    <div className="mt-12 p-10 bg-heritage-navy rounded-[40px] text-white space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-heritage-gold/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-2">Finalizar Assembleia</h3>
                            <p className="text-white/60 font-medium mb-8">Como administrador, pode encerrar a votação e gerar a ata oficial com os resultados consolidados.</p>

                            <div className="flex gap-4">
                                <Button
                                    className="bg-white text-heritage-navy hover:bg-heritage-gold hover:text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs transition-apple"
                                    onClick={handleGenerateMinutes}
                                >
                                    Gerar Ata (Ata 2.0)
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-white/20 hover:bg-white/10 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs transition-apple"
                                    onClick={() => toast.warning("Encerrar Assembleia?", {
                                        description: "Isto impedirá novos votos.",
                                        action: { label: "Confirmar", onClick: () => { } }
                                    })}
                                >
                                    Encerrar Sessão
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
