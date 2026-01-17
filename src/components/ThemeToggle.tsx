import { LucideSun, LucideMoon } from "lucide-react"
import { useTheme } from "./theme-provider"
import { motion } from "framer-motion"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative w-14 h-8 bg-heritage-sand dark:bg-zinc-800 rounded-full p-1 transition-apple flex items-center group overflow-hidden border border-heritage-navy/5"
            aria-label="Toggle Theme"
        >
            <motion.div
                className="relative z-10 w-6 h-6 bg-white dark:bg-heritage-navy rounded-full shadow-md flex items-center justify-center flex-shrink-0"
                animate={{ x: theme === "light" ? 0 : 24 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
                {theme === "light" ? (
                    <LucideSun className="w-3.5 h-3.5 text-heritage-terracotta" />
                ) : (
                    <LucideMoon className="w-3.5 h-3.5 text-heritage-gold" />
                )}
            </motion.div>

            {/* Background Micro-indicators */}
            <div className="absolute inset-0 flex justify-between px-2 items-center opacity-20 pointer-events-none">
                <LucideSun className="w-3 h-3 text-heritage-terracotta" />
                <LucideMoon className="w-3 h-3 text-heritage-navy dark:text-heritage-gold" />
            </div>
        </button>
    )
}
