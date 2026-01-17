# 🎨 Design System: Bureau Social Hub
> Guia de UI/UX para consistência visual em Light e Dark Mode

---

## 📌 Paleta de Cores

### Cores Primárias (Heritage)
| Nome | HSL | Uso |
|------|-----|-----|
| `heritage-navy` | `210 40% 15%` | Textos, fundos primários |
| `heritage-terracotta` | `15 65% 55%` | CTAs, acentos, links ativos |
| `heritage-gold` | `42 78% 60%` | Badges, destaques, success alt |
| `heritage-ocean` | `195 40% 45%` | Links secundários, ícones |
| `heritage-sand` | `40 33% 92%` | Fundos suaves, cards light |
| `heritage-success` | `150 40% 40%` | Status ativo, confirmações |

### Fundos
| Contexto | Light Mode | Dark Mode |
|----------|------------|-----------|
| **Página** | `bg-background` (branco) | `bg-background` (zinc-950) |
| **Seção alt** | `bg-heritage-sand/10` | `bg-zinc-900/30` |
| **Card glass** | `bg-white/40` | `bg-white/5` |
| **Sidebar** | `bg-white` | `bg-zinc-900` |
| **Footer** | `bg-white` | `bg-zinc-950` |

### Textos
| Hierarquia | Light Mode | Dark Mode |
|------------|------------|-----------|
| **Título H1** | `text-heritage-navy` | `text-white` |
| **Título H2** | `text-heritage-navy` | `text-white` |
| **Subtítulo** | `text-heritage-navy/60` | `text-white/60` |
| **Corpo** | `text-heritage-navy/50` | `text-white/40` |
| **Caption** | `text-heritage-navy/30` | `text-white/20` |
| **Accent** | `text-heritage-terracotta` | `text-heritage-terracotta` |

### Bordas
| Contexto | Light Mode | Dark Mode |
|----------|------------|-----------|
| **Sutil** | `border-heritage-navy/5` | `border-white/5` |
| **Normal** | `border-heritage-navy/10` | `border-white/10` |
| **Forte** | `border-heritage-navy/20` | `border-white/20` |

---

## 🔘 Botões

### Primário (CTA)
```css
/* Light */
bg-heritage-terracotta text-white hover:bg-heritage-terracotta/90

/* Dark - mesma cor para consistência */
bg-heritage-terracotta text-white hover:bg-heritage-terracotta/90
```

### Secundário
```css
/* Light */
bg-heritage-navy text-white hover:bg-heritage-ocean

/* Dark */
dark:bg-white dark:text-heritage-navy dark:hover:bg-zinc-200
```

### Outline
```css
/* Light */
border-2 border-heritage-navy text-heritage-navy hover:bg-heritage-navy hover:text-white

/* Dark */
dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-heritage-navy
```

### Ghost/Link
```css
/* Light */
text-heritage-navy/60 hover:text-heritage-terracotta

/* Dark */
dark:text-white/60 dark:hover:text-white
```

---

## 📦 Componentes

### Card Glass
```css
glass-card rounded-[48px] border-none shadow-sm
/* Definido em index.css como: */
bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10
```

### Badge
```css
/* Outline */
border-heritage-navy/10 dark:border-white/10 text-heritage-navy dark:text-white/60

/* Solid */
bg-heritage-gold/20 text-heritage-gold
```

### Input
```css
bg-heritage-sand/50 dark:bg-black/20 
text-heritage-navy dark:text-white 
placeholder:text-heritage-navy/20 dark:placeholder:text-white/20
focus:ring-heritage-terracotta/50
```

---

## 📐 Tipografia

| Elemento | Font | Weight | Tracking |
|----------|------|--------|----------|
| **H1** | Inter | 900 (black) | tighter |
| **H2** | Inter | 900 (black) | tight |
| **H3** | Inter | 800 (extrabold) | tight |
| **Body** | Inter | 500 (medium) | normal |
| **Caption** | Inter | 700 (bold) | widest |
| **Label** | Inter | 900 (black) | [0.2em] |

---

## 🌙 Regras Dark Mode

### Obrigatórias
1. **Todo texto principal** deve ter versão `dark:text-white` ou `dark:text-white/XX`
2. **Todo fundo branco** deve ter versão `dark:bg-zinc-XXX`
3. **Toda borda clara** deve ter versão `dark:border-white/XX`
4. **Ícones coloridos** mantêm cor ou usam `dark:text-white`

### Padrão de Escrita
```tsx
// ✅ Correto
className="text-heritage-navy dark:text-white bg-white dark:bg-zinc-900"

// ❌ Errado
className="text-heritage-navy bg-white"  // Sem dark mode!
```

---

## ✅ Checklist por Componente

| Componente | Dark Mode | Status |
|------------|-----------|--------|
| Navbar | ✅ | Completo |
| Sidebar | ✅ | Completo |
| Footer | ✅ | Completo |
| Home | ✅ | Completo |
| About | ✅ | Completo |
| HousingProject | ✅ | Completo |
| Traditions | ✅ | Completo |
| Auth | ✅ | Completo |
| Dashboard | ✅ | Completo |
| Docs | ✅ | Completo |
| Voting | ✅ | Completo |
| Events | ✅ | Completo |
| Profile | ✅ | Completo |
| Admin | ✅ | Completo |

---

*Design System v1.0 - 16/01/2026*
