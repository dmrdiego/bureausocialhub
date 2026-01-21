import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucideUser, LucideMail, LucidePhone, LucideMapPin, LucideShield, LucideEdit, LucideSave, LucideX, LucideCamera } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"

import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { logSystemError } from "@/lib/errorLogger"

export default function Profile() {
    const { user, profile, refreshProfile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        nif: profile?.nif || ""
    })

    const displayName = profile?.full_name || "Utilizador"
    const displayRole = profile?.role === 'admin' ? 'Administrador' : (profile?.role === 'member' ? 'Associado Confirmado' : 'Pendente')
    const displayEmail = profile?.email || user?.email || "Sem email"
    const displayPhone = profile?.phone || "Não definido"
    const displayNif = profile?.nif || "Não definido"
    const displayMemberNumber = profile?.member_number || "Não atribuído"
    const displayCategory = profile?.member_category || "Não definido"

    const handleEdit = () => {
        setFormData({
            full_name: profile?.full_name || "",
            phone: profile?.phone || "",
            nif: profile?.nif || ""
        })
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
    }

    const handleSave = async () => {
        if (!profile?.id) return

        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    nif: formData.nif
                })
                .eq('id', profile.id)

            if (error) throw error

            await refreshProfile()
            setIsEditing(false)
            toast.success('Perfil atualizado com sucesso!')
        } catch (error: any) {
            console.error('Erro ao salvar perfil:', error)
            toast.error('Erro ao salvar perfil')
            logSystemError(error, 'Profile.handleSave', profile?.id)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-16 transition-apple animate-in fade-in duration-700">
            {/* Header - Apple Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-3">
                    <Badge variant="outline" className="border-heritage-navy/10 dark:border-white/10 text-heritage-navy dark:text-white/60 px-4 py-1 rounded-full uppercase text-[9px] font-black tracking-[0.2em] backdrop-blur-xl">
                        Perfil de Associado
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black text-heritage-navy dark:text-white tracking-tighter transition-apple">
                        Meus <span className="text-heritage-ocean">Dados</span>.
                    </h1>
                </div>
                <div className="flex gap-4">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] border-heritage-navy/10"
                            >
                                <LucideX className="w-4 h-4 mr-2" /> Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] bg-heritage-success hover:bg-heritage-success/90"
                            >
                                <LucideSave className="w-4 h-4 mr-2" /> {isSaving ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleEdit}
                            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] bg-heritage-terracotta hover:bg-heritage-terracotta/90"
                        >
                            <LucideEdit className="w-4 h-4 mr-2" /> Editar Perfil
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Main Profile Card - Apple Glass */}
                    <div className="glass-card rounded-[56px] border-none shadow-sm p-12 lg:p-16 transition-apple">
                        <div className="flex flex-col md:flex-row gap-16 items-center md:items-start">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                className="w-40 h-40 bg-heritage-sand dark:bg-zinc-900 rounded-[48px] flex items-center justify-center text-heritage-navy dark:text-white shrink-0 transition-apple border-8 border-white dark:border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer"
                            >
                                <LucideUser className="w-20 h-20" />
                                <div className="absolute inset-0 bg-heritage-terracotta/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <LucideCamera className="w-8 h-8 text-white" />
                                </div>
                            </motion.div>
                            <div className="space-y-10 flex-1 text-center md:text-left">
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-heritage-navy/40">Nome Completo</Label>
                                            <Input
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className="text-2xl font-black rounded-xl h-14"
                                            />
                                        </div>
                                    ) : (
                                        <h2 className="text-4xl font-black text-heritage-navy dark:text-white tracking-tight transition-apple">{displayName}</h2>
                                    )}
                                    <div className="flex items-center gap-4 justify-center md:justify-start flex-wrap">
                                        <Badge className="bg-heritage-gold dark:bg-heritage-gold/20 text-heritage-navy dark:text-heritage-gold font-black text-[10px] uppercase tracking-widest px-6 py-1.5 rounded-full border border-heritage-gold/30">{displayRole}</Badge>
                                        {displayMemberNumber !== "Não atribuído" && (
                                            <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                                                Nº {displayMemberNumber}
                                            </Badge>
                                        )}
                                        {displayCategory !== "Não definido" && (
                                            <Badge className="bg-heritage-ocean/10 text-heritage-ocean font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border-none">
                                                {displayCategory}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 pt-4">
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-heritage-navy/40">E-mail</Label>
                                                <Input value={displayEmail} disabled className="rounded-xl h-12 bg-heritage-sand/50" />
                                                <p className="text-[9px] text-heritage-navy/30">E-mail não pode ser alterado</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-heritage-navy/40">Telemóvel</Label>
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+351 900 000 000"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-heritage-navy/40">NIF Fiscal</Label>
                                                <Input
                                                    value={formData.nif}
                                                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                                                    placeholder="123456789"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-heritage-navy/40">Localização</Label>
                                                <Input value="Lisboa, Portugal" disabled className="rounded-xl h-12 bg-heritage-sand/50" />
                                            </div>
                                        </>
                                    ) : (
                                        [
                                            { label: "E-mail", val: displayEmail, icon: LucideMail, color: "text-heritage-terracotta" },
                                            { label: "Telemóvel", val: displayPhone, icon: LucidePhone, color: "text-heritage-ocean" },
                                            { label: "Localização", val: "Lisboa, Portugal", icon: LucideMapPin, color: "text-heritage-success" },
                                            { label: "NIF Fiscal", val: displayNif, icon: LucideShield, color: "text-heritage-gold" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 lg:gap-6 group overflow-hidden">
                                                <div className={`w-12 h-12 bg-heritage-sand dark:bg-zinc-900 rounded-2xl flex items-center justify-center transition-apple group-hover:bg-heritage-navy dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-heritage-navy shrink-0`}>
                                                    <item.icon className={`w-5 h-5 ${item.color} group-hover:text-current`} />
                                                </div>
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="text-[8px] font-black uppercase text-heritage-navy/20 dark:text-white/20 tracking-[0.2em]">{item.label}</div>
                                                    <div className="text-sm font-bold text-heritage-navy/60 dark:text-white/60 transition-apple truncate" title={item.val}>{item.val}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="glass-card rounded-[48px] border-none shadow-sm p-12 space-y-8 hover:bg-heritage-sand/20 dark:hover:bg-zinc-900/50 transition-apple">
                            <h3 className="text-2xl font-black text-heritage-navy dark:text-white transition-apple">Segurança</h3>
                            <p className="text-base text-heritage-navy/40 dark:text-white/30 font-medium leading-relaxed transition-apple">Mantenha sua chave de acesso atualizada para garantir o sigilo dos seus dados.</p>
                            <Button variant="outline" className="w-full rounded-[20px] h-14 border-heritage-navy/10 dark:border-white/10 font-black uppercase tracking-widest text-[10px] text-heritage-navy dark:text-white hover:bg-heritage-navy hover:text-white transition-apple">Alterar Password</Button>
                        </div>
                        <div className="glass-card rounded-[48px] border-none shadow-sm p-12 space-y-8 hover:bg-heritage-sand/20 dark:hover:bg-zinc-900/50 transition-apple">
                            <h3 className="text-2xl font-black text-heritage-navy dark:text-white transition-apple">Comunicações</h3>
                            <p className="text-base text-heritage-navy/40 dark:text-white/30 font-medium leading-relaxed transition-apple">Configure suas preferências de recepção de editais e convites de assembleia.</p>
                            <Button variant="outline" className="w-full rounded-[20px] h-14 border-heritage-navy/10 dark:border-white/10 font-black uppercase tracking-widest text-[10px] text-heritage-navy dark:text-white hover:bg-heritage-navy hover:text-white transition-apple">Preferências</Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* Status Card - Heritage Theme */}
                    <div className="rounded-[56px] border-none shadow-2xl bg-heritage-navy dark:bg-zinc-900 p-12 text-white space-y-10 relative overflow-hidden group transition-apple">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-heritage-terracotta/20 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-heritage-terracotta/30 transition-all" />

                        <div className="relative z-10 space-y-8">
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black tracking-tight leading-tight">Estado das <br /> Quotas</h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-white/30 font-black uppercase tracking-widest text-[9px]">Ciclo 2026</span>
                                    <Badge className={`${profile?.quota_status === 'active' ? 'bg-heritage-success' : 'bg-heritage-gold'} text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full`}>
                                        {profile?.quota_status === 'active' ? 'Liquidado' : (profile?.quota_status === 'late' ? 'Em Atraso' : 'Pendente')}
                                    </Badge>
                                </div>
                            </div>

                            <p className="text-lg font-medium leading-relaxed text-white/90 pt-4">Sua contribuição é o motor que permite ao <span className="font-black text-heritage-terracotta">Bureau Social</span> reabilitar o património de Lisboa.</p>

                            <Button className="w-full bg-white text-black hover:bg-gray-100 rounded-[24px] h-16 font-black uppercase tracking-widest text-[11px] shadow-xl hover:shadow-2xl transition-apple">Ver Histórico de Apoios</Button>

                            <div className="pt-4 text-center">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Emitido: IPSS #2026-X12</span>
                            </div>
                        </div>
                    </div>

                    {/* Member Card */}
                    {profile?.member_number && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-[48px] bg-gradient-to-br from-heritage-terracotta to-heritage-terracotta/80 p-10 text-white space-y-6"
                        >
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Cartão de Associado</div>
                            <div className="text-2xl font-black">{displayName}</div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/50">Nº Sócio</div>
                                    <div className="text-xl font-black">{displayMemberNumber}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] uppercase tracking-widest text-white/50">Categoria</div>
                                    <div className="text-lg font-bold capitalize">{displayCategory}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
