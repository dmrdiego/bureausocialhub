import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { emailService } from "@/lib/emailService"


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
    LucideAlertTriangle,
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
    LucideCheckCircle2,
    LucideClock,
    LucideMapPin,
    LucideLoader2,
    LucideCpu,
    LucideActivity,
    LucideTerminal
} from "lucide-react"





import { motion, AnimatePresence } from "framer-motion"

import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import AdminLogs from "@/components/admin/AdminLogs"
import { logSystemError } from "@/lib/errorLogger"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Type definition for Candidatura Data coming from DB
interface CandidaturaDB {
    id: string
    user_id: string
    status: string
    created_at: string
    type?: string
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
    member_category?: string
    member_number?: string
    is_direction?: boolean
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
    minutes_status?: 'draft' | 'published'
    minutes_content?: string
}

interface AssemblyItem {
    id: string
    assembly_id: string
    title: string
    description: string
    type: 'discussion' | 'voting_simple' | 'election'
    order_index: number
}

interface AttendanceRecord {
    id: string
    user_id: string
    assembly_id: string
    checked_in_at: string
    can_vote: boolean
    profiles?: any // Can be object or array depending on Supabase response
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
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const currentTab = searchParams.get('tab') || 'candidaturas'

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

    // Member Management State
    const [editingMember, setEditingMember] = useState<UserProfile | null>(null)
    const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
    const [memberSearchTerm, setMemberSearchTerm] = useState("")
    const [memberFilterCategory, setMemberFilterCategory] = useState("all")
    const [memberFormData, setMemberFormData] = useState({
        member_category: 'contribuinte',
        member_number: '',
        is_direction: false,
        role: 'pending'
    })

