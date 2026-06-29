---
title: "Arquitectura: ParaglideExam"
status: draft
created: 2026-06-25
updated: 2026-06-25
author: Alex
module: bmm
---

# Arquitectura: ParaglideExam

## 1. Resumen y decisiones

App **client-side only** sobre **Next.js 15 (App Router)** + **TypeScript** +
**Tailwind CSS 3**, usando los componentes de **UIPulse** (copy-paste, Atomic
Design). Sin backend: el banco de preguntas es un asset estático y todo el estado
del usuario vive en **localStorage**. Esto cumple el requisito "se abre y funciona",
offline-first y sin costos de servidor.

| Decisión | Elección | Motivo |
|---|---|---|
| Framework | Next.js 15 App Router | Stack pedido; mismo que UIPulse |
| Lenguaje | TypeScript | Type-safety del modelo de preguntas/puntaje |
| Estilos | Tailwind 3 + `cn()` | Requisito de UIPulse |
| Componentes | UIPulse (copiados) | Pedido del usuario |
| Datos | `questions.json` estático | Sin backend; banco inmutable |
| Persistencia | localStorage (hook) | Sin cuentas; progreso por dispositivo |
| Estado | React state + hooks | Alcance no requiere store global |
| Tema | next-themes | Dark mode |
| Iconos | lucide-react | Dep. de UIPulse |

## 2. Estructura de carpetas

```
src/
  app/
    layout.tsx            # ThemeProvider, fuentes, shell
    page.tsx              # Home / dashboard (modos + progreso)
    examen/page.tsx       # Simulacro (60 al azar, timer, resultados)
    practica/page.tsx     # Práctica por tema
    repaso/page.tsx       # Repaso de errores
    flashcards/page.tsx   # Flashcards
    globals.css
  components/
    ui/                   # UIPulse copiados: Button, Card, Badge, Progress,
                          # Checkbox, Alert, Spinner, Tab
    QuestionCard.tsx      # Render single/multi + estado revelado
    ExamResults.tsx       # Resultados del simulacro
    ModeCard.tsx          # Tarjeta de modo en el home
    ThemeToggle.tsx
    Providers.tsx         # next-themes provider (client)
  data/
    questions.json        # 371 preguntas parseadas
  lib/
    cn.ts                 # util de UIPulse
    types.ts              # Question, Option, Section, ExamResult...
    questions.ts          # carga, filtros por tema, sampling
    scoring.ts            # cálculo de puntaje pregunta/examen
    storage.ts            # hook useLocalStorage + esquema de progreso
    constants.ts          # umbral 270/360, nº preguntas, temas
```

## 3. Modelo de datos

```ts
type Section =
  | 'Meteorología' | 'Aerodinámica' | 'Material'
  | 'Reglamentación' | 'Técnica de vuelo';

interface Option { letter: string; text: string; score: number; correct: boolean; }

interface Question {
  id: string;            // "001"
  section: Section;
  question: string;
  options: Option[];
  multi: boolean;        // >1 correcta
  maxScore: number;      // suma de positivas
}
```

Progreso persistido (`localStorage` key `paraglide-exam:v1`):

```ts
interface Progress {
  bestExamScore: number | null;        // /360
  examsTaken: number;
  perSection: Record<Section, { correct: number; answered: number }>;
  wrongQueue: Record<string, number>;  // questionId -> nº de fallos pendientes
  knownFlashcards: string[];           // ids marcadas como sabidas
}
```

## 4. Motor de puntaje (`scoring.ts`)

- **Puntaje de pregunta** = suma de `score` de las opciones seleccionadas, acotada
  a `[0, maxScore]` (una pregunta no resta al global; el peor caso por pregunta es 0).
- **Acierto** (para estadística/repaso) = puntaje de la pregunta == `maxScore`
  (eligió exactamente todas las correctas y ninguna incorrecta).
- **Examen**: se muestrean 60 preguntas; total = Σ puntajes; el objetivo es 360
  (60 × 6). Veredicto = APROBADO si total ≥ 270.
- Selección: si `multi` → checkboxes (varias); si no → radios (una).

## 5. Flujos por modo

- **Simulacro**: `sampleQuestions(60)` → responder con timer → `gradeExam()` →
  `ExamResults` → persistir `bestExamScore`, `examsTaken`, `perSection`; fallidas → `wrongQueue`.
- **Práctica**: filtrar por sección(es) → feedback inmediato por pregunta;
  fallidas → `wrongQueue`, aciertos → `perSection`.
- **Repaso**: ordenar `wrongQueue` desc por nº de fallos → preguntar; acierto
  decrementa/elimina de la cola.
- **Flashcards**: filtrar por sección → voltear; "no la sabía" → `wrongQueue`,
  "la sabía" → `knownFlashcards`.

## 6. Riesgos y mitigaciones

- **localStorage en SSR**: acceder solo en cliente (hook con `useEffect`, guard
  `typeof window`). Componentes con estado marcados `'use client'`.
- **Aleatoriedad estable durante el examen**: el set de 60 se fija al montar el
  simulacro (no re-muestrear en cada render).
- **Preguntas con enunciado multilínea**: ya normalizadas en el parseo.

## 7. No incluido (alineado con PRD)

Sin backend, sin auth, sin sync, sin PWA en v1.
