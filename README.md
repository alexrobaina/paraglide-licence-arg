# 🪂 ParaglideExam

App web para preparar el **examen teórico de licencia de parapente — Piloto Básico
Nivel 3** de la Federación Argentina de Vuelo Libre (FAVL). Convierte el cuestionario
oficial en una experiencia de estudio interactiva: simulacros cronometrados,
práctica por tema, repaso de errores y flashcards, sobre **371 preguntas oficiales**
en 5 temas.

Sin backend, sin cuentas: se abre y funciona. Todo el progreso vive en tu navegador.

---

## ✨ Características

- **🕐 Simulacro de examen** — 60 preguntas al azar, cronómetro, navegación entre
  preguntas y veredicto real: aprobás con **270/360** puntos (75%). Incluye desglose
  por tema y revisión respuesta por respuesta.
- **📚 Práctica por tema** — elegí uno o varios temas y respondé con feedback
  inmediato (correcto/incorrecto y el puntaje de cada opción).
- **🔁 Repaso de errores** — las preguntas que fallás se guardan y se vuelven a
  preguntar, priorizadas por cantidad de fallos, hasta que las domines.
- **🃏 Flashcards** — tarjetas pregunta/respuesta para memorizar rápido.
- **📊 Progreso** — mejor simulacro, dominio por tema y estadísticas, persistidos
  localmente.
- **🌗 Dark mode** y diseño responsive (mobile-first).

## 🧮 Cómo funciona el puntaje

El banco oficial asigna un puntaje a cada opción: las **correctas suman** (+2, +3,
+4, +6…) y las **incorrectas restan** (−6). Muchas preguntas tienen **más de una
respuesta correcta**.

- El puntaje de una pregunta es la suma de las opciones que marcaste, **acotado a
  `[0, maxScore]`** (una pregunta nunca resta al total global).
- Una pregunta es "perfecta" si marcaste **exactamente** todas las correctas.
- El examen muestrea 60 preguntas y escala el total a **360** (60 × 6). Umbral de
  aprobación: **270**.

## 🛠️ Stack

| Capa | Tecnología |
|------|------------|
| Framework | [Next.js](https://nextjs.org/) 15 (App Router) |
| Lenguaje | TypeScript |
| UI | [Tailwind CSS](https://tailwindcss.com/) 3 + componentes de [**uipulse**](https://github.com/alexrobaina/uipulse) |
| Iconos | [lucide-react](https://lucide.dev/) |
| Temas | [next-themes](https://github.com/pacocoursey/next-themes) |
| Persistencia | `localStorage` (sin backend) |

> ⚠️ Se usa **Tailwind 3** a propósito: los componentes de uipulse están escritos
> para Tailwind 3 y se romperían con Tailwind 4.

## 🚀 Empezar

Requisitos: **Node.js ≥ 18**.

```bash
# instalar dependencias
npm install

# desarrollo (http://localhost:3000)
npm run dev

# build de producción
npm run build && npm start
```

## 📁 Estructura

```
src/
  app/
    page.tsx            # Home / dashboard (modos + progreso)
    examen/             # Simulacro (60 al azar, timer, resultados)
    practica/           # Práctica por tema
    repaso/             # Repaso de errores
    flashcards/         # Flashcards
  components/
    ui/                 # Componentes uipulse (Button, Card, Badge, Progress, …)
    QuestionCard.tsx    # Render single/multi + estado revelado
    ExamResults.tsx     # Resultados del simulacro
    PracticeSession.tsx # Sesión reutilizable (práctica + repaso)
  data/
    questions.json      # 371 preguntas parseadas
  lib/
    types.ts            # Tipos del dominio
    constants.ts        # Umbral 270/360, nº de preguntas, temas
    questions.ts        # Carga, filtros por tema, muestreo aleatorio
    scoring.ts          # Motor de puntaje (pregunta y examen)
    storage.ts          # Hook useProgress() sobre localStorage
```

## 💾 ¿Dónde se guarda el progreso?

En el **`localStorage` del navegador**, bajo la clave `paraglide-exam:v1`. No hay
base de datos ni servidor. Implica que:

- El progreso es **por navegador y dispositivo** (no se sincroniza).
- Si borrás los datos del navegador, **se pierde**.
- El "mejor simulacro" es tu récord personal local, **no un ranking** entre usuarios.

## 🗂️ Datos de las preguntas

El banco proviene del cuestionario oficial de la FAVL (`questions.txt`). El archivo
original venía con encoding DOS dañado; se reparó (mapeo `cp1252 → cp437` +
correcciones) y se parseó a `src/data/questions.json`.

Cada pregunta tiene:

```ts
interface Question {
  uid: string;      // clave global única (el banco repite `id` entre temas)
  id: string;       // número original para mostrar (#019)
  section: Section; // Meteorología | Aerodinámica | Material | Reglamentación | Técnica de vuelo
  question: string;
  options: { letter: string; text: string; score: number; correct: boolean }[];
  multi: boolean;   // > 1 correcta
  maxScore: number; // suma de las positivas
}
```

> El cuestionario reinicia la numeración por tema (hay varias preguntas con el mismo
> número), por eso cada una lleva un `uid` global único además del `id` visible.

## 🗄️ Base de datos y migraciones

El backend usa **Supabase**. El esquema vive en migraciones versionadas en
`supabase/migrations/`. **Cada cambio de schema hay que aplicarlo con `npx supabase db push`.**

👉 Guía completa: [`supabase/README.md`](supabase/README.md)

```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."
export SUPABASE_DB_PASSWORD="..."
npx supabase db push        # aplica las migraciones pendientes
```

## 📐 Documentación de diseño (BMad)

El proyecto se planificó con el flujo [BMad Method](https://bmadcode.com/). Los
artefactos están en `_bmad-output/planning-artifacts/`:

- `brief.md` — product brief
- `prd.md` — requisitos del producto
- `architecture.md` — decisiones técnicas

## 🗺️ Roadmap

- [ ] Soporte multinivel (otras licencias) con un campo `level` y selector
- [ ] Export/Import del progreso (archivo JSON)
- [ ] PWA instalable para estudiar offline
- [ ] Sincronización entre dispositivos / ranking real (requiere backend)

## ⚠️ Aviso

Herramienta de estudio **no oficial**. Verificá siempre el material y el reglamento
vigente con la FAVL.
