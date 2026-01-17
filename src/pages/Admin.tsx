import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    LucideUsers,
    LucideFileCheck,
    LucideFileClock,
    LucideCheck,
    LucideX,
    LucideEye,
    LucideSettings,
    LucideFileText,
    LucideShield,
    LucideEdit,
    LucideSave,
    LucideSearch,
    LucideCalendar,
    LucidePlus,
    LucideGavel,
    LucideVote,
    LucideRefreshCw,
    LucideMail,
    LucideTrash2,
    LucideCheckCircle2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

// Type definition for Candidatura Data coming from DB
interface CandidaturaDB {
    id: string
    user_id: string
    status: string
    created_at: string
    form_data: any // JSONB
}

interface UserProfile {
    id: string
    full_name: string
    email: string
    role: string
    quota_status: string
    phone?: string
    nif?: string
    created_at: string
}

interface EmailTemplate {
    id: string
    subject: string
    body_markdown: string
    updated_at: string
}


interface Assembly {
    id: string
    title: string
    description: string
    date: string
    location: string
    meeting_link: string
    status: 'scheduled' | 'open_for_voting' | 'closed' | 'completed'
}

interface AssemblyItem {
    id: string
    assembly_id: string
    title: string
    description: string
    type: 'discussion' | 'voting_simple' | 'election'
    order_index: number
}

type CandidaturaStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'submitted'

const statusConfig: Record<string, { label: string; color: string; icon: typeof LucideFileClock }> = {
    submitted: { label: 'Nova', color: 'bg-heritage-terracotta/20 text-heritage-terracotta', icon: LucideFileClock },
    pending: { label: 'Pendente', color: 'bg-heritage-gold/20 text-heritage-gold', icon: LucideFileClock },
    reviewing: { label: 'Em Análise', color: 'bg-heritage-ocean/20 text-heritage-ocean', icon: LucideFileCheck },
    approved: { label: 'Aprovada', color: 'bg-heritage-success/20 text-heritage-success', icon: LucideCheck },
    rejected: { label: 'Rejeitada', color: 'bg-red-500/20 text-red-500', icon: LucideX },
}

