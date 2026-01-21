import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { logSystemError } from "@/lib/errorLogger"
import { LucideArrowLeft, LucideUser, LucideHome, LucideHammer, LucideCheckCircle, LucideXCircle, LucideDownload, LucideLoader2, LucideFileCheck } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { jsPDF } from "jspdf"
import { emailService } from "@/lib/emailService"


export default function CandidaturaDetails() {
    const { id } = useParams<{ id: string }>()
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [candidatura, setCandidatura] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Check permissions & Fetch Data
    useEffect(() => {
        if (!id || !user) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch Candidatura
                const { data: candData, error: candError } = await supabase
                    .from('candidaturas')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (candError) throw candError

                // Check Permissions: Must be Owner or Admin
                const isOwner = candData.user_id === user.id
                const isAdmin = profile?.role === 'admin'

                if (!isOwner && !isAdmin) {
                    toast.error("Acesso Negado", { description: "Você não tem permissão para visualizar esta candidatura." })
                    navigate('/dashboard')
                    return
                }

                setCandidatura(candData)

            } catch (err: any) {
                toast.error("Erro ao carregar detalhes", { description: err.message })
                navigate('/dashboard')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, user, profile, navigate])

    const [isApprovalOpen, setIsApprovalOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [approvalData, setApprovalData] = useState({
        nome: '',
        nif: '',
        email: '',
        oficio: '',
        member_number: '',
        member_category: 'efetivo'
    })

    // Pre-fill approval data when candidature loads
    useEffect(() => {
        if (candidatura && candidatura.form_data) {
            const currentYear = new Date().getFullYear()
            const randomCode = Math.floor(Math.random() * 1000).toString().padStart(4, '0')

            let defaultCategory = 'efetivo'
            if (candidatura.type === 'voluntario') defaultCategory = 'auxiliar' // or similar
            if (candidatura.type === 'profissional') defaultCategory = 'institucional'
            if (candidatura.type === 'associado') defaultCategory = 'contribuinte'

            setApprovalData({
                nome: candidatura.form_data.nome || '',
                nif: candidatura.form_data.nif || '',
                email: candidatura.form_data.email || '',
                oficio: candidatura.form_data.oficio || '',
                member_number: `M-${currentYear}-${randomCode}`,
                member_category: defaultCategory
            })
        }
    }, [candidatura])

    const handleConfirmApproval = async () => {
        if (!candidatura || !profile || profile.role !== 'admin' || !user) return

        setIsProcessing(true)
        const loadingToast = toast.loading("Gerando certificado e enviando email...")

        try {
            // 1. Generate PDF
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            })

            // -- Background & Styling (Visual Mockup of a Certificate)
            doc.setFillColor(250, 248, 245) // heritage-paper
            doc.rect(0, 0, 297, 210, 'F')

            doc.setDrawColor(20, 30, 70) // heritage-navy
            doc.setLineWidth(2)
            doc.rect(10, 10, 277, 190, 'S') // Border

            doc.setFont("times", "bold")
            doc.setFontSize(40)
            doc.setTextColor(20, 30, 70)
            doc.text("Certificado de Admissão", 148.5, 50, { align: "center" })

            doc.setFont("helvetica", "normal")
            doc.setFontSize(14)
            doc.setTextColor(100, 100, 100)
            doc.text("A Direção do Bureau Social Hub certifica que", 148.5, 70, { align: "center" })

            doc.setFont("times", "bold")
            doc.setFontSize(32)
            doc.setTextColor(212, 163, 115) // heritage-gold
            doc.text(approvalData.nome, 148.5, 90, { align: "center" })

            doc.setFont("helvetica", "normal")
            doc.setFontSize(16)
            doc.setTextColor(20, 30, 70)
            doc.text(`Foi admitido como Membro ${approvalData.member_category.charAt(0).toUpperCase() + approvalData.member_category.slice(1)}`, 148.5, 110, { align: "center" })

            doc.text(`Ofício: ${approvalData.oficio}`, 148.5, 125, { align: "center" })
            doc.text(`NIF: ${approvalData.nif}`, 148.5, 135, { align: "center" })

            doc.setFontSize(12)
            doc.text(`Número de Associado: ${approvalData.member_number}`, 148.5, 160, { align: "center" })
            doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-PT')}`, 148.5, 168, { align: "center" })

            // Save PDF (Simulate sending)
            doc.save(`Certificado_${approvalData.nome.replace(/\s+/g, '_')}.pdf`)

            // 2. Update DB
            const { error: candError } = await supabase
                .from('candidaturas')
                .update({ status: 'approved' })
                .eq('id', candidatura.id)
            if (candError) throw candError

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    role: 'member',
                    member_category: approvalData.member_category,
                    member_number: approvalData.member_number,
                    quota_status: 'active',
                    full_name: approvalData.nome // Update name if fixed
                })
                .eq('id', candidatura.user_id)
            if (profileError) throw profileError

            // 3. Send Email & Log Activity
            await emailService.sendEmail({
                to: approvalData.email,
                subject: `Bem-vindo ao Bureau Social, ${approvalData.nome}!`,
                body: `Olá ${approvalData.nome},\n\nÉ com grande prazer que informamos que sua candidatura foi aprovada!\n\nSeu número de associado é: ${approvalData.member_number}\nCategoria: ${approvalData.member_category}\n\nJá pode aceder ao seu portal em: https://bureau-social.vercel.app/dashboard\n\nAtenciosamente,\nA Direção do Bureau Social Hub`,
                templateId: 'candidature_approved'
            });

            await supabase.from('activity_logs').insert({
                user_id: user.id,
                action_type: 'candidatura_approved',
                details: {
                    candidate_id: candidatura.user_id,
                    member_number: approvalData.member_number,
                    sent_to_email: approvalData.email,
                    category: approvalData.member_category
                }
            })


            // 4. Update local state
            setCandidatura({ ...candidatura, status: 'approved' })
            setIsApprovalOpen(false)

            toast.dismiss(loadingToast)
            toast.success("Aprovação Concluída!", {
                description: `Certificado gerado e enviado para ${approvalData.email}.`
            })

        } catch (err: any) {
            console.error(err)
            toast.dismiss(loadingToast)
            toast.error("Erro na aprovação", { description: err.message })
            logSystemError(err, 'CandidaturaDetails.handleConfirmApproval', profile?.id)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!candidatura || !profile || profile.role !== 'admin' || !user) return

        if (!confirm("Tem a certeza que deseja rejeitar esta candidatura?")) return

        try {
            const { error } = await supabase
                .from('candidaturas')
                .update({ status: 'rejected' })
                .eq('id', candidatura.id)

            if (error) throw error

            await supabase.from('activity_logs').insert({
                user_id: user.id,
                action_type: 'candidatura_rejected',
                details: { candidate_id: candidatura.user_id }
            })

            setCandidatura({ ...candidatura, status: 'rejected' })
            toast.success("Candidatura Rejeitada")
        } catch (err: any) {
            console.error(err)
            toast.error("Erro ao rejeitar")
            logSystemError(err, 'CandidaturaDetails.handleReject', profile?.id)
        }
    }

    const handleGenerateCertificate = () => {
        toast.success("Download Iniciado", {
            description: "Certificado de Aprovação (PDF) a ser gerado..."
        })
        const safeName = candidatura?.form_data?.nome || 'Candidato'
        // Mock download logic
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '/docs/Certificado_Admissao_Mock.pdf';
            link.download = `Certificado_${safeName.replace(/\s+/g, '_')}.pdf`;
            // link.click(); 
        }, 1000)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-heritage-terracotta border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!candidatura) return null

    const data = candidatura.form_data || {}
    const isAdmin = profile?.role === 'admin'
    const status = candidatura.status

    return (
        <div className="min-h-screen bg-background transition-apple pt-32 p-6 md:pt-40 md:p-12 pb-32">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            className="pl-0 hover:bg-transparent hover:text-heritage-terracotta transition-colors mb-2"
                            onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                        >
                            <LucideArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-black text-heritage-navy dark:text-white">
                            Detalhes da Candidatura
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-heritage-navy/40 dark:text-white/40 font-mono text-sm">#{candidatura.id.substring(0, 8).toUpperCase()}</span>
                            <Badge className={`uppercase text-[10px] tracking-wider
                                ${status === 'approved' ? 'bg-heritage-success' :
                                    status === 'rejected' ? 'bg-red-500' :
                                        'bg-heritage-ocean'} text-white`
                            }>
                                {status === 'approved' ? 'Aprovada' : status === 'rejected' ? 'Rejeitada' : 'Em Análise'}
                            </Badge>
                            {candidatura.type && (
                                <Badge variant="outline" className="text-[10px] uppercase font-bold border-heritage-navy/20 text-heritage-navy/60">
                                    {candidatura.type}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {status === 'approved' && (
                        <Button onClick={handleGenerateCertificate} className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-navy font-bold rounded-xl shadow-lg">
                            <LucideDownload className="w-4 h-4 mr-2" />
                            Certificado de Admissão
                        </Button>
                    )}

                    {isAdmin && status !== 'approved' && status !== 'rejected' && (
                        <div className="flex gap-3">
                            <Button onClick={handleReject} variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl">
                                <LucideXCircle className="w-4 h-4 mr-2" />
                                Rejeitar
                            </Button>

                            <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-heritage-success hover:bg-heritage-success/90 text-white rounded-xl shadow-lg shadow-heritage-success/20">
                                        <LucideCheckCircle className="w-4 h-4 mr-2" />
                                        Revisar e Aprovar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                                    <div className="bg-heritage-success/10 p-8 border-b border-heritage-success/20">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black text-heritage-navy dark:text-white flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-heritage-success/20 flex items-center justify-center text-heritage-success">
                                                    <LucideCheckCircle className="w-6 h-6" />
                                                </div>
                                                Aprovação de Membro
                                            </DialogTitle>
                                            <DialogDescription className="text-heritage-navy/60 dark:text-white/60">
                                                Revise os dados que constarão no <strong>Certificado de Admissão</strong> antes de finalizar.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-heritage-navy/40 dark:text-white/40 tracking-wider">Nome no Certificado</label>
                                                <Input
                                                    value={approvalData.nome}
                                                    onChange={(e) => setApprovalData({ ...approvalData, nome: e.target.value })}
                                                    className="rounded-xl border-heritage-navy/10 h-12 font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-heritage-navy/40 dark:text-white/40 tracking-wider">NIF</label>
                                                <Input
                                                    value={approvalData.nif}
                                                    onChange={(e) => setApprovalData({ ...approvalData, nif: e.target.value })}
                                                    className="rounded-xl border-heritage-navy/10 h-12 font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-heritage-navy/40 dark:text-white/40 tracking-wider">Email (Para envio)</label>
                                                <Input
                                                    value={approvalData.email}
                                                    onChange={(e) => setApprovalData({ ...approvalData, email: e.target.value })}
                                                    className="rounded-xl border-heritage-navy/10 h-12 font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-heritage-navy/40 dark:text-white/40 tracking-wider">Cargo/Ofício</label>
                                                <Input
                                                    value={approvalData.oficio}
                                                    onChange={(e) => setApprovalData({ ...approvalData, oficio: e.target.value })}
                                                    className="rounded-xl border-heritage-navy/10 h-12 font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-heritage-navy/40 dark:text-white/40 tracking-wider">Categoria de Membro</label>
                                                <Select
                                                    value={approvalData.member_category}
                                                    onValueChange={(val) => setApprovalData({ ...approvalData, member_category: val })}
                                                >
                                                    <SelectTrigger className="rounded-xl border-heritage-navy/10 h-12 font-medium">
                                                        <SelectValue placeholder="Selecione a categoria" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="fundador">Fundador</SelectItem>
                                                        <SelectItem value="efetivo">Efetivo</SelectItem>
                                                        <SelectItem value="contribuinte">Contribuinte</SelectItem>
                                                        <SelectItem value="honorario">Honorário</SelectItem>
                                                        <SelectItem value="institucional">Institucional</SelectItem>
                                                        <SelectItem value="auxiliar">Voluntário/Auxiliar</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-xs font-bold uppercase text-heritage-navy/40 dark:text-white/40 tracking-wider">Número de Membro Gerado</label>
                                                <div className="h-12 rounded-xl bg-heritage-navy/5 dark:bg-white/5 flex items-center px-4 font-mono font-bold text-heritage-navy dark:text-white">
                                                    {approvalData.member_number}
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="gap-2 sm:gap-0">
                                            <Button variant="ghost" onClick={() => setIsApprovalOpen(false)} className="rounded-xl h-12 px-6">Cancelar</Button>
                                            <Button onClick={handleConfirmApproval} disabled={isProcessing} className="bg-heritage-success hover:bg-heritage-success/90 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-heritage-success/20">
                                                {isProcessing ? (
                                                    <>
                                                        <LucideLoader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Processando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <LucideFileCheck className="w-5 h-5 mr-2" />
                                                        Aprovar e Emitir Certificado
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Dados Pessoais */}
                    <Card className="rounded-[32px] border-none shadow-sm glass-card">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-heritage-terracotta/10 flex items-center justify-center text-heritage-terracotta">
                                <LucideUser className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">Dados Pessoais</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase text-heritage-navy/40 font-bold">Nome</label>
                                    <p className="font-semibold text-heritage-navy dark:text-white">{data.nome}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-heritage-navy/40 font-bold">NIF</label>
                                    <p className="font-semibold text-heritage-navy dark:text-white">{data.nif}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-heritage-navy/40 font-bold">Email</label>
                                    <p className="font-semibold text-heritage-navy dark:text-white truncate">{data.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-heritage-navy/40 font-bold">Telefone</label>
                                    <p className="font-semibold text-heritage-navy dark:text-white">{data.telefone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados de Habitação */}
                    {candidatura.type === 'moradia' && (
                        <Card className="rounded-[32px] border-none shadow-sm glass-card">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-heritage-ocean/10 flex items-center justify-center text-heritage-ocean">
                                    <LucideHome className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Habitação</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs uppercase text-heritage-navy/40 font-bold">Morada Atual</label>
                                    <p className="font-semibold text-heritage-navy dark:text-white">{data.moradaAtual}, {data.codigoPostal} {data.localidade}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase text-heritage-navy/40 font-bold">Agregado</label>
                                        <p className="font-semibold text-heritage-navy dark:text-white">{data.agregadoTotal} Pessoas</p>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase text-heritage-navy/40 font-bold">Tipo Alojamento</label>
                                        <p className="font-semibold text-heritage-navy dark:text-white">{data.tipoAlojamento}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-heritage-navy/40 font-bold">Condições Atuais</label>
                                    <p className="text-sm text-heritage-navy/80 dark:text-white/80 leading-relaxed mt-1">{data.condicoesAlojamento}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Ofício e Artesanato */}
                    {(candidatura.type === 'moradia' || candidatura.type === 'profissional') && (
                        <Card className="rounded-[32px] border-none shadow-sm glass-card md:col-span-2">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-heritage-gold/10 flex items-center justify-center text-heritage-gold">
                                    <LucideHammer className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Ofício & Tradição</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs uppercase text-heritage-navy/40 font-bold">Ofício Principal</label>
                                        <p className="font-semibold text-xl text-heritage-navy dark:text-white">{data.oficio}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase text-heritage-navy/40 font-bold">Experiência</label>
                                        <p className="font-semibold text-heritage-navy dark:text-white">{data.anosExperiencia} Anos</p>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase text-heritage-navy/40 font-bold">Como Aprendeu?</label>
                                        <p className="text-sm text-heritage-navy/80 dark:text-white/80 leading-relaxed">{data.comoAprendeu}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs uppercase text-heritage-navy/40 font-bold">Projeto de Atividade</label>
                                        <p className="text-sm text-heritage-navy/80 dark:text-white/80 leading-relaxed mt-1">{data.planoTrabalho}</p>
                                    </div>
                                    <div className="p-4 bg-heritage-sand/20 dark:bg-white/5 rounded-2xl">
                                        <label className="text-xs uppercase text-heritage-navy/40 font-bold mb-2 block">Ensino & Transmissão</label>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${data.disponivelEnsinar === 'sim' ? 'bg-heritage-success' : 'bg-heritage-navy/20'}`} />
                                            <span className="font-bold text-sm">
                                                {data.disponivelEnsinar === 'sim'
                                                    ? `Disponível para ensinar (${data.horasEnsino}h/semana)`
                                                    : 'Indisponível para ensino no momento'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Candidatura Description */}
                    <Card className="rounded-[32px] border-none shadow-sm glass-card md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Motivação</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-heritage-navy/80 dark:text-white/80 leading-relaxed whitespace-pre-wrap">
                                {data.motivacao}
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
