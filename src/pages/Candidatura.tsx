import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    LucideUser,
    LucideHome,
    LucideBriefcase,
    LucideHeart,
    LucideArrowRight,
    LucideArrowLeft,
    LucideCheck,
    LucideSend,
    LucideX
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

interface FormData {
    // Dados Pessoais
    nome: string
    dataNascimento: string
    nacionalidade: string
    estadoCivil: string
    nif: string
    documentoId: string
    moradaAtual: string
    codigoPostal: string
    localidade: string
    telefone: string
    email: string

    // Agregado Familiar
    agregadoTotal: number

    // Situação Habitacional
    tipoAlojamento: string
    rendaAtual: string
    condicoesAlojamento: string
    motivoCandidatura: string

    // Situação Profissional
    oficio: string
    anosExperiencia: string
    comoAprendeu: string
    exerceAtualmente: boolean
    motivoNaoExerce: string
    possuiEspacoTrabalho: boolean
    localTrabalho: string

    // Rendimentos
    rendimentosTrabalho: string
    pensoes: string
    subsidios: string
    outrosRendimentos: string

    // Ofício Tradicional
    descricaoOficio: string
    formacaoAprendizagem: string
    portfolioLinks: string
    fotosTrabalho: string[] // URLs das fotos carregadas

    // Projeto de Atividade
    planoTrabalho: string
    disponivelEnsinar: string
    horasEnsino: string
    canaisComercializacao: string[]

    // Motivação
    motivacao: string

    // Declaração
    aceitaTermos: boolean
}

const initialFormData: FormData = {
    nome: "",
    dataNascimento: "",
    nacionalidade: "",
    estadoCivil: "",
    nif: "",
    documentoId: "",
    moradaAtual: "",
    codigoPostal: "",
    localidade: "",
    telefone: "",
    email: "",
    agregadoTotal: 1,
    tipoAlojamento: "",
    rendaAtual: "",
    condicoesAlojamento: "",
    motivoCandidatura: "",
    oficio: "",
    anosExperiencia: "",
    comoAprendeu: "",
    exerceAtualmente: false,
    motivoNaoExerce: "",
    possuiEspacoTrabalho: false,
    localTrabalho: "",
    rendimentosTrabalho: "",
    pensoes: "",
    subsidios: "",
    outrosRendimentos: "",
    descricaoOficio: "",
    formacaoAprendizagem: "",
    portfolioLinks: "",
    fotosTrabalho: [],
    planoTrabalho: "",
    disponivelEnsinar: "",
    horasEnsino: "",
    canaisComercializacao: [],
    motivacao: "",
    aceitaTermos: false
}

const steps = [
    { id: 1, title: "Dados Pessoais", icon: LucideUser },
    { id: 2, title: "Habitação", icon: LucideHome },
    { id: 3, title: "Ofício", icon: LucideBriefcase },
    { id: 4, title: "Projeto", icon: LucideHeart },
]

