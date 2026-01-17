import { Link } from "react-router-dom"

export default function Footer() {
    return (
        <footer className="py-24 px-6 bg-white dark:bg-zinc-950 border-t border-heritage-navy/5 dark:border-white/5 transition-colors">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo-symbol.png" alt="Logo Bureau Social" className="w-10 h-10 object-contain" />
                        <span className="text-heritage-navy dark:text-white font-black text-xl tracking-tighter transition-colors">Bureau Social Hub</span>
                    </div>
                    <p className="text-heritage-navy/40 dark:text-white/40 font-medium leading-relaxed max-w-xs transition-colors">
                        IPSS dedicada à reabilitação urbana e preservação do patrimônio humano de Lisboa.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h4 className="font-black text-heritage-navy dark:text-white uppercase tracking-widest text-[10px] transition-colors">Páginas</h4>
                        <ul className="space-y-3 text-sm text-heritage-navy/60 dark:text-white/60 font-semibold transition-colors">
                            <li><Link to="/about" className="hover:text-heritage-terracotta transition-colors">A Associação</Link></li>
                            <li><Link to="/project" className="hover:text-heritage-terracotta transition-colors">Projecto Moradia</Link></li>
                            <li><Link to="/traditions" className="hover:text-heritage-terracotta transition-colors">Tradições</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h4 className="font-black text-heritage-navy dark:text-white uppercase tracking-widest text-[10px] transition-colors">Apoio</h4>
                        <ul className="space-y-3 text-sm text-heritage-navy/60 dark:text-white/60 font-semibold transition-colors">
                            <li><Link to="/docs" className="hover:text-heritage-terracotta transition-colors">Transparência</Link></li>
                            <li><Link to="/help" className="hover:text-heritage-terracotta transition-colors">Contacto</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-6 md:text-right">
                    <h4 className="font-black text-heritage-navy dark:text-white uppercase tracking-widest text-[10px] transition-colors">Sede Social</h4>
                    <address className="text-sm text-heritage-navy/40 dark:text-white/40 font-semibold leading-relaxed not-italic transition-colors">
                        Rua dos Froios<br />
                        Lisboa, Portugal<br />
                        direcao@institutoipss.pt
                    </address>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-heritage-navy/5 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-heritage-navy/20 dark:text-white/20 uppercase tracking-widest transition-colors">
                <span>© 2026 Instituto Português de Negócios Sociais</span>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-heritage-terracotta transition-colors">Instagram</a>
                    <a href="#" className="hover:text-heritage-terracotta transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    )
}