export default function Admin() {
    const { profile } = useAuth()
    const [candidaturas, setCandidaturas] = useState<CandidaturaDB[]>([])
    const [members, setMembers] = useState<UserProfile[]>([])
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
    const [assemblies, setAssemblies] = useState<Assembly[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Assembly Form State
    const [isCreatingAssembly, setIsCreatingAssembly] = useState(false)
    const [newAssembly, setNewAssembly] = useState({
        title: '',
        date: '',
        location: 'Sede Virtual (Zoom)',
        description: ''
    })

    // Email Editing State
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)

    const fetchAllData = async () => {
        setIsLoading(true)
        try {
            // Fetch Candidaturas
            const { data: candidaturasData, error: candidaturasError } = await supabase
                .from('candidaturas')
                .select('*')
                .order('created_at', { ascending: false })
            if (candidaturasError) throw candidaturasError
            setCandidaturas(candidaturasData || [])

            // Fetch Members (Profiles)
            const { data: membersData, error: membersError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
            if (membersError) throw membersError
            setMembers(membersData || [])

            if (membersError) throw membersError
            setMembers(membersData || [])

            // Fetch Email Templates
            const { data: templatesData, error: templatesError } = await supabase
                .from('email_templates')
                .select('*')
            if (templatesError) throw templatesError
            setEmailTemplates(templatesData || [])


            // Fetch Assemblies
            const { data: assembliesData, error: assembliesError } = await supabase
                .from('assemblies')
                .select('*')
                .order('date', { ascending: false })
            if (assembliesError) throw assembliesError
            setAssemblies(assembliesData || [])

        } catch (err: any) {
            toast.error("Erro ao carregar dados", { description: err.message })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const stats = {
        total: candidaturas.length,
        members: members.length,
        pending: candidaturas.filter(c => c.status === 'submitted' || c.status === 'pending').length,
        reviewing: candidaturas.filter(c => c.status === 'reviewing').length,
        approved: candidaturas.filter(c => c.status === 'approved').length,
        rejected: candidaturas.filter(c => c.status === 'rejected').length,
    }



    // Agenda/Assembly Management State
    const [selectedAssemblyId, setSelectedAssemblyId] = useState<string | null>(null)
    const [editingAssembly, setEditingAssembly] = useState<Assembly | null>(null)
    const [assemblyItems, setAssemblyItems] = useState<AssemblyItem[]>([])
    const [isAgendaEditorOpen, setIsAgendaEditorOpen] = useState(false)

    const [newItem, setNewItem] = useState({ title: '', description: '', type: 'discussion' as const })

    // Session Control State
    const [isSessionControlOpen, setIsSessionControlOpen] = useState(false)
    const [liveStats, setLiveStats] = useState<Record<string, { approve: number, reject: number, abstain: number }>>({})

    const fetchAssemblyItems = async (assemblyId: string) => {
        const { data, error } = await supabase
            .from('assembly_items')
            .select('*')
            .eq('assembly_id', assemblyId)
            .order('order_index', { ascending: true })

        if (error) {
            toast.error("Erro ao carregar pauta")
            return
        }
        setAssemblyItems(data || [])
    }

    const handleOpenAgenda = (assembly: Assembly) => {
        setEditingAssembly(assembly)
        setSelectedAssemblyId(assembly.id)
        fetchAssemblyItems(assembly.id)
        setIsAgendaEditorOpen(true)
    }

    const handleAddItem = async () => {
        if (!selectedAssemblyId || !newItem.title) return

        try {
            const { data, error } = await supabase
                .from('assembly_items')
                .insert([{
                    assembly_id: selectedAssemblyId,
                    title: newItem.title,
                    description: newItem.description,
                    type: newItem.type,
                    order_index: assemblyItems.length + 1
                }])
                .select()
                .single()

            if (error) throw error

            setAssemblyItems([...assemblyItems, data])
            setNewItem({ title: '', description: '', type: 'discussion' })
            toast.success("Item adicionado à pauta")
        } catch (err: any) {
            toast.error("Erro ao adicionar item", { description: err.message })
        }
    }

    const handleDeleteItem = async (itemId: string) => {
        try {
            const { error } = await supabase
                .from('assembly_items')
                .delete()
                .eq('id', itemId)

            if (error) throw error

            setAssemblyItems(assemblyItems.filter(i => i.id !== itemId))
            toast.success("Item removido")
        } catch (err: any) {
            toast.error("Erro ao remover item")
        }


    }

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            toast.success(`Role atualizada para ${newRole}`)

            // Update local state
            setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m))
        } catch (err: any) {
            toast.error("Erro ao atualizar role", { description: err.message })
        }
    }

    const handleOpenSessionControl = async (assembly: Assembly) => {
        setEditingAssembly(assembly)
        setSelectedAssemblyId(assembly.id)

        // Fetch items and votes for stats
        const { data: items } = await supabase
            .from('assembly_items')
            .select('*, votes(*)')
            .eq('assembly_id', assembly.id)
            .order('order_index')

        if (items) {
            setAssemblyItems(items)

            // Calculate stats
            const stats: any = {}
            items.forEach((item: any) => {
                const itemVotes = item.votes || []
                stats[item.id] = {
                    approve: itemVotes.filter((v: any) => v.vote_option === 'approve').reduce((acc: number, v: any) => acc + (v.weight || 1), 0),
                    reject: itemVotes.filter((v: any) => v.vote_option === 'reject').reduce((acc: number, v: any) => acc + (v.weight || 1), 0),
                    abstain: itemVotes.filter((v: any) => v.vote_option === 'abstain').reduce((acc: number, v: any) => acc + (v.weight || 1), 0),
                }
            })
            setLiveStats(stats)
        }

        setIsSessionControlOpen(true)
    }

    const handleUpdateStatus = async (newStatus: Assembly['status']) => {
        if (!selectedAssemblyId) return
        try {
            const { error } = await supabase
                .from('assemblies')
                .update({ status: newStatus })
                .eq('id', selectedAssemblyId)

            if (error) throw error

            toast.success(`Status atualizado para: ${newStatus}`)
            setEditingAssembly(prev => prev ? { ...prev, status: newStatus } : null)

            // Refresh main list
            fetchAllData()
        } catch (err) {
            toast.error("Erro ao atualizar status")
        }
    }






    const handleCreateAssembly = async () => {
        try {
            const { data, error } = await supabase
                .from('assemblies')
                .insert([{
                    title: newAssembly.title,
                    date: newAssembly.date,
                    location: newAssembly.location,
                    description: newAssembly.description,
                    status: 'scheduled'
                }])
                .select()
                .single()

            if (error) throw error

            setAssemblies([data, ...assemblies])
            setIsCreatingAssembly(false)
            setNewAssembly({ title: '', date: '', location: 'Sede Virtual (Zoom)', description: '' })
            toast.success("Assembleia agendada com sucesso!")
        } catch (err: any) {
            toast.error("Erro ao criar assembleia", { description: err.message })
        }
    }

    const handleStatusChange = async (id: string, newStatus: CandidaturaStatus) => {
        const previousStatus = candidaturas.find(c => c.id === id)?.status;

        // Optimistic Update
        setCandidaturas(prev =>
            prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
        )

        try {
            const { error } = await supabase
                .from('candidaturas')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error
            toast.success("Status atualizado")
        } catch (err: any) {
            toast.error("Erro ao atualizar status", { description: err.message })
            // Rollback
            setCandidaturas(prev =>
                prev.map(c => c.id === id ? { ...c, status: previousStatus || 'submitted' } : c)
            )
        }
    }

    const handleSaveTemplate = async () => {
        if (!editingTemplate) return

        try {
            const { error } = await supabase
                .from('email_templates')
                .update({
                    subject: editingTemplate.subject,
                    body_markdown: editingTemplate.body_markdown,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingTemplate.id)

            if (error) throw error

            toast.success("Template salvo com sucesso!")

            // Update local state
            setEmailTemplates(prev =>
                prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
            )
            setEditingTemplate(null)
        } catch (err: any) {
            toast.error("Erro ao salvar template", { description: err.message })
        }
    }

    const handleExportCSV = () => {
        if (members.length === 0) {
            toast.error("Não há dados para exportar")
            return
        }

        const headers = ["ID", "Nome", "Email", "NIF", "Telefone", "Role", "Status Quota", "Data Criação"]
        const csvContent = [
            headers.join(","),
            ...members.map(m => [
                m.id,
                `"${m.full_name}"`,
                m.email,
                m.nif || "",
                m.phone || "",
                m.role,
                m.quota_status,
                m.created_at
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `associados_bureau_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="space-y-10 transition-apple min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <LucideShield className="w-8 h-8 text-heritage-terracotta" />
                        <h1 className="text-4xl md:text-5xl font-black text-heritage-navy dark:text-white tracking-tighter transition-apple">
                            Painel <span className="text-heritage-terracotta">Admin</span>
                        </h1>
                    </div>
                    <p className="text-heritage-navy/40 dark:text-white/30 font-medium">
                        Gestão de candidaturas e configurações do Bureau Social
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchAllData}
                        className="rounded-full border-heritage-navy/10 hover:bg-heritage-sand/50"
                        disabled={isLoading}
                    >
                        <LucideRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Badge className="bg-heritage-terracotta/20 text-heritage-terracotta border-heritage-terracotta/30 px-4 py-1.5 rounded-full font-bold text-[10px] tracking-wider uppercase">
                        {profile?.full_name || 'Administrador'}
                    </Badge>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isLoading && candidaturas.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-[140px] rounded-[24px] bg-heritage-sand/50 dark:bg-zinc-800" />
                    ))
                ) : (
                    [
                        { label: 'Candidaturas', value: stats.total, icon: LucideFileText, color: 'text-heritage-navy dark:text-white' },
                        { label: 'Associados', value: stats.members, icon: LucideUsers, color: 'text-heritage-gold' },
                        { label: 'Análise', value: stats.reviewing, icon: LucideFileCheck, color: 'text-heritage-ocean' },
                        { label: 'Aprovadas', value: stats.approved, icon: LucideCheck, color: 'text-heritage-success' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -3 }}
                            className="glass-card p-6 rounded-[24px] border-none shadow-sm space-y-3 group transition-apple"
                        >
                            <stat.icon className={`w-5 h-5 ${stat.color} transition-apple group-hover:scale-110`} />
                            <div>
                                <div className={`text-3xl font-black ${stat.color} transition-apple`}>{stat.value}</div>
                                <p className="text-xs text-heritage-navy/40 dark:text-white/30 font-bold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="candidaturas" className="space-y-8">
                <TabsList className="bg-heritage-sand/30 dark:bg-zinc-900 p-2 rounded-[20px]">
                    <TabsTrigger value="candidaturas" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideFileText className="w-4 h-4 mr-2" />
                        Candidaturas
                    </TabsTrigger>
                    <TabsTrigger value="members" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideUsers className="w-4 h-4 mr-2" />
                        Associados
                    </TabsTrigger>
                    <TabsTrigger value="emails" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideMail className="w-4 h-4 mr-2" />
                        Emails
                    </TabsTrigger>
                    <TabsTrigger value="assemblies" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideGavel className="w-4 h-4 mr-2" />
                        Assembleias
                    </TabsTrigger>
                    <TabsTrigger value="config" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideSettings className="w-4 h-4 mr-2" />
                        Configurações
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="candidaturas" className="space-y-4">
                    <Card className="rounded-[32px] border-none shadow-sm glass-card overflow-hidden">
                        <CardHeader className="border-b border-heritage-navy/5 dark:border-white/5 p-8">
                            <CardTitle className="text-xl font-black text-heritage-navy dark:text-white">
                                Candidaturas ao Programa Moradia
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-heritage-navy/5 dark:divide-white/5">
                                <AnimatePresence mode="wait">
                                    {isLoading && candidaturas.length === 0 ? (
                                        <motion.div
                                            key="skeletons"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-8 space-y-8"
                                        >
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="flex gap-4 items-center">
                                                    <Skeleton className="w-12 h-12 rounded-2xl" />
                                                    <div className="space-y-2 flex-1">
                                                        <Skeleton className="h-4 w-1/3" />
                                                        <Skeleton className="h-3 w-1/4" />
                                                    </div>
                                                    <Skeleton className="w-20 h-6 rounded-full" />
                                                </div>
                                            ))}
                                        </motion.div>
                                    ) : candidaturas.length === 0 ? (
                                        <div className="p-16 text-center">
                                            <p className="text-heritage-navy/40 dark:text-white/30 font-bold">Nenhuma candidatura encontrada.</p>
                                        </div>
                                    ) : (
                                        <motion.div
                                            key="list"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="show"
                                        >
                                            {candidaturas.map((candidatura) => {
                                                // Extract details from form_data JSONB
                                                const nome = candidatura.form_data?.nome || 'Candidato Desconhecido'
                                                const oficio = candidatura.form_data?.oficio || 'Não especificado'
                                                const email = candidatura.form_data?.email || 'Sem email'
                                                const dataSubmissao = new Date(candidatura.created_at).toLocaleDateString('pt-PT')

                                                const status = statusConfig[candidatura.status] || statusConfig['pending']

                                                return (
                                                    <motion.div
                                                        key={candidatura.id}
                                                        variants={itemVariants}
                                                        className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-heritage-sand/10 dark:hover:bg-zinc-900/30 transition-apple"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-12 h-12 rounded-2xl bg-heritage-sand dark:bg-zinc-800 flex items-center justify-center text-heritage-navy dark:text-white font-black text-lg shadow-sm">
                                                                {nome.charAt(0)}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="font-bold text-heritage-navy dark:text-white">{nome}</h4>
                                                                <p className="text-sm text-heritage-navy/40 dark:text-white/30">{oficio}</p>
                                                                <p className="text-xs text-heritage-navy/20 dark:text-white/20">{email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                                            <Badge className={`${status.color} px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider`}>
                                                                {status.label}
                                                            </Badge>
                                                            <span className="text-xs text-heritage-navy/30 dark:text-white/20">
                                                                {dataSubmissao}
                                                            </span>

                                                            <div className="flex gap-2 ml-auto md:ml-4">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-10 w-10 p-0 rounded-xl hover:bg-heritage-ocean/20 hover:scale-105 active:scale-95 transition-transform"
                                                                    title="Ver detalhes"
                                                                >
                                                                    <LucideEye className="w-4 h-4 text-heritage-ocean" />
                                                                </Button>
                                                                {candidatura.status !== 'approved' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-10 w-10 p-0 rounded-xl hover:bg-heritage-success/20 hover:scale-105 active:scale-95 transition-transform"
                                                                        onClick={() => handleStatusChange(candidatura.id, 'approved')}
                                                                        title="Aprovar"
                                                                    >
                                                                        <LucideCheck className="w-4 h-4 text-heritage-success" />
                                                                    </Button>
                                                                )}
                                                                {candidatura.status !== 'rejected' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-10 w-10 p-0 rounded-xl hover:bg-red-500/20 hover:scale-105 active:scale-95 transition-transform"
                                                                        onClick={() => handleStatusChange(candidatura.id, 'rejected')}
                                                                        title="Rejeitar"
                                                                    >
                                                                        <LucideX className="w-4 h-4 text-red-500" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="members" className="space-y-4">
                    <Card className="rounded-[32px] border-none shadow-sm glass-card overflow-hidden">
                        <CardHeader className="border-b border-heritage-navy/5 dark:border-white/5 p-8 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black text-heritage-navy dark:text-white">
                                Base de Associados
                            </CardTitle>
                            <div className="flex gap-3">
                                <div className="relative w-64">
                                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-navy/40" />
                                    <Input
                                        placeholder="Buscar por nome ou nif..."
                                        className="pl-10 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none"
                                    />
                                </div>
                                <Button onClick={handleExportCSV} variant="outline" className="rounded-xl border-heritage-navy/10 hover:bg-heritage-sand/50">
                                    Exportar CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-heritage-navy/5 dark:divide-white/5">
                                {members.map((member) => (
                                    <div key={member.id} className="p-6 flex items-center justify-between hover:bg-heritage-sand/10 dark:hover:bg-zinc-900/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-heritage-navy/10 dark:bg-white/10 flex items-center justify-center font-bold text-heritage-navy dark:text-white">
                                                {member.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-heritage-navy dark:text-white">{member.full_name}</h4>
                                                <p className="text-sm text-heritage-navy/40 dark:text-white/40">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-heritage-navy dark:text-white">{member.nif || 'N/A'}</p>
                                                <p className="text-xs text-heritage-navy/40 dark:text-white/40">{member.phone || 'N/A'}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                                    {member.role === 'pending' ? 'Pendente' : member.role}
                                                </Badge>
                                                <div className="flex gap-1">
                                                    {member.role !== 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-[10px] px-2 text-heritage-navy/50 hover:text-heritage-navy"
                                                            onClick={() => handleUpdateRole(member.id, 'admin')}
                                                        >
                                                            Promover Admin
                                                        </Button>
                                                    )}
                                                    {member.role === 'pending' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-[10px] px-2 text-heritage-success hover:bg-heritage-success/10"
                                                            onClick={() => handleUpdateRole(member.id, 'member')}
                                                        >
                                                            Aprovar Membro
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <div className="p-10 text-center text-heritage-navy/40">Nenhum associado encontrado.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="emails" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* List of Templates */}
                        <div className="space-y-4">
                            {emailTemplates.map(template => (
                                <Card
                                    key={template.id}
                                    className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-none shadow-sm ${editingTemplate?.id === template.id ? 'ring-2 ring-heritage-terracotta' : ''}`}
                                    onClick={() => setEditingTemplate(template)}
                                >
                                    <CardHeader className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg font-bold text-heritage-navy dark:text-white mb-2">{template.subject}</CardTitle>
                                                <CardDescription className="text-heritage-navy/40 dark:text-white/40 text-xs uppercase tracking-wider font-bold">
                                                    ID: {template.id}
                                                </CardDescription>
                                            </div>
                                            <LucideEdit className="w-4 h-4 text-heritage-navy/40" />
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>

                        {/* Editor */}
                        <Card className="border-none shadow-lg glass-card h-fit">
                            <CardHeader className="border-b border-heritage-navy/5 dark:border-white/5">
                                <CardTitle className="flex items-center gap-2">
                                    <LucideMail className="w-5 h-5 text-heritage-terracotta" />
                                    Editor de Template
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {editingTemplate ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-heritage-navy/40 dark:text-white/40">Assunto</label>
                                            <Input
                                                value={editingTemplate.subject}
                                                onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                                className="font-bold text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-heritage-navy/40 dark:text-white/40">Corpo do Email (Markdown)</label>
                                            <Textarea
                                                value={editingTemplate.body_markdown}
                                                onChange={e => setEditingTemplate({ ...editingTemplate, body_markdown: e.target.value })}
                                                className="min-h-[300px] font-mono text-sm leading-relaxed"
                                            />
                                        </div>
                                        <Button onClick={handleSaveTemplate} className="w-full bg-heritage-navy hover:bg-heritage-navy/90 text-white font-bold h-12 rounded-xl">
                                            <LucideSave className="w-4 h-4 mr-2" />
                                            Salvar Alterações
                                        </Button>
                                    </>
                                ) : (
                                    <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 opacity-40">
                                        <LucideEdit className="w-12 h-12 mb-4" />
                                        <p className="font-bold">Selecione um template ao lado para editar</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="assemblies" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-heritage-navy dark:text-white">Assembleias Gerais</h2>
                            <p className="text-heritage-navy/40 dark:text-white/30">Gerir reuniões e pautas de votação.</p>
                        </div>
                        <Button
                            onClick={() => setIsCreatingAssembly(true)}
                            className="bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-white font-bold rounded-xl"
                        >
                            <LucidePlus className="w-4 h-4 mr-2" />
                            Nova Assembleia
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {assemblies.map(assembly => (
                            <Card key={assembly.id} className="glass-card border-none shadow-sm overflow-hidden group">
                                <CardHeader className="p-6 flex flex-row items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-heritage-navy/5 dark:bg-white/10 flex flex-col items-center justify-center text-heritage-navy dark:text-white">
                                            <span className="text-[10px] uppercase font-bold text-heritage-navy/40 dark:text-white/40">
                                                {new Date(assembly.date).toLocaleDateString('pt-PT', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-black leading-none">
                                                {new Date(assembly.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-bold text-heritage-navy dark:text-white">{assembly.title}</CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-heritage-navy/60 dark:text-white/50">
                                                <span className="flex items-center gap-1.5">
                                                    <LucideCalendar className="w-3.5 h-3.5" />
                                                    {new Date(assembly.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <LucideGavel className="w-3.5 h-3.5" />
                                                    {assembly.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        assembly.status === 'open_for_voting' ? 'destructive' :
                                            assembly.status === 'completed' ? 'secondary' : 'default'
                                    } className="uppercase text-[10px] tracking-wider">
                                        {assembly.status === 'open_for_voting' ? 'Votação Aberta' :
                                            assembly.status === 'completed' ? 'Concluída' : 'Agendada'}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl border-heritage-navy/10 hover:bg-heritage-sand/50"
                                        onClick={() => handleOpenAgenda(assembly)}
                                    >
                                        <LucideEdit className="w-4 h-4 mr-2" />
                                        Editar Pauta
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1 rounded-xl bg-heritage-sand dark:bg-zinc-800"
                                        onClick={() => handleOpenSessionControl(assembly)}
                                    >
                                        <LucideVote className="w-4 h-4 mr-2" />
                                        Gerir Sessão
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {assemblies.length === 0 && (
                            <div className="p-12 text-center border-2 border-dashed border-heritage-navy/10 dark:border-white/10 rounded-[32px]">
                                <LucideCalendar className="w-12 h-12 mx-auto text-heritage-navy/20 dark:text-white/20 mb-4" />
                                <h3 className="font-bold text-heritage-navy dark:text-white text-lg">Nenhuma assembleia agendada</h3>
                                <p className="text-heritage-navy/40 dark:text-white/30 mb-6">Crie uma nova assembleia para começar.</p>
                                <Button
                                    onClick={() => setIsCreatingAssembly(true)}
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    Agendar Agora
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Create Assembly Modal Overlay */}
                    <AnimatePresence>
                        {isCreatingAssembly && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsCreatingAssembly(false)}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl p-8 overflow-hidden"
                                >
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-heritage-navy dark:text-white">Nova Assembleia</h3>
                                            <p className="text-heritage-navy/50 dark:text-white/40">Preencha os dados da convocatória.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-heritage-navy/40">Título</label>
                                                <Input
                                                    value={newAssembly.title}
                                                    onChange={e => setNewAssembly({ ...newAssembly, title: e.target.value })}
                                                    placeholder="Ex: Assembleia Geral Ordinária"
                                                    className="h-12 rounded-xl bg-heritage-sand/30 dark:bg-zinc-800 border-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-heritage-navy/40">Data e Hora</label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={newAssembly.date}
                                                        onChange={e => setNewAssembly({ ...newAssembly, date: e.target.value })}
                                                        className="h-12 rounded-xl bg-heritage-sand/30 dark:bg-zinc-800 border-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-heritage-navy/40">Local</label>
                                                    <Input
                                                        value={newAssembly.location}
                                                        onChange={e => setNewAssembly({ ...newAssembly, location: e.target.value })}
                                                        placeholder="Sede / Zoom"
                                                        className="h-12 rounded-xl bg-heritage-sand/30 dark:bg-zinc-800 border-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-heritage-navy/40">Descrição</label>
                                                <Textarea
                                                    value={newAssembly.description}
                                                    onChange={e => setNewAssembly({ ...newAssembly, description: e.target.value })}
                                                    placeholder="Pauta resumida ou observações..."
                                                    className="min-h-[100px] rounded-xl bg-heritage-sand/30 dark:bg-zinc-800 border-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsCreatingAssembly(false)}
                                                className="flex-1 rounded-xl h-12"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleCreateAssembly}
                                                className="flex-1 bg-heritage-navy hover:bg-heritage-navy/90 text-white rounded-xl h-12 font-bold"
                                            >
                                                Criar Assembleia
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </TabsContent>

                <TabsContent value="config" className="space-y-6">
                    <Card className="rounded-[32px] border-none shadow-sm glass-card p-8">
                        <CardHeader className="p-0 pb-6">
                            <CardTitle className="text-xl font-black text-heritage-navy dark:text-white">
                                Configurações do Sistema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="p-6 rounded-2xl bg-heritage-success/10 dark:bg-zinc-900/50 space-y-3">
                                <h4 className="font-bold text-heritage-navy dark:text-white flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-heritage-success"></div>
                                    Modo de Produção
                                </h4>
                                <p className="text-sm text-heritage-navy/40 dark:text-white/30">
                                    O sistema está conectado ao Supabase Real.
                                    Todas as candidaturas e uploads são persistidos na nuvem.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-heritage-sand/20 dark:bg-zinc-900/50 space-y-3">
                                <h4 className="font-bold text-heritage-navy dark:text-white">Ambiente</h4>
                                <p className="text-sm text-heritage-navy/40 dark:text-white/30">
                                    Versão do App: <code className="bg-heritage-navy/10 dark:bg-white/10 px-2 py-1 rounded text-xs">v0.5-beta</code>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {/* Agenda Editor Overlay */}
            <AnimatePresence>
                {isAgendaEditorOpen && editingAssembly && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAgendaEditorOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl p-8 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-heritage-navy dark:text-white">Gerir Pauta</h3>
                                    <p className="text-heritage-navy/50 dark:text-white/40">{editingAssembly.title}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsAgendaEditorOpen(false)} className="rounded-full">
                                    <LucideX className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                                {/* Add New Item Form */}
                                <div className="p-4 bg-heritage-sand/20 dark:bg-zinc-800/50 rounded-2xl space-y-4">
                                    <h4 className="font-bold text-sm uppercase text-heritage-navy/60 dark:text-white/50">Adicionar Novo Item</h4>
                                    <div className="grid md:grid-cols-[2fr_1fr] gap-4">
                                        <Input
                                            placeholder="Título do Item / Assunto"
                                            value={newItem.title}
                                            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                            className="bg-white dark:bg-zinc-900 border-none rounded-xl"
                                        />
                                        <select
                                            className="bg-white dark:bg-zinc-900 border-none rounded-xl px-3 text-sm font-medium h-10"
                                            value={newItem.type}
                                            onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
                                        >
                                            <option value="discussion">Discussão</option>
                                            <option value="voting_simple">Votação Simples</option>
                                            <option value="election">Eleição</option>
                                        </select>
                                    </div>
                                    <Textarea
                                        placeholder="Descrição detalhada (opcional)"
                                        value={newItem.description}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                        className="bg-white dark:bg-zinc-900 border-none rounded-xl min-h-[80px]"
                                    />
                                    <Button onClick={handleAddItem} className="w-full bg-heritage-navy text-white font-bold rounded-xl">
                                        <LucidePlus className="w-4 h-4 mr-2" />
                                        Adicionar à Pauta
                                    </Button>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-sm uppercase text-heritage-navy/60 dark:text-white/50">Itens da Pauta ({assemblyItems.length})</h4>
                                    {assemblyItems.length === 0 ? (
                                        <div className="text-center p-8 text-heritage-navy/30 dark:text-white/30 italic">
                                            Nenhum item na pauta ainda.
                                        </div>
                                    ) : (
                                        assemblyItems.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-heritage-sand/10 dark:bg-zinc-800/30 rounded-2xl flex items-start gap-4 group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-heritage-navy/10 dark:bg-white/10 flex items-center justify-center font-black text-heritage-navy dark:text-white text-sm shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h5 className="font-bold text-heritage-navy dark:text-white truncate">{item.title}</h5>
                                                        <Badge variant="outline" className="text-[10px] uppercase h-5">
                                                            {item.type === 'voting_simple' ? 'Votação' : item.type === 'election' ? 'Eleição' : 'Discussão'}
                                                        </Badge>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-sm text-heritage-navy/60 dark:text-white/50 line-clamp-2">{item.description}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10 rounded-xl"
                                                >
                                                    <LucideTrash2 className="w-4 h-4" />
                                                </Button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Session Control Overlay */}
            <AnimatePresence>
                {isSessionControlOpen && editingAssembly && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSessionControlOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl p-8 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="flex-none mb-6 flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-heritage-navy dark:text-white flex items-center gap-2">
                                        <LucideGavel className="w-6 h-6" /> Controle de Sessão
                                    </h3>
                                    <p className="text-heritage-navy/50 dark:text-white/40">{editingAssembly.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant={editingAssembly.status === 'open_for_voting' ? 'destructive' : 'outline'}>
                                        {editingAssembly.status === 'open_for_voting' ? 'AO VIVO' : editingAssembly.status}
                                    </Badge>
                                    <Button variant="ghost" size="icon" onClick={() => setIsSessionControlOpen(false)} className="rounded-full">
                                        <LucideX className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
                                {/* Controls */}
                                <div className="space-y-4 md:border-r border-heritage-navy/10 dark:border-white/10 pr-6 overflow-y-auto">
                                    <h4 className="font-bold text-sm uppercase text-heritage-navy/40">Status da Assembleia</h4>
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => handleUpdateStatus('scheduled')}
                                            variant={editingAssembly.status === 'scheduled' ? 'default' : 'outline'}
                                            className="w-full justify-start rounded-xl"
                                        >
                                            <LucideCalendar className="w-4 h-4 mr-2" /> Agendada
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus('open_for_voting')}
                                            variant={editingAssembly.status === 'open_for_voting' ? 'destructive' : 'outline'}
                                            className="w-full justify-start rounded-xl"
                                        >
                                            <LucideVote className="w-4 h-4 mr-2" /> Aberta para Votação
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus('closed')}
                                            variant={editingAssembly.status === 'closed' ? 'secondary' : 'outline'}
                                            className="w-full justify-start rounded-xl"
                                        >
                                            <LucideGavel className="w-4 h-4 mr-2" /> Votação Encerrada
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus('completed')}
                                            variant={editingAssembly.status === 'completed' ? 'secondary' : 'outline'}
                                            className="w-full justify-start rounded-xl"
                                        >
                                            <LucideCheckCircle2 className="w-4 h-4 mr-2" /> Concluída
                                        </Button>
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="md:col-span-2 overflow-y-auto space-y-4 pl-2 h-full">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-sm uppercase text-heritage-navy/40">Resultados em Tempo Real</h4>
                                        <Button size="sm" variant="ghost" onClick={() => handleOpenSessionControl(editingAssembly)}>
                                            <LucideRefreshCw className="w-3 h-3 mr-1" /> Atualizar
                                        </Button>
                                    </div>

                                    {assemblyItems.map((item, i) => (
                                        <div key={item.id} className="p-4 rounded-xl border border-heritage-navy/5 bg-heritage-sand/10">
                                            <div className="flex justify-between mb-3">
                                                <span className="font-bold text-heritage-navy dark:text-white max-w-[70%]">{i + 1}. {item.title}</span>
                                                <Badge variant="outline">{item.type}</Badge>
                                            </div>

                                            {(item.type === 'voting_simple' || item.type === 'election') && liveStats[item.id] ? (
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <div className="p-2 rounded bg-heritage-success/10 text-heritage-success">
                                                        <div className="text-xl font-black">{liveStats[item.id].approve}</div>
                                                        <div className="text-[10px] uppercase font-bold">A Favor</div>
                                                    </div>
                                                    <div className="p-2 rounded bg-red-500/10 text-red-500">
                                                        <div className="text-xl font-black">{liveStats[item.id].reject}</div>
                                                        <div className="text-[10px] uppercase font-bold">Contra</div>
                                                    </div>
                                                    <div className="p-2 rounded bg-gray-500/10 text-gray-500">
                                                        <div className="text-xl font-black">{liveStats[item.id].abstain}</div>
                                                        <div className="text-[10px] uppercase font-bold">Abst.</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-heritage-navy/40 italic">Item apenas para discussão.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