    // Events Management State
    const [events, setEvents] = useState<any[]>([])
    const [isCreatingEvent, setIsCreatingEvent] = useState(false)
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'social',
        image_url: ''
    })

    // Projects (Voting) Management State
    const [projects, setProjects] = useState<any[]>([])
    const [isCreatingProject, setIsCreatingProject] = useState(false)
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        goal: 100
    })


    // Assembly Attendance State
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)

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

            // Fetch Events
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: false })
            if (eventsError) throw eventsError
            setEvents(eventsData || [])

            // Fetch Projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })
            if (projectsError) throw projectsError
            setProjects(projectsData || [])

        } catch (err: any) {

            console.error(err)
            toast.error("Erro ao carregar dados", { description: err.message })
            logSystemError(err, 'Admin.fetchAllData', profile?.id)
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

        // Member specific stats
        founders: members.filter(m => m.member_category === 'fundador').length,
        effective: members.filter(m => m.member_category === 'efetivo').length,
        contributors: members.filter(m => m.member_category === 'contribuinte').length,
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
        if (!selectedAssemblyId || !newItem.title) {
            console.warn("Cannot add item: missing assembly ID or title", { selectedAssemblyId, title: newItem.title });
            return
        }

        console.log("Adding item to assembly:", selectedAssemblyId, newItem);

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

            if (error) {
                console.error("Supabase error adding item:", error);
                throw error
            }

            console.log("Item added successfully:", data);
            setAssemblyItems([...assemblyItems, data])
            setNewItem({ title: '', description: '', type: 'discussion' })
            toast.success("Item adicionado à pauta")
        } catch (err: any) {
            console.error("Catch error adding item:", err);
            toast.error("Erro ao adicionar item", { description: err.message })
            logSystemError(err, 'Admin.handleAddItem', profile?.id)
        }
    }


    const handleOpenEditMember = (member: UserProfile) => {
        setEditingMember(member)
        setMemberFormData({
            member_category: member.member_category || 'contribuinte',
            member_number: member.member_number || '',
            is_direction: member.is_direction || false,
            role: member.role || 'pending'
        })
        setIsMemberDialogOpen(true)
    }

    const handleSaveMember = async () => {
        if (!editingMember) return

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: memberFormData.role,
                    member_category: memberFormData.member_category,
                    member_number: memberFormData.member_number,
                    is_direction: memberFormData.is_direction
                })
                .eq('id', editingMember.id)

            if (error) throw error

            toast.success("Dados do associado atualizados!")

            // Update local state
            setMembers(prev => prev.map(m => m.id === editingMember.id ? {
                ...m,
                role: memberFormData.role,
                member_category: memberFormData.member_category,
                member_number: memberFormData.member_number,
                is_direction: memberFormData.is_direction
            } : m))

            setIsMemberDialogOpen(false)
            setEditingMember(null)
        } catch (err: any) {
            toast.error("Erro ao atualizar associado", { description: err.message })
            logSystemError(err, 'Admin.handleSaveMember', profile?.id)
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
            logSystemError(err, 'Admin.handleDeleteItem', profile?.id)
        }


    }



    const handleOpenSessionControl = async (assembly: Assembly) => {
        setEditingAssembly(assembly)
        setSelectedAssemblyId(assembly.id)

        // Fetch Attendance
        fetchAssemblyAttendance(assembly.id)

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
        } catch (err: any) {
            toast.error("Erro ao atualizar status")
            logSystemError(err, 'Admin.handleUpdateStatus', profile?.id)
        }
    }

    const handleGenerateMinutes = async () => {
        if (!selectedAssemblyId || !editingAssembly) return

        const loadingToast = toast.loading("Gerando ata automática...")
        try {
            // Generate content
            let content = `# Ata da Assembleia: ${editingAssembly.title}\n`
            content += `Data: ${new Date(editingAssembly.date).toLocaleDateString('pt-PT')}\n`
            content += `Local: ${editingAssembly.location}\n\n`

            content += `## Presenças\n`
            content += `Total de membros presentes: ${attendanceRecords.length}\n`
            attendanceRecords.forEach(rec => {
                content += `- ${rec.profiles?.full_name} (${rec.profiles?.member_category})\n`
            })

            content += `\n## Deliberações e Votações\n`
            assemblyItems.forEach((item, i) => {
                content += `### ${i + 1}. ${item.title}\n`
                if (item.description) content += `${item.description}\n\n`

                if (liveStats[item.id]) {
                    const stats = liveStats[item.id]
                    content += `- A Favor: ${stats.approve}\n`
                    content += `- Contra: ${stats.reject}\n`
                    content += `- Abstenções: ${stats.abstain}\n`

                    const total = stats.approve + stats.reject + stats.abstain
                    if (total > 0) {
                        const result = stats.approve > stats.reject ? 'APROVADO' : 'REJEITADO'
                        content += `**Resultado: ${result}**\n`
                    }
                } else {
                    content += `*Item de discussão sem votação.*\n`
                }
                content += `\n`
            })

            content += `\n---\nAta gerada automaticamente pelo Sistema Bureau Social em ${new Date().toLocaleString('pt-PT')}.`

            const { error } = await supabase
                .from('assemblies')
                .update({
                    minutes_content: content,
                    minutes_status: 'draft'
                })
                .eq('id', selectedAssemblyId)

            if (error) throw error

            toast.success("Ata gerada com sucesso! Você pode editá-la no banco de dados ou em futuras versões do painel.", { id: loadingToast })
            setEditingAssembly({ ...editingAssembly, minutes_content: content, minutes_status: 'draft' })
        } catch (err: any) {
            toast.error("Erro ao gerar ata", { id: loadingToast })
            logSystemError(err, 'Admin.handleGenerateMinutes', profile?.id)
        }
    }

    // Fetch attendance for a specific assembly
    const fetchAssemblyAttendance = async (assemblyId: string) => {
        setIsLoadingAttendance(true)
        try {
            const { data, error } = await supabase
                .from('assembly_attendances')
                .select(`
                    id,
                    user_id,
                    assembly_id,
                    checked_in_at,
                    can_vote,
                    profiles!user_id (
                        full_name,
                        email,
                        member_category
                    )
                `)

                .eq('assembly_id', assemblyId)
                .order('checked_in_at', { ascending: true })

            if (error) throw error
            setAttendanceRecords(data || [])
        } catch (err: any) {
            toast.error("Erro ao carregar presenças", { description: err.message })
            logSystemError(err, 'Admin.fetchAssemblyAttendance', profile?.id)
        } finally {
            setIsLoadingAttendance(false)
        }
    }

    // Toggle voting rights for an attendee
    const handleToggleVotingRights = async (attendanceId: string, currentCanVote: boolean) => {
        try {
            const { error } = await supabase
                .from('assembly_attendances')
                .update({ can_vote: !currentCanVote })
                .eq('id', attendanceId)

            if (error) throw error

            // Update local state
            setAttendanceRecords(prev =>
                prev.map(rec =>
                    rec.id === attendanceId
                        ? { ...rec, can_vote: !currentCanVote }
                        : rec
                )
            )

            toast.success(`Direito a voto ${!currentCanVote ? 'concedido' : 'revogado'}`)
        } catch (err: any) {
            toast.error("Erro ao atualizar direito de voto")
            logSystemError(err, 'Admin.handleToggleVotingRights', profile?.id)
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
            logSystemError(err, 'Admin.handleCreateAssembly', profile?.id)
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
            logSystemError(err, 'Admin.handleStatusChange', profile?.id)
        }
    }

    const [isResetting, setIsResetting] = useState(false)

    const handleResetSystem = async () => {
        if (!confirm("⚠️ ATENÇÃO: Esta ação irá apagar TODAS as candidaturas, votos, presenças, logs e perfis de membros (mantendo apenas administradores). Deseja continuar?")) {
            return
        }

        const password = prompt("Para confirmar a limpeza total da base de dados, digite 'RESETAR':")
        if (password !== 'RESETAR') {
            toast.error("Confirmação inválida. Operação cancelada.")
            return
        }

        setIsResetting(true)
        const toastId = toast.loading("Limpando base de dados...")

        try {
            // 1. Clear dynamic transactional data
            await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            await supabase.from('assembly_attendances').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            await supabase.from('candidaturas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            await supabase.from('contact_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')

            // 2. Clear non-admin profiles
            // Note: This might require RLS configuration or RPC for full cleanup
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .neq('role', 'admin')

            if (profileError) throw profileError

            toast.success("Sistema resetado com sucesso!", { id: toastId })
            window.location.reload()
        } catch (error: any) {
            console.error(error)
            toast.error("Erro ao resetar sistema: " + error.message, { id: toastId })
        } finally {
            setIsResetting(false)
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
            logSystemError(err, 'Admin.handleSaveTemplate', profile?.id)
        }
    }

    const handleSendTestEmail = async () => {
        if (!editingTemplate || !profile?.email) return

        const loadingToast = toast.loading("Enviando email de teste...")
        try {
            const res = await emailService.sendEmail({
                to: profile.email,
                subject: `[TESTE] ${editingTemplate.subject}`,
                body: editingTemplate.body_markdown,
                templateId: editingTemplate.id
            })

            toast.dismiss(loadingToast)
            if (res.success) {
                toast.success("Email de teste enviado!", { description: `Enviado para ${profile.email}` })
            }
        } catch (err: any) {
            toast.dismiss(loadingToast)
            toast.error("Erro ao enviar teste", { description: err.message })
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
                `"${m.role}"`,
                `"${m.quota_status}"`,
                m.created_at
            ].map(field => (typeof field === 'string' && field.includes(',')) ? `"${field}"` : field).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.body.appendChild(document.createElement("a"))
        const url = URL.createObjectURL(blob)
        link.href = url
        link.download = `associados_bureau_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        document.body.removeChild(link)
    }

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.date) {
            toast.error("Título e data são obrigatórios")
            return
        }
        try {
            const { data, error } = await supabase
                .from('events')
                .insert([newEvent])
                .select()
                .single()
            if (error) throw error
            setEvents([data, ...events])
            setIsCreatingEvent(false)
            setNewEvent({ title: '', description: '', date: '', location: '', category: 'social', image_url: '' })
            toast.success("Evento criado com sucesso!")
        } catch (err: any) {
            toast.error("Erro ao criar evento")
            logSystemError(err, 'Admin.handleCreateEvent', profile?.id)
        }
    }

    const handleCreateProject = async () => {
        if (!newProject.title) {
            toast.error("Título é obrigatório")
            return
        }
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([newProject])
                .select()
                .single()
            if (error) throw error
            setProjects([data, ...projects])
            setIsCreatingProject(false)
            setNewProject({ title: '', description: '', goal: 100 })
            toast.success("Votação criada com sucesso!")
        } catch (err: any) {
            toast.error("Erro ao criar votação")
            logSystemError(err, 'Admin.handleCreateProject', profile?.id)
        }
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
            <Tabs defaultValue={currentTab} value={currentTab} onValueChange={(val) => navigate(`/admin?tab=${val}`)} className="space-y-8">

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
                    <TabsTrigger value="events" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideCalendar className="w-4 h-4 mr-2" />
                        Eventos
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideVote className="w-4 h-4 mr-2" />
                        Votações
                    </TabsTrigger>
                    <TabsTrigger value="config" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideSettings className="w-4 h-4 mr-2" />
                        Configurações
                    </TabsTrigger>

                    <TabsTrigger value="logs" className="rounded-2xl px-6 py-3 font-bold text-sm data-[state=active]:bg-heritage-navy data-[state=active]:text-white dark:data-[state=active]:bg-heritage-gold dark:data-[state=active]:text-heritage-navy">
                        <LucideShield className="w-4 h-4 mr-2" />
                        Logs Sistema
                    </TabsTrigger>
                </TabsList>


                <TabsContent value="logs">
                    <AdminLogs />
                </TabsContent>


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
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-xs text-heritage-navy/20 dark:text-white/20">{email}</p>
                                                                    {candidatura.type && (
                                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold border-heritage-navy/20 text-heritage-navy/60 h-5 px-1.5 ml-2">
                                                                            {candidatura.type}
                                                                        </Badge>
                                                                    )}
                                                                </div>
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
                                                                    onClick={() => navigate(`/candidatura/${candidatura.id}`)}
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

                <TabsContent value="members" className="space-y-6">
                    {/* Member Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Fundadores', value: stats.founders, color: 'text-heritage-gold bg-heritage-gold/10' },
                            { label: 'Efetivos', value: stats.effective, color: 'text-heritage-ocean bg-heritage-ocean/10' },
                            { label: 'Contribuintes', value: stats.contributors, color: 'text-heritage-success bg-heritage-success/10' },
                            { label: 'Total', value: stats.members, color: 'text-heritage-navy bg-heritage-navy/10 dark:text-white dark:bg-white/10' },
                        ].map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm glass-card">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                                        <LucideUsers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">{stat.value}</p>
                                        <p className="text-xs uppercase font-bold opacity-50">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="rounded-[32px] border-none shadow-sm glass-card overflow-hidden">
                        <CardHeader className="border-b border-heritage-navy/5 dark:border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                            <CardTitle className="text-xl font-black text-heritage-navy dark:text-white">
                                Base de Associados
                            </CardTitle>
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-navy/40" />
                                    <Input
                                        placeholder="Buscar por nome, nif, nº sócio..."
                                        className="pl-10 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none"
                                        value={memberSearchTerm}
                                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={memberFilterCategory} onValueChange={setMemberFilterCategory}>
                                    <SelectTrigger className="w-full md:w-[180px] rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none">
                                        <SelectValue placeholder="Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas as Categorias</SelectItem>
                                        <SelectItem value="fundador">Fundador</SelectItem>
                                        <SelectItem value="efetivo">Efetivo</SelectItem>
                                        <SelectItem value="contribuinte">Contribuinte</SelectItem>
                                        <SelectItem value="honorario">Honorário</SelectItem>
                                        <SelectItem value="institucional">Institucional</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleExportCSV} variant="outline" className="rounded-xl border-heritage-navy/10 hover:bg-heritage-sand/50">
                                    Exportar CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-heritage-navy/5 dark:divide-white/5">
                                {members
                                    .filter(m => {
                                        const matchesSearch = m.full_name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                                            m.email?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                                            m.nif?.includes(memberSearchTerm) ||
                                            m.member_number?.includes(memberSearchTerm)
                                        const matchesCategory = memberFilterCategory === 'all' || m.member_category === memberFilterCategory
                                        return matchesSearch && matchesCategory
                                    })
                                    .map((member) => (
                                        <div key={member.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-heritage-sand/10 dark:hover:bg-zinc-900/30 transition-colors gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-heritage-navy/10 dark:bg-white/10 flex items-center justify-center font-bold text-heritage-navy dark:text-white text-lg relative">
                                                    {member.full_name?.charAt(0) || '?'}
                                                    {member.is_direction && (
                                                        <div className="absolute -bottom-1 -right-1 bg-heritage-gold text-white p-1 rounded-full border-2 border-white dark:border-zinc-900" title="Membro da Direção">
                                                            <LucideGavel className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-heritage-navy dark:text-white text-lg">{member.full_name}</h4>
                                                        {member.member_number && (
                                                            <Badge variant="outline" className="text-[10px] h-5 border-heritage-navy/20 text-heritage-navy/60">
                                                                #{member.member_number}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-heritage-navy/40 dark:text-white/40">{member.email}</p>
                                                    <div className="flex gap-2 mt-1 md:hidden">
                                                        <Badge className="bg-heritage-navy/5 text-heritage-navy dark:bg-white/10 dark:text-white">
                                                            {member.member_category || 'Sem Categoria'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                                <div className="hidden md:block text-right mr-4">
                                                    <Badge variant="outline" className="mb-1 border-none bg-heritage-navy/5 text-heritage-navy dark:bg-white/10 dark:text-white uppercase text-[10px] font-bold tracking-wider">
                                                        {member.member_category || '----'}
                                                    </Badge>
                                                    <p className="text-xs text-heritage-navy/40 dark:text-white/40">{member.phone || 'Sem telefone'}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-xl hover:bg-heritage-ocean/10 text-heritage-ocean"
                                                        onClick={() => handleOpenEditMember(member)}
                                                    >
                                                        <LucideEdit className="w-4 h-4" />
                                                    </Button>
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

                    <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Editar Associado</DialogTitle>
                                <DialogDescription>
                                    Alterar categoria, número de sócio e permissões.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select
                                        value={memberFormData.member_category}
                                        onValueChange={(val) => setMemberFormData({ ...memberFormData, member_category: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contribuinte">Contribuinte</SelectItem>
                                            <SelectItem value="efetivo">Efetivo</SelectItem>
                                            <SelectItem value="fundador">Fundador</SelectItem>
                                            <SelectItem value="honorario">Honorário</SelectItem>
                                            <SelectItem value="institucional">Institucional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="number">Número de Sócio</Label>
                                    <Input
                                        id="number"
                                        value={memberFormData.member_number}
                                        onChange={(e) => setMemberFormData({ ...memberFormData, member_number: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center justify-between space-x-2 pt-2">
                                    <Label htmlFor="direction">Membro da Direção?</Label>
                                    <Switch
                                        id="direction"
                                        checked={memberFormData.is_direction}
                                        onCheckedChange={(checked) => setMemberFormData({ ...memberFormData, is_direction: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="admin">Acesso Admin?</Label>
                                    <Switch
                                        id="admin"
                                        checked={memberFormData.role === 'admin'}
                                        onCheckedChange={(checked) => setMemberFormData({ ...memberFormData, role: checked ? 'admin' : 'member' })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleSaveMember}>Salvar Alterações</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent value="emails" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* List of Templates */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="space-y-4"
                        >
                            {emailTemplates.map(template => (
                                <motion.div key={template.id} variants={itemVariants}>
                                    <Card
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
                                </motion.div>
                            ))}
                        </motion.div>

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
                                        <div className="flex gap-3">
                                            <Button onClick={handleSaveTemplate} className="flex-1 bg-heritage-navy hover:bg-heritage-navy/90 text-white font-bold h-12 rounded-xl">
                                                <LucideSave className="w-4 h-4 mr-2" />
                                                Salvar Alterações
                                            </Button>
                                            <Button onClick={handleSendTestEmail} variant="outline" className="px-6 border-heritage-navy/10 hover:bg-heritage-sand/50 h-12 rounded-xl font-bold">
                                                <LucideMail className="w-4 h-4 mr-2" />
                                                Enviar Teste
                                            </Button>
                                        </div>

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

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4"
                    >
                        {assemblies.map((assembly) => (
                            <motion.div key={assembly.id} variants={itemVariants}>
                                <Card className="rounded-[32px] border-none shadow-sm glass-card group hover:shadow-xl transition-all duration-500 overflow-hidden">
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
                            </motion.div>
                        ))}
                    </motion.div>

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

                <TabsContent value="events" className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-heritage-navy dark:text-white">Gestão de Eventos</h3>
                        <Button onClick={() => setIsCreatingEvent(true)} className="bg-heritage-navy text-white rounded-xl font-bold">
                            <LucidePlus className="w-4 h-4 mr-2" /> Novo Evento
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {events.length === 0 ? (
                            <div className="text-center py-20 glass-card rounded-3xl">
                                <LucideCalendar className="w-12 h-12 mx-auto mb-4 text-heritage-navy/20" />
                                <p className="text-heritage-navy/40">Nenhum evento criado</p>
                            </div>
                        ) : (
                            events.map(event => (
                                <Card key={event.id} className="glass-card rounded-[24px] border-none p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                                            <img src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-heritage-navy dark:text-white">{event.title}</h4>
                                            <p className="text-xs text-heritage-navy/40 dark:text-white/40 flex items-center gap-2 mt-1">
                                                <LucideCalendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('pt-PT')}
                                                <LucideMapPin className="w-3 h-3 ml-2" /> {event.location}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="uppercase text-[9px] tracking-widest">{event.category}</Badge>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-heritage-navy dark:text-white">Gestão de Votações</h3>
                        <Button onClick={() => setIsCreatingProject(true)} className="bg-heritage-navy text-white rounded-xl font-bold">
                            <LucidePlus className="w-4 h-4 mr-2" /> Nova Votação
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {projects.length === 0 ? (
                            <div className="text-center py-20 glass-card rounded-3xl">
                                <LucideVote className="w-12 h-12 mx-auto mb-4 text-heritage-navy/20" />
                                <p className="text-heritage-navy/40">Nenhuma votação configurada</p>
                            </div>
                        ) : (
                            projects.map(project => (
                                <Card key={project.id} className="glass-card rounded-[24px] border-none p-6 flex justify-between items-center">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-heritage-navy/5 flex items-center justify-center text-heritage-navy">
                                            <LucideVote className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-heritage-navy dark:text-white">{project.title}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs font-bold text-heritage-navy/40">{project.votes} votos</span>
                                                <div className="h-1.5 w-24 bg-heritage-navy/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-heritage-gold" style={{ width: `${Math.min((project.votes / project.goal) * 100, 100)}%` }} />
                                                </div>
                                                <span className="text-[10px] text-heritage-navy/40">Meta: {project.goal}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <LucideEdit className="w-4 h-4" />
                                    </Button>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* System Status */}
                        <Card className="rounded-[32px] border-none shadow-sm glass-card overflow-hidden">
                            <CardHeader className="bg-heritage-navy dark:bg-zinc-800 text-white p-6">
                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                    <LucideCpu className="w-6 h-6 text-heritage-gold" />
                                    Núcleo do Sistema
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="p-6 rounded-2xl flex items-start gap-4 bg-heritage-navy/5 dark:bg-white/5 border border-heritage-navy/10 dark:border-white/10">
                                    <div className="w-3 h-3 rounded-full mt-1.5 bg-heritage-success animate-pulse" />
                                    <div>
                                        <h4 className="font-bold text-heritage-navy dark:text-white">
                                            Sistema Online (Produção)
                                        </h4>
                                        <p className="text-sm text-heritage-navy/60 dark:text-white/40 mt-1">
                                            O sistema está conectado ao cluster oficial do Supabase. Todos os dados são reais e persistentes.
                                        </p>
                                    </div>
                                </div>



                                <div className="pt-4 border-t border-heritage-navy/5 dark:border-white/5 space-y-4">
                                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-3 text-red-500">
                                            <LucideAlertTriangle className="w-5 h-5" />
                                            <span className="text-sm font-black uppercase tracking-tighter">Zona de Perigo</span>
                                        </div>
                                        <p className="text-[10px] text-red-500/60 font-medium leading-relaxed">
                                            A limpeza do sistema apaga todos os dados transacionais (candidaturas, votos, presenças) e remove perfis que não são administradores. Use com extrema cautela.
                                        </p>
                                        <Button
                                            variant="destructive"
                                            className="w-full rounded-[14px] bg-red-500 hover:bg-red-600 text-white font-bold h-10 text-xs transition-all"
                                            onClick={handleResetSystem}
                                            disabled={isResetting}
                                        >
                                            {isResetting ? <LucideLoader2 className="w-4 h-4 animate-spin mr-2" /> : <LucideTrash2 className="w-4 h-4 mr-2" />}
                                            Limpar Base de Dados (Exceto Admins)
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* App Info & Stats */}
                        <Card className="rounded-[32px] border-none shadow-sm glass-card overflow-hidden">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-xl font-black text-heritage-navy dark:text-white flex items-center gap-3">
                                    <LucideActivity className="w-6 h-6 text-heritage-terracotta" />
                                    Informações Adicionais
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-heritage-sand/20 dark:bg-white/5 rounded-[24px]">
                                        <div className="text-[10px] font-black text-heritage-navy/30 uppercase tracking-widest mb-1">Versão</div>
                                        <div className="text-lg font-black text-heritage-navy dark:text-white">v0.8.2-alpha</div>
                                    </div>
                                    <div className="p-4 bg-heritage-sand/20 dark:bg-white/5 rounded-[24px]">
                                        <div className="text-[10px] font-black text-heritage-navy/30 uppercase tracking-widest mb-1">Build</div>
                                        <div className="text-lg font-black text-heritage-navy dark:text-white">2026.01.17</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black text-heritage-navy/40 uppercase tracking-widest px-1">
                                            <span>Uso de Armazenamento (Simulado)</span>
                                            <span>24%</span>
                                        </div>
                                        <div className="h-2 bg-heritage-navy/5 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-heritage-terracotta w-[24%]" />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-heritage-navy/5 dark:border-white/5 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-heritage-ocean/10 flex items-center justify-center text-heritage-ocean">
                                                <LucideTerminal className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-heritage-navy dark:text-white">API Endpoint</div>
                                                <div className="text-[10px] text-heritage-navy/40 font-mono">/rest/v1/profiles</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-heritage-gold/10 flex items-center justify-center text-heritage-gold">
                                                <LucideShield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-heritage-navy dark:text-white">Segurança RLS</div>
                                                <div className="text-[10px] text-heritage-success font-bold uppercase">Ativa por Tabela</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

            </Tabs>
            {/* Agenda Editor Overlay */}
            <AnimatePresence>
                {
                    isAgendaEditorOpen && editingAssembly && (
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
                    )
                }
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

                                        <div className="pt-6 border-t border-heritage-navy/10 dark:border-white/10 mt-6 space-y-4">
                                            <h4 className="font-bold text-sm uppercase text-heritage-navy/40">Relatórios</h4>
                                            <Button
                                                onClick={handleGenerateMinutes}
                                                variant="outline"
                                                className="w-full justify-start rounded-xl border-heritage-ocean/30 text-heritage-ocean hover:bg-heritage-ocean/10"
                                            >
                                                <LucideFileText className="w-4 h-4 mr-2" /> Gerar Ata Automática
                                            </Button>

                                            {editingAssembly.minutes_status && (
                                                <div className="p-4 bg-heritage-ocean/5 rounded-xl border border-heritage-ocean/10 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase text-heritage-ocean">Status da Ata</div>
                                                        <div className="text-xs font-bold text-heritage-navy dark:text-white">
                                                            {editingAssembly.minutes_status === 'draft' ? 'Rascunho Gerado' : 'Publicada'}
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-heritage-ocean text-white text-[10px]">VER</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Results & Attendance */}
                                    <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden h-full">

                                        {/* Column 2: Results */}
                                        <div className="overflow-y-auto space-y-4 pl-2 h-full">
                                            <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10 py-2">
                                                <h4 className="font-bold text-sm uppercase text-heritage-navy/40">Resultados</h4>
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

                                        {/* Column 3: Attendance */}
                                        <div className="overflow-y-auto space-y-4 pl-2 h-full border-l border-heritage-navy/10 dark:border-white/10">
                                            <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10 py-2 px-2">
                                                <h4 className="font-bold text-sm uppercase text-heritage-navy/40">Presenças ({attendanceRecords.length})</h4>
                                                {isLoadingAttendance && <LucideLoader2 className="w-4 h-4 animate-spin text-heritage-ocean" />}
                                            </div>

                                            <div className="space-y-2 p-2">
                                                {attendanceRecords.length === 0 ? (
                                                    <div className="text-center py-10 text-heritage-navy/40">
                                                        <LucideUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-xs">Nenhum check-in registado</p>
                                                    </div>
                                                ) : (
                                                    attendanceRecords.map((record) => (
                                                        <div key={record.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-heritage-ocean/5 transition-colors group">
                                                            <div className="min-w-0 flex-1 mr-4">
                                                                <p className="font-bold text-sm text-heritage-navy dark:text-white truncate">
                                                                    {record.profiles?.full_name || 'Usuário Desconhecido'}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider h-5 px-1.5">
                                                                        {record.profiles?.member_category || 'Membro'}
                                                                    </Badge>
                                                                    <span className="text-[10px] text-heritage-navy/40 flex items-center gap-1">
                                                                        <LucideClock className="w-3 h-3" />
                                                                        {new Date(record.checked_in_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <Button
                                                                size="sm"
                                                                variant={record.can_vote ? "default" : "destructive"}
                                                                className={`h-8 w-8 p-0 rounded-lg ${record.can_vote ? 'bg-heritage-success hover:bg-heritage-success/90' : 'bg-red-500 hover:bg-red-600'}`}
                                                                onClick={() => handleToggleVotingRights(record.id, record.can_vote)}
                                                                title={record.can_vote ? "Pode Votar (Clique para revogar)" : "Direito Revogado (Clique para conceder)"}
                                                            >
                                                                {record.can_vote ? <LucideCheckCircle2 className="w-4 h-4" /> : <LucideX className="w-4 h-4" />}
                                                            </Button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >

            {/* Create Event Modal */}
            <Dialog open={isCreatingEvent} onOpenChange={setIsCreatingEvent} >
                <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-heritage-navy">Novo Evento</DialogTitle>
                        <DialogDescription>Crie um evento para a comunidade.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input
                                value={newEvent.title}
                                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder="Ex: Workshop de Azulejaria"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data e Hora</Label>
                                <Input
                                    type="datetime-local"
                                    value={newEvent.date}
                                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select value={newEvent.category} onValueChange={v => setNewEvent({ ...newEvent, category: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="social">Social</SelectItem>
                                        <SelectItem value="cultura">Cultura</SelectItem>
                                        <SelectItem value="formacao">Formação</SelectItem>
                                        <SelectItem value="assembleia">Assembleia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Localização</Label>
                            <Input
                                value={newEvent.location}
                                onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                placeholder="Ex: Sede Alfama"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>URL da Imagem</Label>
                            <Input
                                value={newEvent.image_url}
                                onChange={e => setNewEvent({ ...newEvent, image_url: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                placeholder="Descreva o evento..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreatingEvent(false)}>Cancelar</Button>
                        <Button onClick={handleCreateEvent} className="bg-heritage-navy text-white">Criar Evento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Project Modal */}
            <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject} >
                <DialogContent className="sm:max-w-[425px] rounded-[32px] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-heritage-navy">Nova Votação / Projeto</DialogTitle>
                        <DialogDescription>Adicione um projeto para votação pública.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Título do Projeto</Label>
                            <Input
                                value={newProject.title}
                                onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                placeholder="Ex: Horta Comunitária"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Meta de Votos (Quorum)</Label>
                            <Input
                                type="number"
                                value={newProject.goal}
                                onChange={e => setNewProject({ ...newProject, goal: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={newProject.description}
                                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreatingProject(false)}>Cancelar</Button>
                        <Button onClick={handleCreateProject} className="bg-heritage-navy text-white">Publicar Projeto</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}



