import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"
import {
    LucideUser,
    LucideHome,
    LucideBriefcase,
    LucideHeart,
    LucideArrowRight,
    LucideArrowLeft,
    LucideCheck,
    LucideSend
} from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { logSystemError } from "@/lib/errorLogger"

type CandidatureType = 'moradia' | 'profissional' | 'associado' | 'voluntario'

interface FormData {
    type: CandidatureType

    // Dados Pessoais
    nome: string
    dataNascimento: string
    nacionalidade: string
    nif: string
    telefone: string
    email: string
    moradaAtual: string
    codigoPostal: string
    localidade: string

    // Agregado Familiar (Only Moradia)
    agregadoTotal: number

    // Situação Habitacional (Only Moradia)
    tipoAlojamento: string
    rendaAtual: string
    condicoesAlojamento: string
    rendimentosTrabalho: string

    // Situação Profissional (Moradia & Profissional)
    oficio: string
    anosExperiencia: string
    comoAprendeu: string
    descricaoOficio: string
    portfolioLinks: string
    fotosTrabalho: string[]

    // Projeto de Atividade (All)
    planoTrabalho: string
    disponivelEnsinar: string
    horasEnsino: string
    motivacao: string
    aceitaTermos: boolean
}

const initialFormData: FormData = {
    type: 'moradia',
    nome: "",
    dataNascimento: "",
    nacionalidade: "",
    nif: "",
    telefone: "",
    email: "",
    moradaAtual: "",
    codigoPostal: "",
    localidade: "",
    agregadoTotal: 1,
    tipoAlojamento: "",
    rendaAtual: "",
    condicoesAlojamento: "",
    rendimentosTrabalho: "",
    oficio: "",
    anosExperiencia: "",
    comoAprendeu: "",
    descricaoOficio: "",
    portfolioLinks: "",
    fotosTrabalho: [],
    planoTrabalho: "",
    disponivelEnsinar: "",
    horasEnsino: "",
    motivacao: "",
    aceitaTermos: false
}

