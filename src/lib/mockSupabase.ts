
const MOCK_DELAY = 500;

// Initialize mock DB if empty
const getDb = () => {
    const db = localStorage.getItem('mock_db');
    if (!db) {
        const initial = {
            profiles: [],
            candidaturas: [],
            votes: [],
            projects: [ // Initial Projects Data
                { id: "1", title: "Horta Urbana Comunitária", description: "Criação de uma horta vertical no pátio da Rua dos Froios para usufruto dos moradores.", votes: 45, goal: 100 },
                { id: "2", title: "Workshop de Azulejaria", description: "Série de oficinas mensais abertas ao bairro para ensino de técnicas de restauro.", votes: 82, goal: 100 },
                { id: "3", title: "Iluminação Eficiente", description: "Substituição das luzes das áreas comuns por sistemas LED de baixo consumo.", votes: 12, goal: 50 }
            ],
            contact_messages: []
        };
        localStorage.setItem('mock_db', JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(db);
};

// Reset/Populate DB Helper (to fix existing localStorages)
const ensureProjectsExist = (db: any) => {
    if (!db.projects || db.projects.length === 0) {
        db.projects = [
            { id: "1", title: "Horta Urbana Comunitária", description: "Criação de uma horta vertical no pátio da Rua dos Froios para usufruto dos moradores.", votes: 45, goal: 100 },
            { id: "2", title: "Workshop de Azulejaria", description: "Série de oficinas mensais abertas ao bairro para ensino de técnicas de restauro.", votes: 82, goal: 100 },
            { id: "3", title: "Iluminação Eficiente", description: "Substituição das luzes das áreas comuns por sistemas LED de baixo consumo.", votes: 12, goal: 50 }
        ]
        saveDb(db)
    }
}

const saveDb = (db: any) => {
    localStorage.setItem('mock_db', JSON.stringify(db));
};

class MockQueryBuilder {
    private data: any[];

    constructor(private table: string, initialData?: any[]) {
        if (initialData) {
            this.data = initialData;
        } else {
            const db = getDb();

            // Ensure compatibility (Self-Healing)
            if (table === 'projects') ensureProjectsExist(db);

            // initialize table if not exists
            if (!db[table]) {
                db[table] = [];
                saveDb(db);
            }
            this.data = [...db[table]];
        }
    }

    select(_columns: string = '*') {
        // In a real query builder, select happens at the end or filters columns.
        // For mock, we just return 'this' to allow chaining filters.
        return this;
    }

    eq(column: string, value: any) {
        this.data = this.data.filter(row => row[column] === value);

        // Special case: If querying profiles and no user found, mock one for demo experience
        if (this.table === 'profiles' && this.data.length === 0 && column === 'id' && value === 'mock-user-id') {
            const mockProfile = {
                id: value,
                email: 'usuario@exemplo.com',
                full_name: 'Administrador Demo',
                role: 'admin',
                quota_status: 'active',
                quota_next_due: new Date().toISOString(),
                member_category: 'fundador',
                member_number: '001',
                is_direction: true,
                created_at: new Date().toISOString()
            };
            // Save this implicit profile to DB so updates work later
            const db = getDb();
            if (!db.profiles) db.profiles = [];
            db.profiles.push(mockProfile);
            saveDb(db);
            this.data = [mockProfile];
        }

        return this;
    }

    single() {
        return { data: this.data[0] || null, error: null };
    }

    async insert(row: any) {
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        const db = getDb();
        if (!db[this.table]) db[this.table] = [];

        const newRow = {
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            ...row
        };

        db[this.table].push(newRow);

        // TRIGGER: Update project vote count
        if (this.table === 'votes') {
            if (!db.projects) db.projects = []
            const project = db.projects.find((p: any) => p.id === row.project_id);
            if (project) {
                project.votes += 1;
                console.log(`[MOCK DB] Incremented votes for project ${project.title}`);
            }
        }

        saveDb(db);

        console.log(`[MOCK DB] Inserted into ${this.table}:`, newRow);
        return { data: newRow, error: null };
    }

    async update(updates: any) {
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        const db = getDb();
        if (!db[this.table]) return { data: null, error: 'Table not found' };

        // updating rows that match current filters (this.data contains the filtered rows)
        // We need to update them in the main DB
        const idsToUpdate = this.data.map(d => d.id);

        db[this.table] = db[this.table].map((row: any) => {
            if (idsToUpdate.includes(row.id)) {
                return { ...row, ...updates };
            }
            return row;
        });

        saveDb(db);
        console.log(`[MOCK DB] Updated ${this.table} where IDs in:`, idsToUpdate);
        return { data: updates, error: null };
    }

    // Support for promise-like usage (await supabase.from...)
    then(callback: (res: any) => void) {
        const res = { data: this.data, error: null };
        callback(res);
        return Promise.resolve(res);
    }
}

export const mockSupabase = {
    auth: {
        getSession: async () => {
            const storedSession = localStorage.getItem('mock_session');
            return { data: { session: storedSession ? JSON.parse(storedSession) : null }, error: null };
        },
        onAuthStateChange: (_callback: any) => {
            return { data: { subscription: { unsubscribe: () => { } } } };
        },
        signInWithOtp: async ({ email }: { email: string }) => {
            console.log(`[MOCK AUTH] Login requested for ${email}`);
            const mockSession = {
                user: { id: 'mock-user-id', email },
                access_token: 'mock-token',
                expires_at: 9999999999
            };
            localStorage.setItem('mock_session', JSON.stringify(mockSession));

            // Ensure profile exists
            const db = getDb();
            if (!db.profiles) db.profiles = [];
            const existing = db.profiles.find((p: any) => p.id === 'mock-user-id');
            if (!existing) {
                db.profiles.push({
                    id: 'mock-user-id',
                    email: email,
                    full_name: 'Novo Usuário',
                    role: 'pending', // Pending initially
                    quota_status: 'inactive',
                    member_category: 'contribuinte',
                    member_number: null,
                    is_direction: false,
                    created_at: new Date().toISOString()
                });
                saveDb(db);
            }

            window.location.href = '/dashboard';
            return { data: {}, error: null };
        },
        signOut: async () => {
            localStorage.removeItem('mock_session');
            window.location.href = '/auth';
            return { error: null };
        }
    },
    from: (table: string) => {
        return new MockQueryBuilder(table);
    },
    storage: {
        from: (_bucket: string) => ({
            upload: async (path: string, _file: any) => {
                await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
                console.log(`[MOCK STORAGE] Uploaded to ${_bucket}/${path}`);
                // In a real app we would save the file. Here we just pretend.
                return { data: { path }, error: null };
            },
            getPublicUrl: (path: string) => {
                // Generate a visual placeholder using the filename text
                const filename = path.split('/').pop() || 'image';
                return {
                    data: { publicUrl: `https://placehold.co/600x400?text=${filename}` }
                };
            }
        })
    }
};
