import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { LucideAlertTriangle, LucideInfo, LucideCheckCircle, LucideClock, LucideRefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLogs() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchLogs = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*, profiles!user_id(full_name)')
            .order('created_at', { ascending: false })
            .limit(100)


        if (!error && data) {
            setLogs(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const getIcon = (type: string) => {
        if (type === 'system_error') return <LucideAlertTriangle className="w-4 h-4 text-red-500" />
        if (type.includes('approved')) return <LucideCheckCircle className="w-4 h-4 text-green-500" />
        return <LucideInfo className="w-4 h-4 text-blue-500" />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-heritage-navy dark:text-white">Logs do Sistema</h3>
                <Button variant="outline" size="sm" onClick={fetchLogs}>
                    <LucideRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            <Card className="glass-card border-none shadow-sm">
                <CardContent className="p-0">
                    <div className="divide-y divide-heritage-navy/5 dark:divide-white/5">
                        {loading && logs.length === 0 ? (
                            <div className="p-8 text-center text-heritage-navy/40">Carregando logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-8 text-center text-heritage-navy/40">Nenhum registro encontrado.</div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-heritage-sand/5 transition-colors flex gap-4 items-start">
                                    <div className="mt-1 p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm">
                                        {getIcon(log.action_type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-sm text-heritage-navy dark:text-white uppercase tracking-wide">
                                                {log.action_type.replace(/_/g, ' ')}
                                                <span className="ml-2 text-[10px] lowercase font-medium text-heritage-navy/30 dark:text-white/20">
                                                    por {log.profiles?.full_name || 'Sistema'}
                                                </span>
                                            </p>

                                            <span className="text-[10px] text-heritage-navy/40 flex items-center gap-1">
                                                <LucideClock className="w-3 h-3" />
                                                {new Date(log.created_at).toLocaleString('pt-PT')}
                                            </span>
                                        </div>

                                        {log.details?.message && (
                                            <p className="text-sm font-mono text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">
                                                {log.details.message}
                                            </p>
                                        )}

                                        <div className="text-xs text-heritage-navy/60 dark:text-white/40 font-mono overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
