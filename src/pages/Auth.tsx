import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LucideMail, LucideLoader2 } from "lucide-react"

export default function Auth() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) {
            alert(error.message)
        } else {
            setSent(true)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-heritage-sand/10 dark:bg-zinc-950 px-6">
            <div className="w-full max-w-md space-y-8 glass-card p-12 rounded-[48px] border-none shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-terracotta/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-heritage-navy/10 dark:bg-white/5 rounded-full blur-3xl -ml-16 -mb-16" />

                <div className="text-center space-y-4 relative z-10">
                    <Badge variant="outline" className="border-heritage-navy/20 dark:border-white/20 text-heritage-navy dark:text-white/60 px-4 py-1.5 rounded-full uppercase text-[9px] font-black tracking-[0.2em]">
                        Portal do Associado
                    </Badge>
                    <h1 className="text-3xl font-black text-heritage-navy dark:text-white tracking-tight">
                        Bureau Social
                    </h1>
                    <p className="text-heritage-navy/50 dark:text-white/40 font-medium">
                        Acesse sua área exclusiva para gerir quotas, votar e ver documentos.
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                            <LucideMail className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-heritage-navy dark:text-white">Verifique seu Email</h3>
                            <p className="text-sm text-heritage-navy/60 dark:text-white/50">
                                Enviamos um link mágico de acesso para <br />
                                <span className="font-bold text-heritage-navy dark:text-white">{email}</span>
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setSent(false)}
                            className="w-full rounded-2xl h-12 font-bold text-xs uppercase tracking-widest"
                        >
                            Tentar outro email
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-heritage-navy/40 dark:text-white/40 ml-4">
                                Email Institucional
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@bureausocial.pt"
                                className="w-full h-14 bg-heritage-sand/50 dark:bg-black/20 rounded-2xl px-6 font-bold text-heritage-navy dark:text-white text-lg placeholder:text-heritage-navy/20 outline-none focus:ring-2 focus:ring-heritage-terracotta/50 transition-all"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-heritage-terracotta/20 transition-all hover:scale-[1.02]"
                        >
                            {loading ? <LucideLoader2 className="w-5 h-5 animate-spin" /> : "Receber Link de Acesso"}
                        </Button>

                        <p className="text-center text-[10px] text-heritage-navy/30 dark:text-white/30 font-bold uppercase tracking-widest">
                            Acesso seguro via Magic Link
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
