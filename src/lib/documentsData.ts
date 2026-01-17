// Catálogo de documentos do Bureau Social
// Categorias: institucional, programa, financeiro, politica

export interface Document {
    id: string
    title: string
    category: 'institucional' | 'programa' | 'financeiro' | 'politica'
    date: string
    type: 'PDF' | 'MD'
    path: string
    restricted: boolean // true = apenas membros autenticados
    description?: string
}

export const documents: Document[] = [
    // ========== DOCUMENTOS INSTITUCIONAIS ==========
    {
        id: 'ata-constituicao',
        title: 'Ata de Constituição',
        category: 'institucional',
        date: '15/01/2026',
        type: 'PDF',
        path: '/docs/Ata_Constituicao_Bureau_Social.pdf',
        restricted: false,
        description: 'Ata da assembleia de fundação e Estatutos'
    },
    {
        id: 'regulamento-interno',
        title: 'Regulamento Interno',
        category: 'institucional',
        date: '14/01/2026',
        type: 'PDF',
        path: '/docs/Regulamento_Interno_Bureau_Social.pdf',
        restricted: false,
        description: 'Regras de funcionamento da associação'
    },
    {
        id: 'manual-associado',
        title: 'Manual do Associado',
        category: 'institucional',
        date: '12/01/2026',
        type: 'PDF',
        path: '/docs/Manual_Associado_Bureau_Social.pdf',
        restricted: false,
        description: 'Guia completo para novos associados'
    },

    // ========== DOCUMENTOS DO PROGRAMA MORADIA ==========
    {
        id: 'regulamento-moradia',
        title: 'Regulamento Programa Moradia Artesãos',
        category: 'programa',
        date: '10/01/2026',
        type: 'MD',
        path: '/docs/REGULAMENTO_PROGRAMA_MORADIA_ARTESAOS.md',
        restricted: false,
        description: 'Regras e critérios do programa habitacional'
    },
    {
        id: 'guia-beneficiario',
        title: 'Guia do Beneficiário',
        category: 'programa',
        date: '10/01/2026',
        type: 'MD',
        path: '/docs/GUIA_DO_BENEFICIARIO.md',
        restricted: false,
        description: 'Direitos e deveres dos beneficiários'
    },
    {
        id: 'ficha-tecnica-imovel',
        title: 'Ficha Técnica do Imóvel',
        category: 'programa',
        date: '08/01/2026',
        type: 'MD',
        path: '/docs/FICHA_TECNICA_IMOVEL.md',
        restricted: true,
        description: 'Detalhes técnicos do edifício'
    },
    {
        id: 'termo-compromisso',
        title: 'Termo de Compromisso',
        category: 'programa',
        date: '10/01/2026',
        type: 'MD',
        path: '/docs/TERMO_COMPROMISSO_BENEFICIARIO.md',
        restricted: true,
        description: 'Minuta de contrato para beneficiários'
    },

    // ========== DOCUMENTOS FINANCEIROS ==========
    {
        id: 'orcamento-2025',
        title: 'Orçamento 2025',
        category: 'financeiro',
        date: '01/01/2026',
        type: 'PDF',
        path: '/docs/Orcamento_2025_Bureau_Social.pdf',
        restricted: true,
        description: 'Previsão orçamentária anual'
    },
    {
        id: 'regulamento-quotas',
        title: 'Regulamento de Quotas',
        category: 'financeiro',
        date: '14/01/2026',
        type: 'PDF',
        path: '/docs/Regulamento_Quotas_Contribuicoes_Bureau_Social.pdf',
        restricted: false,
        description: 'Valores e prazos de pagamento'
    },
    {
        id: 'relatorio-contas',
        title: 'Relatório de Atividades e Contas',
        category: 'financeiro',
        date: '01/01/2026',
        type: 'PDF',
        path: '/docs/Relatorio_Atividades_Contas_Modelo_Bureau_Social.pdf',
        restricted: true,
        description: 'Prestação de contas anual (Modelo)'
    },

    // ========== POLÍTICAS ==========
    {
        id: 'codigo-etica',
        title: 'Código de Conduta e Ética',
        category: 'politica',
        date: '14/01/2026',
        type: 'PDF',
        path: '/docs/Codigo_Conduta_Etica_Bureau_Social.pdf',
        restricted: false,
        description: 'Normas de conduta para associados'
    },
    {
        id: 'politica-rgpd',
        title: 'Política de Proteção de Dados',
        category: 'politica',
        date: '14/01/2026',
        type: 'PDF',
        path: '/docs/Politica_Protecao_Dados_RGPD_Bureau_Social.pdf',
        restricted: false,
        description: 'Conformidade com o RGPD'
    },
    {
        id: 'plano-estrategico',
        title: 'Plano Estratégico 2025-2027',
        category: 'politica',
        date: '10/01/2026',
        type: 'PDF',
        path: '/docs/Plano_Estrategico_Trienal_2025_2027_Bureau_Social.pdf',
        restricted: false,
        description: 'Metas e objetivos trienais'
    },
    {
        id: 'plano-voluntariado',
        title: 'Plano de Voluntariado',
        category: 'politica',
        date: '10/01/2026',
        type: 'PDF',
        path: '/docs/Plano_Voluntariado_Bureau_Social.pdf',
        restricted: false,
        description: 'Regras e programas de voluntariado'
    }
]

// Helper para filtrar documentos por categoria
export const filterDocuments = (category: string | null, searchTerm: string, userRole?: string): Document[] => {
    return documents.filter(doc => {
        // Filtro de categoria
        const matchCategory = !category || category === 'todos' || doc.category === category

        // Filtro de busca
        const matchSearch = !searchTerm ||
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchTerm.toLowerCase())

        // Filtro de restrição (documentos restritos só aparecem para membros/admin)
        const canView = !doc.restricted || (userRole === 'member' || userRole === 'admin')

        return matchCategory && matchSearch && canView
    })
}

// Labels das categorias para UI
export const categoryLabels: Record<string, string> = {
    todos: 'Todos',
    institucional: 'Institucional',
    programa: 'Programa',
    financeiro: 'Financeiro',
    politica: 'Políticas'
}
