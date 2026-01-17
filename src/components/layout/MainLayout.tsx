import { Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import Footer from "./Footer"
import { motion, AnimatePresence } from "framer-motion"

export default function MainLayout() {
    const location = useLocation()
    const isDashboard = location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/docs') ||
        location.pathname.startsWith('/voting') ||
        location.pathname.startsWith('/events') ||
        location.pathname.startsWith('/profile') ||
        location.pathname.startsWith('/help') ||
        location.pathname.startsWith('/admin')

    return (
        <div className="min-h-screen bg-background text-foreground transition-apple flex flex-col font-inter selection:bg-heritage-terracotta selection:text-white">
            <Navbar />

            <div className={cn(
                "flex flex-1",
                isDashboard ? "max-w-screen-2xl mx-auto w-full pt-24" : "w-full"
            )}>
                {isDashboard && <Sidebar />}

                <main className={cn(
                    "flex-1 flex flex-col transition-apple",
                    isDashboard ? "px-6 md:px-12 pb-20 mt-8" : "w-full"
                )}>
                    {/* Page Transitions */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                            className="flex-1 flex flex-col"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {!isDashboard && <Footer />}
        </div>
    )
}
