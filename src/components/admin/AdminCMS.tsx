import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { LucideSave, LucideLayoutTemplate, LucideType } from "lucide-react"
import { logSystemError } from "@/lib/errorLogger"

export default function AdminCMS() {
    const [contents, setContents] = useState<any>({})
    const [loading, setLoading] = useState(true)

    // Fetch Content
    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('cms_content').select('*')
        if (error) {
            toast.error("Erro ao carregar conteúdo")
            logSystemError(error, 'AdminCMS.fetchContent')
        } else {
            const mapped = data?.reduce((acc: any, item: any) => {
                acc[item.section_key] = item.content
                return acc
            }, {}) || {}
            setContents(mapped)
        }
        setLoading(false)
    }

    const handleSave = async (sectionKey: string, newContent: any) => {
        const { error } = await supabase
            .from('cms_content')
            .upsert({ section_key: sectionKey, content: newContent }, { onConflict: 'section_key' })

        if (error) {
            toast.error("Erro ao salvar")
            logSystemError(error, 'AdminCMS.handleSave', sectionKey)
        } else {
            toast.success("Conteúdo atualizado!")
            setContents({ ...contents, [sectionKey]: newContent })
        }
    }

    if (loading) return <div>Carregando...</div>

    return (
        <div className="space-y-6">
            <Card className="glass-card border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LucideLayoutTemplate className="w-5 h-5 text-heritage-terracotta" />
                        Hero Section (Página Inicial)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-heritage-navy/60">Título Principal</label>
                        <Input
                            value={contents.hero?.title || ''}
                            onChange={(e) => setContents({
                                ...contents,
                                hero: { ...contents.hero, title: e.target.value }
                            })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-heritage-navy/60">Subtítulo</label>
                        <Textarea
                            value={contents.hero?.subtitle || ''}
                            onChange={(e) => setContents({
                                ...contents,
                                hero: { ...contents.hero, subtitle: e.target.value }
                            })}
                        />
                    </div>
                    <Button onClick={() => handleSave('hero', contents.hero)}>
                        <LucideSave className="w-4 h-4 mr-2" />
                        Salvar Hero
                    </Button>
                </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LucideType className="w-5 h-5 text-heritage-ocean" />
                        Missão
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-heritage-navy/60">Título da Seção</label>
                        <Input
                            value={contents.mission?.title || ''}
                            onChange={(e) => setContents({
                                ...contents,
                                mission: { ...contents.mission, title: e.target.value }
                            })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-heritage-navy/60">Texto da Missão</label>
                        <Textarea
                            className="h-32"
                            value={contents.mission?.text || ''}
                            onChange={(e) => setContents({
                                ...contents,
                                mission: { ...contents.mission, text: e.target.value }
                            })}
                        />
                    </div>
                    <Button onClick={() => handleSave('mission', contents.mission)}>
                        <LucideSave className="w-4 h-4 mr-2" />
                        Salvar Missão
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
