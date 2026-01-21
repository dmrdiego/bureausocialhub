
const MOCK_DELAY = 500;

// Initialize mock DB if empty
const getDb = () => {
    try {
        const dbString = localStorage.getItem('mock_db');
        if (!dbString || dbString === 'undefined') {
            const initial = {
                profiles: [],
                candidaturas: [],
                votes: [],
                assembly_votes: [],
                projects: [
                    { id: "1", title: "Horta Urbana Comunitária", description: "Criação de uma horta vertical no pátio da Rua dos Froios para usufruto dos moradores.", votes: 45, goal: 100 },
                    { id: "2", title: "Workshop de Azulejaria", description: "Série de oficinas mensais abertas ao bairro para ensino de técnicas de restauro.", votes: 82, goal: 100 },
                    { id: "3", title: "Iluminação Eficiente", description: "Substituição das luzes das áreas comuns por sistemas LED de baixo consumo.", votes: 12, goal: 50 }
                ],
                assemblies: [
                    { id: "asm_001", title: "Assembleia Geral Ordinária Q1 2026", date: new Date().toISOString(), status: 'open_for_voting' }
                ],
                assembly_items: [
                    { id: "item_01", assembly_id: "asm_001", title: "Aprovação do Relatório de Contas 2025", description: "Discussão e votação do relatório financeiro do ano anterior.", type: "voting_simple", order_index: 0 },
                    { id: "item_02", assembly_id: "asm_001", title: "Orçamento para Obras de Requalificação", description: "Aprovação do orçamento de 50.000€ para obras na sede social.", type: "voting_simple", order_index: 1 },
                    { id: "item_03", assembly_id: "asm_001", title: "Eleição do Conselho Fiscal", description: "Eleição para o biénio 2026-2027.", type: "election", order_index: 2 }
                ],
                assembly_attendances: [],
                events: [
                    { id: "evt_001", title: "Workshop: Azulejaria Tradicional", description: "Aprenda as técnicas centenárias de pintura em azulejo com mestres artesãos.", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), location: "Sede Alfama", category: "cultura", image_url: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80&w=800" },
                    { id: "evt_002", title: "Assembleia de Moradores", description: "Reunião mensal para discussão de questões do bairro.", date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), location: "Rua dos Froios", category: "social", image_url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800" },
                    { id: "evt_003", title: "Feira de Artesanato Local", description: "Exposição e venda de produtos artesanais da comunidade.", date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), location: "Praça do Bureau", category: "cultura", image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800" }
                ],
                email_templates: [
                    { id: 'candidature_approved', subject: 'Sua candidatura foi aprovada!', body_markdown: '# Parabéns!\n\nSua candidatura como associado foi aprovada pela direção.' },
                    { id: 'candidature_rejected', subject: 'Atualização sobre sua candidatura', body_markdown: 'Lamentamos informar que sua candidatura não foi aprovada neste momento.' }
                ],
                activity_logs: []
            };
            localStorage.setItem('mock_db', JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(dbString);
    } catch (e) {
        console.error("Error parsing mock_db", e);
        return { profiles: [], candidaturas: [], votes: [], assemblies: [], events: [], activity_logs: [] };
    }
};

const saveDb = (db: any) => {
    localStorage.setItem('mock_db', JSON.stringify(db));
};

class MockQueryBuilder {
    private data: any[];
    private isSingle: boolean = false;
    private pendingOp: (() => Promise<any>) | null = null;

    constructor(private table: string) {
        const db = getDb();
        if (!db[table]) {
            db[table] = [];
            saveDb(db);
        }
        this.data = [...db[table]];
    }

    select(columns: string = '*') {
        if (columns.includes('profiles')) {
            const db = getDb();
            this.data = this.data.map(row => {
                if (row.user_id) {
                    const profile = (db.profiles || []).find((p: any) => p.id === row.user_id);
                    return { ...row, profiles: profile || null };
                }
                return row;
            });
        }
        return this;
    }

    eq(column: string, value: any) {
        this.data = this.data.filter(d => d[column] === value);
        return this;
    }

    neq(column: string, value: any) {
        this.data = this.data.filter(d => d[column] !== value);
        return this;
    }

    order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
        this.data.sort((a, b) => {
            if (a[column] < b[column]) return ascending ? -1 : 1;
            if (a[column] > b[column]) return ascending ? 1 : -1;
            return 0;
        });
        return this;
    }

    limit(n: number) {
        this.data = this.data.slice(0, n);
        return this;
    }

    insert(row: any) {
        this.pendingOp = async () => {
            const rows = Array.isArray(row) ? row : [row];
            const db = getDb();
            if (!db[this.table]) db[this.table] = [];

            const newRows = rows.map(r => ({
                id: r.id || Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                ...r
            }));

            db[this.table].push(...newRows);

            // Side effect for votes
            if (this.table === 'votes' && db.projects) {
                newRows.forEach(r => {
                    const project = db.projects.find((p: any) => p.id === r.project_id);
                    if (project) project.votes = (project.votes || 0) + 1;
                });
            }

            saveDb(db);
            return { data: newRows, error: null };
        };
        return this;
    }

    update(updates: any) {
        this.pendingOp = async () => {
            const db = getDb();
            const idsToUpdate = this.data.map(d => d.id);
            if (db[this.table]) {
                db[this.table] = db[this.table].map((row: any) =>
                    idsToUpdate.includes(row.id) ? { ...row, ...updates } : row
                );
                saveDb(db);
            }
            return { data: updates, error: null };
        };
        return this;
    }

    delete() {
        this.pendingOp = async () => {
            const db = getDb();
            const idsToDelete = this.data.map(d => d.id);
            if (db[this.table]) {
                db[this.table] = db[this.table].filter((row: any) => !idsToDelete.includes(row.id));
                saveDb(db);
            }
            return { data: null, error: null };
        };
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    // This makes the class awaitable
    async then(onfulfilled?: (value: any) => any) {
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        let res: any;

        if (this.pendingOp) {
            res = await this.pendingOp();
            this.pendingOp = null;
        } else {
            res = { data: this.isSingle ? (this.data[0] || null) : this.data, error: null };
        }

        if (onfulfilled) return onfulfilled(res);
        return res;
    }
}

export const mockSupabase = {
    auth: {
        getSession: async () => {
            try {
                const storedSession = localStorage.getItem('mock_session');
                const session = storedSession && storedSession !== 'undefined' ? JSON.parse(storedSession) : null;
                return { data: { session }, error: null };
            } catch (e) {
                return { data: { session: null }, error: null };
            }
        },
        onAuthStateChange: (callback: any) => {
            // Call callback immediately with current session to mimic real behavior better
            setTimeout(async () => {
                const { data: { session } } = await mockSupabase.auth.getSession();
                callback('INITIAL_SESSION', session);
            }, 0);
            return { data: { subscription: { unsubscribe: () => { } } } };
        },
        signInWithOtp: async ({ email }: { email: string }) => {
            console.log(`[MOCK AUTH] Login requested for ${email}`);

            // Hardcoded Admin check
            const isAdminEmail = email.toLowerCase() === 'dmrdiego@gmail.com';
            const mockUserId = isAdminEmail ? 'admin-user-id' : 'mock-user-id';

            const mockSession = {
                user: { id: mockUserId, email },
                access_token: 'mock-token',
                expires_at: Math.floor(Date.now() / 1000) + 3600
            };
            localStorage.setItem('mock_session', JSON.stringify(mockSession));

            // Ensure profile exists
            const db = getDb();
            let existing = (db.profiles || []).find((p: any) => p.email.toLowerCase() === email.toLowerCase());

            if (!existing) {
                existing = {
                    id: mockUserId,
                    email: email,
                    full_name: isAdminEmail ? 'Diego Rocha (Adm)' : 'Novo Usuário',
                    role: isAdminEmail ? 'admin' : 'pending',
                    quota_status: isAdminEmail ? 'active' : 'inactive',
                    created_at: new Date().toISOString()
                };
                if (!db.profiles) db.profiles = [];
                db.profiles.push(existing);
            } else if (isAdminEmail) {
                // Ensure existing profile for this email is promoted to admin
                existing.role = 'admin';
                existing.quota_status = 'active';
            }

            saveDb(db);

            window.location.href = '/dashboard';
            return { data: {}, error: null };
        },

        signOut: async () => {
            localStorage.removeItem('mock_session');
            window.location.href = '/auth';
            return { error: null };
        }
    },
    from: (table: string) => new MockQueryBuilder(table),
    storage: {
        from: (bucket: string) => ({
            upload: async (path: string, _file: any) => {
                await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
                console.log(`[MOCK STORAGE] Uploaded to ${bucket}/${path}`);
                return { data: { path }, error: null };
            },

            getPublicUrl: (path: string) => ({
                data: { publicUrl: `https://placehold.co/600x400?text=${path.split('/').pop()}` }
            })
        })
    },
    functions: {
        invoke: async (name: string) => {
            console.log(`[MOCK FUNCTION] Invoked: ${name}`);
            return { data: { success: true }, error: null };
        }
    }
};
