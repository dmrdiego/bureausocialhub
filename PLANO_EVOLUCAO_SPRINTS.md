# Plano de Evolução do Bureau Social HUB

Baseado na análise do repositório de referência (`Site_App_Bureau_Social`), identificamos funcionalidades chave que devem ser portadas para este workspace (`Bureau Social HUB`) para elevar o nível de gestão e operação.

Abaixo, apresentamos uma proposta de implementação dividida em Sprints.

---

## 🚀 Sprint 1: Governança & Gestão Avançada de Associados
**Objetivo:** Aprofundar o controle sobre a base de membros, permitindo uma gestão granular de perfis, categorias e permissões.

### Funcionalidades a Implementar:
1.  **Painel de Associados Expandido (`AdminAssociados.tsx`)**:
    *   [ ] Implementar cards de estatísticas detalhadas (Total, Fundadores, Efetivos, etc.).
    *   [ ] Adicionar barra de pesquisa avançada (Nome, Email, Nº de Sócio).
    *   [ ] Implementar filtros por Categoria (Fundador, Efetivo, Contribuinte).
2.  **Edição de Perfil Admin**:
    *   [ ] Modal para edição de dados sensíveis pelo Admin:
        *   Atribuir/Editar Número de Sócio.
        *   Alterar Categoria de Membro.
        *   Gerir permissões especiais (Admin, Direção).
3.  **Atualização do Schema Local (`mockSupabase`)**:
    *   [ ] Adicionar campos: `member_category`, `member_number`, `is_direction`.

---

## 📡 Sprint 2: Comunicação Corporativa (Broadcast)
**Objetivo:** Capacitar a direção a enviar comunicados oficiais, editais e newsletters diretamente pela plataforma.

### Funcionalidades a Implementar:
1.  **Módulo de Comunicações (`Comunicacoes.tsx`)**:
    *   [ ] Interface de composição de email com suporte a templates básicos.
    *   [ ] Pré-visualização (Preview) HTML da mensagem.
2.  **Segmentação de Envio**:
    *   [ ] Lógica para selecionar destinatários: "Todos", "Apenas Direção", "Apenas Ativos", etc.
    *   [ ] Contagem dinâmica de destinatários antes do envio.
3.  **Simulação de Envio**:
    *   [ ] Funcionalidade de "Enviar Teste" (para o email do admin).
    *   [ ] Feedback visual de progresso e sucesso no envio em massa.

---

## 🎨 Sprint 3: CMS & Gestão de Conteúdo
**Objetivo:** Permitir que administradores não-técnicos atualizem textos e informações do site institucional (Landing Page).

### Funcionalidades a Implementar:
1.  **Sistema CMS (`AdminCMS.tsx`)**:
    *   [ ] Criar painel para edição de seções: Hero, Missão, Serviços, Projetos.
    *   [ ] Armazenar conteúdo no banco de dados (`cms_content` table).
2.  **Página Inicial Dinâmica**:
    *   [ ] Refatorar a `Home.tsx` para consumir os textos do banco de dados ao invés de textos hardcoded.
    *   [ ] Garantir fallback para conteúdo padrão se o banco estiver vazio.

---

## 🗳️ Sprint 4: Assembleias Híbridas (Fase 2)
**Objetivo:** Expandir o sistema de votação atual para suportar assembleias completas com presenças e atas.

### Funcionalidades a Implementar:
1.  **Gestão de Presenças (Quorum)**:
    *   [ ] Registro de entrada/presença de associados na assembleia.
    *   [ ] Cálculo automático de quorum baseado nos estatutos.
2.  **Atas Automáticas**:
    *   [ ] Geração de rascunho de ata com base nas votações realizadas.

---

**Próximos Passos Sugeridos:**
Recomendamos iniciar pela **Sprint 1**, pois a gestão correta de categorias de membros é pré-requisito para uma segmentação de comunicações eficaz na Sprint 2.
