import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LucideCheck, LucideUserPlus, LucideShieldCheck, LucideLoader2 } from "lucide-react"
import { toast } from "sonner"

export default function Onboarding() {
    const { session, profile, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    // Form fields
    const [fullName, setFullName] = useState("")
    const [nif, setNif] = useState("")
    const [phone, setPhone] = useState("")
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "")
            setNif(profile.nif || "")
            setPhone(profile.phone || "")

            // If already member/admin, redirect to dashboard
            if (profile.role !== 'pending') {
                navigate('/dashboard')
            }
        }
    }, [profile, navigate])

    const handleSubmit = async () => {
        if (!fullName || !nif || !phone) {
            toast.error("Por favor, preencha todos os campos obrigatórios.")
            return
        }

        if (!acceptedTerms) {
            toast.error("Você precisa aceitar os termos de associação.")
            return
        }

        setIsLoading(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    nif: nif,
                    phone: phone,
                    role: 'member', // Promote to member
                    quota_status: 'active'
                })
                .eq('id', session?.user.id)

            if (error) throw error

            toast.success("Cadastro concluído com sucesso!")
            await refreshProfile() // Update context
            navigate('/dashboard')

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
            toast.error("Erro ao salvar perfil", { description: errorMessage })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-heritage-sand/30 dark:bg-zinc-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-none shadow-2xl glass-card overflow-hidden">
                    <CardHeader className="bg-heritage-navy dark:bg-zinc-900 text-white p-10 text-center">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                            <LucideUserPlus className="w-10 h-10 text-heritage-gold" />
                        </div>
                        <CardTitle className="text-3xl font-black mb-2">Bem-vindo ao Bureau Social</CardTitle>
                        <CardDescription className="text-white/60 text-lg">
                            Finalize seu cadastro para acessar a plataforma.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-10 space-y-8">
                        {/* Status Checker */}
                        <div className="flex gap-4 p-4 rounded-xl bg-heritage-ocean/10 border border-heritage-ocean/20 items-start">
                            <LucideShieldCheck className="w-6 h-6 text-heritage-ocean mt-1 shrink-0" />
                            <div>
                                <h4 className="font-bold text-heritage-navy dark:text-white">Associação Voluntária</h4>
                                <p className="text-sm text-heritage-navy/60 dark:text-white/50 mt-1">
                                    Ao se cadastrar, você se torna um <strong>Associado Voluntário</strong>.
                                    Esta categoria é <strong>isenta de anuidade (gratuita)</strong> e permite participar das atividades e candidaturas do Bureau Social.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-heritage-navy dark:text-white font-bold">Nome Completo *</Label>
                                <Input
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none text-lg"
                                    placeholder="Seu nome oficial"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-heritage-navy dark:text-white font-bold">NIF *</Label>
                                    <Input
                                        value={nif}
                                        onChange={e => setNif(e.target.value)}
                                        className="h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none"
                                        placeholder="Número de Contribuinte"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-heritage-navy dark:text-white font-bold">Telefone *</Label>
                                    <Input
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="h-14 rounded-xl bg-heritage-sand/50 dark:bg-zinc-800 border-none"
                                        placeholder="+351 ..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="flex items-start gap-4 p-6 rounded-2xl border-2 border-heritage-sand dark:border-zinc-800 cursor-pointer hover:bg-heritage-sand/20 transition-colors">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={e => setAcceptedTerms(e.target.checked)}
                                            className="w-6 h-6 rounded border-gray-300 text-heritage-navy focus:ring-heritage-navy"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="font-bold text-heritage-navy dark:text-white block">
                                            Aceito me tornar Associado Voluntário
                                        </span>
                                        <span className="text-sm text-heritage-navy/60 dark:text-white/40 block">
                                            Declaro que li e aceito os Estatutos e o Regulamento Geral do Bureau Social.
                                            Estou ciente da gratuidade desta categoria de sócio.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !acceptedTerms}
                            className="w-full h-16 rounded-2xl bg-heritage-navy dark:bg-white text-white dark:text-heritage-navy font-black text-lg hover:bg-heritage-navy/90 dark:hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <LucideLoader2 className="w-6 h-6 animate-spin mr-2" />
                            ) : (
                                <LucideCheck className="w-6 h-6 mr-2" />
                            )}
                            Confirmar Cadastro
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