export default function Candidatura() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {}

        if (step === 1) {
            if (!formData.nome) newErrors.nome = "Obrigatório"
            if (!formData.dataNascimento) newErrors.dataNascimento = "Obrigatório"
            if (!formData.nacionalidade) newErrors.nacionalidade = "Obrigatório"
            if (!formData.nif) newErrors.nif = "Obrigatório"
            if (!formData.telefone) newErrors.telefone = "Obrigatório"
            if (!formData.email) newErrors.email = "Obrigatório"
            if (!formData.moradaAtual) newErrors.moradaAtual = "Obrigatório"
        }

        if (step === 2) {
            if (formData.agregadoTotal < 1) newErrors.agregadoTotal = "Mínimo 1"
            if (!formData.tipoAlojamento) newErrors.tipoAlojamento = "Selecione uma opção"
            if (!formData.rendimentosTrabalho) newErrors.rendimentosTrabalho = "Obrigatório"
        }

        if (step === 3) {
            if (!formData.oficio) newErrors.oficio = "Obrigatório"
            if (!formData.anosExperiencia) newErrors.anosExperiencia = "Obrigatório"
            if (!formData.descricaoOficio) newErrors.descricaoOficio = "Obrigatório"
        }

        if (step === 4) {
            if (!formData.planoTrabalho) newErrors.planoTrabalho = "Obrigatório"
            if (!formData.motivacao) newErrors.motivacao = "Obrigatório"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1)
            window.scrollTo(0, 0)
        }
    }

    const updateFormData = (field: keyof FormData, value: string | number | boolean | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // nextStep removed in favor of handleNext


    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const { session } = useAuth()

    const handleSubmit = async () => {
        if (!session) {
            toast.error("Login Necessário", {
                description: "Por favor, faça login ou crie conta para enviar a sua candidatura."
            })
            // Opcional: navigate('/auth') se tiver useNavigate
            return
        }

        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitButton) submitButton.disabled = true;

        try {
            const { error } = await supabase
                .from('candidaturas')
                .insert({
                    user_id: session.user.id,
                    status: 'submitted',
                    form_data: formData
                })

            if (error) throw error

            setSubmitted(true)
        } catch (error: any) {
            alert("Erro ao enviar candidatura: " + error.message)
            if (submitButton) submitButton.disabled = false;
        }
    }

    if (submitted) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-background transition-apple">
                <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-16 rounded-[48px] max-w-xl mx-auto"
                    >
                        <div className="w-24 h-24 rounded-full bg-heritage-success/20 flex items-center justify-center mx-auto mb-8">
                            <LucideCheck className="w-12 h-12 text-heritage-success" />
                        </div>
                        <h1 className="text-4xl font-black text-heritage-navy dark:text-white mb-4">
                            Candidatura Enviada!
                        </h1>
                        <p className="text-heritage-navy/60 dark:text-white/40 text-lg mb-8">
                            Recebemos a sua candidatura ao Programa Moradia Artesãos.
                            Entraremos em contacto no prazo de 7 dias úteis.
                        </p>
                        <Badge className="bg-heritage-gold/10 text-heritage-gold border-none px-4 py-2 rounded-full">
                            Referência: #{Date.now().toString(36).toUpperCase()}
                        </Badge>
                    </motion.div>
                </section>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-background transition-apple">
            {/* Hero Header */}
            <section className="relative py-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-40 dark:opacity-10"></div>
                <div className="max-w-4xl mx-auto text-center z-10 relative">
                    <Badge className="bg-heritage-terracotta/10 text-heritage-terracotta border-none px-4 py-2 rounded-full font-black uppercase tracking-widest text-[10px] mb-6">
                        Programa Moradia Artesãos
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-heritage-navy dark:text-white mb-6 transition-apple">
                        Candidatura
                    </h1>
                    <p className="text-xl text-heritage-navy/60 dark:text-white/40 max-w-2xl mx-auto">
                        Preencha o formulário abaixo para se candidatar ao programa de habitação social para artesãos e mestres de ofícios tradicionais.
                    </p>
                </div>
            </section>

            {/* Progress Steps */}
            <section className="px-6 pb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className={`
                                    flex items-center justify-center w-14 h-14 rounded-2xl font-black text-lg transition-apple
                                    ${currentStep >= step.id
                                        ? 'bg-heritage-navy dark:bg-white text-white dark:text-heritage-navy'
                                        : 'bg-heritage-sand dark:bg-zinc-800 text-heritage-navy/30 dark:text-white/30'
                                    }
                                `}>
                                    {currentStep > step.id ? (
                                        <LucideCheck className="w-6 h-6" />
                                    ) : (
                                        <step.icon className="w-6 h-6" />
                                    )}
                                </div>
                                <span className={`
                                    hidden sm:block ml-3 font-bold text-sm transition-apple
                                    ${currentStep >= step.id
                                        ? 'text-heritage-navy dark:text-white'
                                        : 'text-heritage-navy/30 dark:text-white/30'
                                    }
                                `}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`
                                        flex-1 h-1 mx-4 rounded-full transition-apple
                                        ${currentStep > step.id
                                            ? 'bg-heritage-navy dark:bg-white'
                                            : 'bg-heritage-sand dark:bg-zinc-800'
                                        }
                                    `} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form Content */}
            <section className="flex-1 px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card p-10 rounded-[32px]"
                        >
                            {/* Step 1: Dados Pessoais */}
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-heritage-navy dark:text-white mb-2">Dados Pessoais</h2>
                                        <p className="text-heritage-navy/50 dark:text-white/40">Informação básica de identificação</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <Label className="text-heritage-navy dark:text-white font-bold">Nome Completo *</Label>
                                            <Input
                                                value={formData.nome}
                                                onChange={(e) => updateFormData('nome', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none text-lg", errors.nome && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="Seu nome completo"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Data de Nascimento *</Label>
                                            <Input
                                                type="date"
                                                value={formData.dataNascimento}
                                                onChange={(e) => updateFormData('dataNascimento', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.dataNascimento && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Nacionalidade *</Label>
                                            <Input
                                                value={formData.nacionalidade}
                                                onChange={(e) => updateFormData('nacionalidade', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.nacionalidade && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="Portuguesa, Brasileira, etc."
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">NIF *</Label>
                                            <Input
                                                value={formData.nif}
                                                onChange={(e) => updateFormData('nif', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.nif && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="Número de Identificação Fiscal"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Telefone *</Label>
                                            <Input
                                                value={formData.telefone}
                                                onChange={(e) => updateFormData('telefone', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.telefone && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="+351 912 345 678"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-heritage-navy dark:text-white font-bold">Email *</Label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => updateFormData('email', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none text-lg", errors.email && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="seu.email@exemplo.com"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-heritage-navy dark:text-white font-bold">Morada Atual *</Label>
                                            <Input
                                                value={formData.moradaAtual}
                                                onChange={(e) => updateFormData('moradaAtual', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.moradaAtual && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="Rua, número, andar"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Código Postal</Label>
                                            <Input
                                                value={formData.codigoPostal}
                                                onChange={(e) => updateFormData('codigoPostal', e.target.value)}
                                                className="mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none"
                                                placeholder="1000-000"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Localidade</Label>
                                            <Input
                                                value={formData.localidade}
                                                onChange={(e) => updateFormData('localidade', e.target.value)}
                                                className="mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none"
                                                placeholder="Lisboa"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Habitação */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-heritage-navy dark:text-white mb-2">Situação Habitacional</h2>
                                        <p className="text-heritage-navy/50 dark:text-white/40">Informação sobre a sua habitação atual e agregado familiar</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Número de pessoas no agregado familiar</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={formData.agregadoTotal}
                                                onChange={(e) => updateFormData('agregadoTotal', parseInt(e.target.value))}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none w-32", errors.agregadoTotal && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Tipo de Alojamento Atual *</Label>
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {["Arrendamento", "Próprio", "Cedido", "Outro"].map(tipo => (
                                                    <button
                                                        key={tipo}
                                                        type="button"
                                                        onClick={() => updateFormData('tipoAlojamento', tipo)}
                                                        className={`
                                                            px-6 py-3 rounded-xl font-bold transition-apple
                                                            ${formData.tipoAlojamento === tipo
                                                                ? 'bg-heritage-navy dark:bg-white text-white dark:text-heritage-navy'
                                                                : 'bg-heritage-sand/50 dark:bg-zinc-800 text-heritage-navy/60 dark:text-white/40 hover:bg-heritage-sand dark:hover:bg-zinc-700'
                                                            }
                                                        `}
                                                    >
                                                        {tipo}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Renda Mensal Atual (€)</Label>
                                            <Input
                                                type="number"
                                                value={formData.rendaAtual}
                                                onChange={(e) => updateFormData('rendaAtual', e.target.value)}
                                                className="mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none w-48"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Condições do Alojamento</Label>
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {["Boas", "Razoáveis", "Más", "Muito más"].map(cond => (
                                                    <button
                                                        key={cond}
                                                        type="button"
                                                        onClick={() => updateFormData('condicoesAlojamento', cond)}
                                                        className={`
                                                            px-6 py-3 rounded-xl font-bold transition-apple
                                                            ${formData.condicoesAlojamento === cond
                                                                ? 'bg-heritage-navy dark:bg-white text-white dark:text-heritage-navy'
                                                                : 'bg-heritage-sand/50 dark:bg-zinc-800 text-heritage-navy/60 dark:text-white/40 hover:bg-heritage-sand dark:hover:bg-zinc-700'
                                                            }
                                                        `}
                                                    >
                                                        {cond}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Rendimento Mensal do Agregado (€) *</Label>
                                            <Input
                                                type="number"
                                                value={formData.rendimentosTrabalho}
                                                onChange={(e) => updateFormData('rendimentosTrabalho', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none w-48", errors.rendimentosTrabalho && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="0"
                                            />
                                            <p className="text-sm text-heritage-navy/40 dark:text-white/30 mt-2">
                                                Inclua todos os rendimentos: trabalho, pensões, subsídios, etc.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Ofício */}
                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-heritage-navy dark:text-white mb-2">O Seu Ofício</h2>
                                        <p className="text-heritage-navy/50 dark:text-white/40">Conte-nos sobre o ofício tradicional que pratica</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Ofício Tradicional que Pratica *</Label>
                                            <Input
                                                value={formData.oficio}
                                                onChange={(e) => updateFormData('oficio', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.oficio && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="Ex: Azulejaria, Carpintaria, Serralheria, Fado..."
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Anos de Experiência *</Label>
                                            <Input
                                                type="number"
                                                value={formData.anosExperiencia}
                                                onChange={(e) => updateFormData('anosExperiencia', e.target.value)}
                                                className={cn("mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none w-32", errors.anosExperiencia && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Como Aprendeu o Ofício? *</Label>
                                            <Textarea
                                                value={formData.comoAprendeu}
                                                onChange={(e) => updateFormData('comoAprendeu', e.target.value)}
                                                className={cn("mt-2 min-h-[100px] rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.comoAprendeu && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="Descreva como e com quem aprendeu o ofício..."
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Descrição do Ofício *</Label>
                                            <Textarea
                                                value={formData.descricaoOficio}
                                                onChange={(e) => updateFormData('descricaoOficio', e.target.value)}
                                                className={cn("mt-2 min-h-[120px] rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.descricaoOficio && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="Descreva as técnicas que utiliza, os produtos que cria, materiais que trabalha..."
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Portfolio / Links para Trabalhos</Label>
                                            <Input
                                                value={formData.portfolioLinks}
                                                onChange={(e) => updateFormData('portfolioLinks', e.target.value)}
                                                className="mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none"
                                                placeholder="Links para Instagram, website, etc."
                                            />
                                            <div className="mt-4 space-y-4">
                                                <div className="flex items-center justify-center w-full">
                                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-heritage-navy/10 dark:border-white/10 border-dashed rounded-[24px] cursor-pointer bg-heritage-sand/20 dark:bg-zinc-800/50 hover:bg-heritage-sand/40 transition-apple group">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <LucideBriefcase className="w-8 h-8 mb-3 text-heritage-navy/30 dark:text-white/30 group-hover:text-heritage-terracotta transition-colors" />
                                                            <p className="mb-2 text-sm text-heritage-navy/60 dark:text-white/50"><span className="font-bold">Clique para enviar fotos</span> do seu trabalho</p>
                                                            <p className="text-xs text-heritage-navy/40 dark:text-white/30">PNG, JPG (MAX. 5MB)</p>
                                                        </div>
                                                        <input
                                                            id="dropzone-file"
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                if (!e.target.files?.length) return
                                                                if (!session) {
                                                                    toast.error("Você precisa estar logado para enviar arquivos.")
                                                                    return
                                                                }

                                                                const files = Array.from(e.target.files)

                                                                const promise = Promise.all(
                                                                    files.map(async (file) => {
                                                                        const fileExt = file.name.split('.').pop()
                                                                        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`
                                                                        const filePath = `${session.user.id}/${fileName}`

                                                                        const { error: uploadError } = await supabase.storage
                                                                            .from('candidatura-docs')
                                                                            .upload(filePath, file)

                                                                        if (uploadError) throw uploadError

                                                                        const { data } = supabase.storage.from('candidatura-docs').getPublicUrl(filePath)
                                                                        return data.publicUrl
                                                                    })
                                                                )

                                                                toast.promise(promise, {
                                                                    loading: 'Enviando fotos...',
                                                                    success: (urls: string[]) => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            fotosTrabalho: [...(prev.fotosTrabalho || []), ...urls]
                                                                        }))
                                                                        return `${urls.length} fotos enviadas com sucesso!`
                                                                    },
                                                                    error: 'Erro ao enviar fotos. Tente novamente.'
                                                                })
                                                            }}
                                                        />
                                                    </label>
                                                </div>

                                                {/* Preview Gallery */}
                                                {formData.fotosTrabalho?.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                                        {formData.fotosTrabalho.map((url, i) => (
                                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
                                                                <img src={url} alt="Trabalho" className="w-full h-full object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({
                                                                        ...prev,
                                                                        fotosTrabalho: prev.fotosTrabalho.filter((_, idx) => idx !== i)
                                                                    }))}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <LucideX className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Projeto e Motivação */}
                            {currentStep === 4 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-heritage-navy dark:text-white mb-2">Projeto & Motivação</h2>
                                        <p className="text-heritage-navy/50 dark:text-white/40">O que pretende desenvolver e porque se candidata</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Plano de Trabalho *</Label>
                                            <Textarea
                                                value={formData.planoTrabalho}
                                                onChange={(e) => updateFormData('planoTrabalho', e.target.value)}
                                                className={cn("mt-2 min-h-[120px] rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.planoTrabalho && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="O que pretende desenvolver se for selecionado para o programa?"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Está disponível para ensinar o seu ofício? *</Label>
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {["Sim", "Não", "Talvez"].map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => updateFormData('disponivelEnsinar', opt)}
                                                        className={`
                                                            px-6 py-3 rounded-xl font-bold transition-apple
                                                            ${formData.disponivelEnsinar === opt
                                                                ? 'bg-heritage-navy dark:bg-white text-white dark:text-heritage-navy'
                                                                : 'bg-heritage-sand/50 dark:bg-zinc-800 text-heritage-navy/60 dark:text-white/40 hover:bg-heritage-sand dark:hover:bg-zinc-700'
                                                            }
                                                        `}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.disponivelEnsinar === "Sim" && (
                                            <div>
                                                <Label className="text-heritage-navy dark:text-white font-bold">Quantas horas por semana poderia dedicar ao ensino?</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.horasEnsino}
                                                    onChange={(e) => updateFormData('horasEnsino', e.target.value)}
                                                    className="mt-2 h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none w-32"
                                                    placeholder="0"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <Label className="text-heritage-navy dark:text-white font-bold">Motivação *</Label>
                                            <Textarea
                                                value={formData.motivacao}
                                                onChange={(e) => updateFormData('motivacao', e.target.value)}
                                                className={cn("mt-2 min-h-[150px] rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none", errors.motivacao && "border-2 border-red-500 ring-2 ring-red-500/20")}
                                                placeholder="Por que razão se candidata ao Programa Moradia Artesãos? O que este significaria para si e para o seu ofício?"
                                            />
                                        </div>

                                        <div className="p-6 rounded-2xl bg-heritage-gold/10 dark:bg-heritage-gold/5 border border-heritage-gold/20">
                                            <label className="flex items-start gap-4 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.aceitaTermos}
                                                    onChange={(e) => updateFormData('aceitaTermos', e.target.checked)}
                                                    className="mt-1 w-5 h-5 rounded"
                                                />
                                                <span className="text-heritage-navy/80 dark:text-white/60 text-sm leading-relaxed">
                                                    Declaro que todas as informações prestadas são verdadeiras e completas.
                                                    Autorizo o Bureau Social a verificar os dados fornecidos.
                                                    Comprometo-me, caso seja selecionado, a exercer ativamente o meu ofício,
                                                    participar em ações de formação e transmissão de saberes,
                                                    e colaborar em eventos culturais promovidos pela associação.
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="h-14 px-8 rounded-xl font-bold border-2 border-heritage-navy/20 dark:border-white/10"
                        >
                            <LucideArrowLeft className="w-5 h-5 mr-2" />
                            Anterior
                        </Button>

                        {currentStep < steps.length ? (
                            <Button
                                onClick={handleNext}
                                className="h-14 px-8 rounded-xl font-bold bg-heritage-navy dark:bg-white text-white dark:text-heritage-navy hover:bg-heritage-ocean dark:hover:bg-zinc-200"
                            >
                                Próximo
                                <LucideArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={!formData.aceitaTermos}
                                className="h-14 px-10 rounded-xl font-bold bg-heritage-success hover:bg-heritage-success/90 text-white disabled:opacity-50"
                            >
                                <LucideSend className="w-5 h-5 mr-2" />
                                Enviar Candidatura
                            </Button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
