import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LucideMessageSquare, LucideMail, LucidePhone, LucideArrowRight, LucideSend, LucideMapPin } from "lucide-react"
import { motion } from "framer-motion"

import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { logSystemError } from "@/lib/errorLogger"

export default function Help() {
    return (
        <div className="space-y-16 transition-apple animate-in fade-in duration-700">
            {/* Header - Apple Style */}
            <div className="max-w-4xl mx-auto text-center space-y-10 pt-12">
                <Badge variant="outline" className="border-heritage-navy/10 dark:border-white/10 text-heritage-navy dark:text-white/60 px-6 py-2 rounded-full uppercase text-[10px] font-black tracking-[0.3em] backdrop-blur-xl">
                    Suporte & Proximidade
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black text-heritage-navy dark:text-white tracking-tighter transition-apple leading-[0.9]">
                    Como podemos <br /><span className="text-heritage-gold">Ajudar Lisboa?</span>
                </h1>
                <p className="text-xl md:text-2xl text-heritage-navy/40 dark:text-white/30 font-medium italic transition-apple">
                    "A proximidade é o coração pulsante da nossa comunidade."
                </p>
            </div>

            {/* Support Channels - Apple Material Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                {[
                    { icon: LucideMessageSquare, title: "Chat em Direto", desc: "Fale em tempo real com nossa equipa de apoio social.", action: "Abrir Mensageiro", color: "text-heritage-ocean" },
                    { icon: LucideMail, title: "Canal Oficial", desc: "Para partilha de documentos e propostas formais.", action: "Enviar Email", color: "text-heritage-terracotta" },
                    { icon: LucidePhone, title: "Linha Crítica", desc: "Apoio telefónico rápido para situações urgentes.", action: "Ligar Agora", color: "text-heritage-gold" }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -10 }}
                        className="glass-card rounded-[56px] border-none shadow-sm p-12 text-center group transition-apple"
                    >
                        <div className={`w-24 h-24 bg-heritage-sand dark:bg-zinc-900 rounded-[40px] flex items-center justify-center mx-auto mb-10 ${item.color} transition-apple group-hover:scale-110 shadow-lg`}>
                            <item.icon className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-heritage-navy dark:text-white mb-4 transition-apple">{item.title}</h3>
                        <p className="text-base text-heritage-navy/40 dark:text-white/30 font-medium leading-relaxed mb-10 transition-apple">{item.desc}</p>
                        <Button variant="ghost" className="text-heritage-navy dark:text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 mx-auto transition-apple hover:bg-transparent hover:text-heritage-terracotta">
                            {item.action} <LucideArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                        </Button>
                    </motion.div>
                ))}
            </div>

            {/* Contact Form - Apple Layered Design */}
            <section className="py-12">
                <div className="glass-card rounded-[80px] border-none p-12 lg:p-24 transition-apple relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-heritage-ocean/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-apple" />

                    <div className="grid lg:grid-cols-2 gap-24 items-center relative z-10">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-5xl font-black text-heritage-navy dark:text-white leading-[0.95] transition-apple">Fale com a <br /> Direção Executiva</h2>
                                <p className="text-xl text-heritage-navy/40 dark:text-white/30 font-medium transition-apple">Sua sugestão ou crítica construtiva é fundamental para a governança do Bureau.</p>
                            </div>

                            <form className="space-y-8" onSubmit={async (e) => {
                                e.preventDefault()
                                const form = e.target as HTMLFormElement
                                const subject = (form[0] as HTMLInputElement).value
                                const message = (form[1] as HTMLTextAreaElement).value

                                if (!subject || !message) {
                                    toast.error("Por favor, preencha todos os campos.")
                                    return
                                }

                                const loadingToast = toast.loading("Enviando mensagem...")
                                try {
                                    const { data: { session: currentSession } } = await supabase.auth.getSession()
                                    const { error } = await supabase
                                        .from('contact_messages')
                                        .insert({
                                            subject,
                                            message,
                                            user_id: currentSession?.user?.id || null, // Changed from session to currentSession
                                            status: 'open'
                                        })


                                    if (error) throw error

                                    toast.dismiss(loadingToast)
                                    toast.success("Mensagem enviada com sucesso!", {
                                        description: "A Direção Executiva responderá em breve."
                                    })
                                    form.reset()
                                } catch (error: any) {
                                    toast.dismiss(loadingToast)
                                    toast.error("Erro ao enviar mensagem.")
                                    logSystemError(error, 'Help.contactFormSubmit')
                                }


                            }}>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-navy/30 dark:text-white/30 ml-6 transition-apple">Assunto do Contacto</label>
                                    <input
                                        name="subject"
                                        className="w-full bg-heritage-sand/30 dark:bg-zinc-900/50 rounded-[28px] h-20 px-10 focus:outline-none focus:ring-4 focus:ring-heritage-navy/5 dark:focus:ring-white/5 font-bold transition-apple text-heritage-navy dark:text-white border-none"
                                        placeholder="Ex: Novo Projeto em Alfama"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-navy/30 dark:text-white/30 ml-6 transition-apple">Mensagem Detalhada</label>
                                    <textarea
                                        name="message"
                                        className="w-full bg-heritage-sand/30 dark:bg-zinc-900/50 rounded-[40px] p-10 min-h-[250px] focus:outline-none focus:ring-4 focus:ring-heritage-navy/5 dark:focus:ring-white/5 font-bold transition-apple text-heritage-navy dark:text-white border-none resize-none"
                                        placeholder="Como podemos transformar Lisboa juntos?"
                                    />
                                </div>
                                <Button type="submit" className="bg-heritage-navy dark:bg-zinc-800 hover:bg-heritage-ocean dark:hover:bg-zinc-700 text-white rounded-[24px] h-20 px-16 text-xl font-black w-full shadow-2xl transition-apple group">
                                    Enviar Mensagem <LucideSend className="w-5 h-5 ml-4 transition-transform group-hover:translate-x-2 group-hover:-translate-y-1" />
                                </Button>
                            </form>
                        </div>

                        <div className="hidden lg:block relative">
                            <div className="absolute -inset-20 bg-heritage-gold/5 dark:bg-white/5 rounded-full blur-[140px] transition-apple" />
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="relative rounded-[64px] overflow-hidden shadow-3xl border border-white/10 transition-apple"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1549492423-40026e6f4770?auto=format&fit=crop&q=80&w=1000"
                                    className="w-full h-[750px] object-cover"
                                    alt="Sede Social Bureau"
                                />
                                <div className="absolute bottom-12 left-12 right-12 glass-panel p-10 rounded-[40px] flex items-center justify-between transition-apple">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-heritage-navy/40 dark:text-white/40">Visite-nos</div>
                                        <div className="text-xl font-black text-heritage-navy dark:text-white transition-apple">Rua dos Froios, Lisboa</div>
                                    </div>
                                    <div className="w-14 h-14 bg-heritage-terracotta rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <LucideMapPin className="w-7 h-7" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