export default function Candidatura() {
    const [currentStep, setCurrentStep] = useState(0) // 0 is Type Selection
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const { session } = useAuth()

    // Determine relevant steps based on type
    const getSteps = () => {
        const baseSteps = [{ id: 1, title: "Dados Pessoais", icon: LucideUser }]

        if (formData.type === 'moradia') {
            baseSteps.push({ id: 2, title: "Habitação", icon: LucideHome })
        }

        if (['moradia', 'profissional'].includes(formData.type)) {
            baseSteps.push({ id: 3, title: "Ofício", icon: LucideBriefcase })
        }

        baseSteps.push({ id: 4, title: "Motivação", icon: LucideHeart })

        return baseSteps.map((s, i) => ({ ...s, stepIndex: i + 1 }))
    }

    const steps = getSteps()


    const validateStep = (stepIdx: number) => {
        const newErrors: Record<string, string> = {}
        const currentStepObj = steps.find(s => s.stepIndex === stepIdx)
        if (!currentStepObj) return true // Should not happen

        // Step 1: Personal Data (Always present)
        if (currentStepObj.id === 1) {
            if (!formData.nome) newErrors.nome = "Obrigatório"
            if (!formData.dataNascimento) newErrors.dataNascimento = "Obrigatório"
            if (!formData.nacionalidade) newErrors.nacionalidade = "Obrigatório"
            if (!formData.nif) newErrors.nif = "Obrigatório"
            if (!formData.telefone) newErrors.telefone = "Obrigatório"
            if (!formData.email) newErrors.email = "Obrigatório"
        }

        // Step 2: Housing (Only Moradia)
        if (currentStepObj.id === 2) {
            if (formData.agregadoTotal < 1) newErrors.agregadoTotal = "Mínimo 1"
            if (!formData.tipoAlojamento) newErrors.tipoAlojamento = "Selecione uma opção"
            if (!formData.rendimentosTrabalho) newErrors.rendimentosTrabalho = "Obrigatório"
        }

        // Step 3: Profession (Moradia & Profissional)
        if (currentStepObj.id === 3) {
            if (!formData.oficio) newErrors.oficio = "Obrigatório"
            if (!formData.anosExperiencia) newErrors.anosExperiencia = "Obrigatório"
            if (!formData.descricaoOficio) newErrors.descricaoOficio = "Obrigatório"
        }

        // Step 4: Motivation (Always present)
        if (currentStepObj.id === 4) {
            if (!formData.motivacao) newErrors.motivacao = "Obrigatório"
            // Plano de trabalho only mandatory for Moradia and Professional
            if (['moradia', 'profissional'].includes(formData.type) && !formData.planoTrabalho) {
                newErrors.planoTrabalho = "Obrigatório"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (currentStep === 0) {
            setCurrentStep(1) // Move to first real step
        } else {
            if (validateStep(currentStep)) {
                setCurrentStep(prev => prev + 1)
                window.scrollTo(0, 0)
            }
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!session) {
            toast.error("Login Necessário", { description: "Por favor, faça login para enviar." })
            return
        }
        try {
            const { error } = await supabase
                .from('candidaturas')
                .insert({
                    user_id: session.user.id,
                    status: 'submitted',
                    type: formData.type, // Saving the type explicitly
                    form_data: formData
                })

            if (error) throw error
            setSubmitted(true)
        } catch (error: any) {
            toast.error("Erro ao enviar", { description: error.message })
            logSystemError(error, 'Candidatura.handleSubmit', session?.user?.id)
        }
    }

    if (submitted) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-background items-center justify-center p-6 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 rounded-[40px] max-w-lg">
                    <div className="w-20 h-20 rounded-full bg-heritage-success/20 flex items-center justify-center mx-auto mb-6">
                        <LucideCheck className="w-10 h-10 text-heritage-success" />
                    </div>
                    <h1 className="text-3xl font-black text-heritage-navy dark:text-white mb-4">Candidatura Recebida!</h1>
                    <p className="text-heritage-navy/60 dark:text-white/50 mb-6">
                        O seu pedido de adesão como <span className="font-bold text-heritage-terracotta capitalize">{formData.type}</span> foi registado.
                        Será contactado em breve.
                    </p>
                    <Button onClick={() => window.location.href = '/dashboard'} className="rounded-xl">Voltar ao Painel</Button>
                </motion.div>
            </div>
        )
    }

    const currentStepObj = steps.find(s => s.stepIndex === currentStep)

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Step 0: Type Selection */}
            {currentStep === 0 && (
                <div className="container mx-auto px-6 py-20 max-w-5xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-black text-heritage-navy dark:text-white mb-6">
                            Junte-se à Nossa Comunidade
                        </h1>
                        <p className="text-xl text-heritage-navy/60 dark:text-white/40 max-w-2xl mx-auto">
                            Escolha como deseja participar no Bureau Social. Temos espaço para todos que queiram contribuir.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { id: 'moradia', label: 'Programa Moradia', icon: LucideHome, desc: 'Para artesãos que necessitam de habitação e espaço de trabalho.' },
                            { id: 'profissional', label: 'Parceiro Profissional', icon: LucideBriefcase, desc: 'Para mestres que querem ensinar ou colaborar profissionalmente.' },
                            { id: 'associado', label: 'Associado', icon: LucideUser, desc: 'Para quem quer ser membro efetivo e participar na vida associativa.' },
                            { id: 'voluntario', label: 'Voluntário', icon: LucideHeart, desc: 'Para quem quer doar o seu tempo e talento à causa.' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    updateFormData('type', type.id as CandidatureType)
                                    handleNext()
                                }}
                                className="group relative p-8 rounded-[32px] bg-white dark:bg-zinc-900 border-2 border-transparent hover:border-heritage-navy/10 hover:shadow-xl transition-all text-left flex flex-col h-full"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-heritage-navy/5 dark:bg-white/5 flex items-center justify-center text-heritage-navy dark:text-white mb-6 group-hover:bg-heritage-navy group-hover:text-white transition-colors">
                                    <type.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-heritage-navy dark:text-white mb-2">{type.label}</h3>
                                <p className="text-sm text-heritage-navy/50 dark:text-white/40 leading-relaxed">{type.desc}</p>
                                <div className="mt-auto pt-6 flex items-center text-heritage-navy font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Começar <LucideArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Application Form Wizard */}
            {currentStep > 0 && currentStepObj && (
                <div className="container mx-auto px-6 py-10 max-w-4xl">
                    {/* Header with Back Button */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
                                <LucideArrowLeft className="w-6 h-6" />
                            </Button>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-heritage-navy/40 dark:text-white/40">
                                    Candidatura {formData.type}
                                </p>
                                <h2 className="text-2xl font-black text-heritage-navy dark:text-white">
                                    {currentStepObj.title}
                                </h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-heritage-navy/20 dark:text-white/20">
                                0{currentStep}
                            </span>
                            <span className="text-sm font-bold text-heritage-navy/20 dark:text-white/20">
                                / 0{steps.length}
                            </span>
                        </div>
                    </div>

                    {/* Form Fields Container */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-10 rounded-[32px] space-y-8"
                    >
                        {/* 1. DADOS PESSOAIS (All Types) */}
                        {currentStepObj.id === 1 && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input value={formData.nome} onChange={e => updateFormData('nome', e.target.value)} className="h-14 rounded-xl" placeholder="Nome completo" />
                                    {errors.nome && <p className="text-xs text-red-500 font-bold">{errors.nome}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Nascimento</Label>
                                    <Input type="date" value={formData.dataNascimento} onChange={e => updateFormData('dataNascimento', e.target.value)} className="h-14 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nacionalidade</Label>
                                    <Input value={formData.nacionalidade} onChange={e => updateFormData('nacionalidade', e.target.value)} className="h-14 rounded-xl" placeholder="Ex: Portuguesa" />
                                </div>
                                <div className="space-y-2">
                                    <Label>NIF</Label>
                                    <Input value={formData.nif} onChange={e => updateFormData('nif', e.target.value)} className="h-14 rounded-xl" placeholder="123456789" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone</Label>
                                    <Input value={formData.telefone} onChange={e => updateFormData('telefone', e.target.value)} className="h-14 rounded-xl" placeholder="+351..." />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={formData.email} onChange={e => updateFormData('email', e.target.value)} className="h-14 rounded-xl" placeholder="email@exemplo.com" />
                                </div>
                            </div>
                        )}

                        {/* 2. HABITAÇÃO (Only Moradia) */}
                        {currentStepObj.id === 2 && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Agregado Familiar</Label>
                                        <Input type="number" min="1" value={formData.agregadoTotal} onChange={e => updateFormData('agregadoTotal', parseInt(e.target.value))} className="h-14 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rendimento Mensal (€)</Label>
                                        <Input type="number" value={formData.rendimentosTrabalho} onChange={e => updateFormData('rendimentosTrabalho', e.target.value)} className="h-14 rounded-xl" placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Condições Atuais</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Boas", "Razoáveis", "Más", "Precárias"].map(opt => (
                                            <Button
                                                key={opt}
                                                variant={formData.condicoesAlojamento === opt ? 'default' : 'outline'}
                                                onClick={() => updateFormData('condicoesAlojamento', opt)}
                                                className="rounded-full"
                                            >
                                                {opt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. OFÍCIO (Moradia & Profissional) */}
                        {currentStepObj.id === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Ofício / Profissão</Label>
                                    <Input value={formData.oficio} onChange={e => updateFormData('oficio', e.target.value)} className="h-14 rounded-xl" placeholder="Ex: Carpintaria" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Anos de Experiência</Label>
                                    <Input value={formData.anosExperiencia} onChange={e => updateFormData('anosExperiencia', e.target.value)} className="h-14 rounded-xl w-32" type="number" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descrição Técnica</Label>
                                    <Textarea value={formData.descricaoOficio} onChange={e => updateFormData('descricaoOficio', e.target.value)} className="h-32 rounded-xl" placeholder="Descreva o seu trabalho e técnicas..." />
                                </div>
                            </div>
                        )}

                        {/* 4. MOTIVAÇÃO (All Types) */}
                        {currentStepObj.id === 4 && (
                            <div className="space-y-6">
                                {['moradia', 'profissional'].includes(formData.type) && (
                                    <div className="space-y-2">
                                        <Label>Plano de Atividade / Proposta</Label>
                                        <Textarea value={formData.planoTrabalho} onChange={e => updateFormData('planoTrabalho', e.target.value)} className="h-32 rounded-xl" placeholder="O que pretende desenvolver em parceria conosco?" />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Motivação</Label>
                                    <Textarea value={formData.motivacao} onChange={e => updateFormData('motivacao', e.target.value)} className="h-32 rounded-xl" placeholder="Por que deseja juntar-se ao Bureau Social?" />
                                </div>

                                <div className="pt-4 border-t border-heritage-navy/10 dark:border-white/10">
                                    <label className="flex items-start gap-4 cursor-pointer">
                                        <input type="checkbox" checked={formData.aceitaTermos} onChange={e => updateFormData('aceitaTermos', e.target.checked)} className="mt-1 w-5 h-5 rounded" />
                                        <span className="text-sm opacity-70">
                                            Declaro que as informações são verdadeiras e aceito os termos de processamento de dados do Bureau Social.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Footer Controls */}
                        <div className="flex justify-end pt-6">
                            {currentStep < steps.length ? (
                                <Button onClick={handleNext} className="h-14 px-8 rounded-xl font-bold">
                                    Próximo <LucideArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={!formData.aceitaTermos} className="h-14 px-10 rounded-xl font-bold bg-heritage-success hover:bg-heritage-success/90">
                                    <LucideSend className="mr-2 w-5 h-5" /> Submeter Candidatura
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
