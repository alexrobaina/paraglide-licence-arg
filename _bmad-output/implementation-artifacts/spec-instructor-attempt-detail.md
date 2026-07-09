---
title: 'Detalle del examen por piloto para el instructor'
type: 'feature'
created: '2026-07-08'
status: 'done'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El instructor sólo ve la nota final de cada piloto en [instructor/results/page.tsx](src/app/instructor/results/page.tsx). No puede revisar qué preguntas respondió, cuáles acertó y cuáles falló.

**Approach:** Agregar una página de detalle `/instructor/results/[id]` que, a partir del intento guardado, muestre todas las preguntas del examen con la respuesta del piloto, marcando cada opción como correcta/incorrecta y el puntaje por pregunta, más el resultado global. Enlazarla desde cada fila de la lista de Resultados.

## Boundaries & Constraints

**Always:** Server Component (sin `'use client'`). Reusar `QUESTIONS_BY_ID` y `gradeQuestion`/`isPerfect` de `@/lib/scoring` y `@/lib/questions` para la lógica de calificación — nunca reimplementar el puntaje. Respetar la RLS existente (`attempts_instructor_read`): la consulta va con el cliente de servidor autenticado, sin service-role. El área ya está protegida por `instructor/layout.tsx`.

**Ask First:** Cambios de esquema de BD o nuevas RPC. Modificar la lógica de `gradeQuestion`.

**Never:** No exponer el detalle a estudiantes/anónimos. No editar `ExamRunner.tsx` ni el flujo de rendición. No agregar dependencias nuevas. No i18n en esta vista (español fijo, como el resto del panel instructor).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Intento válido del instructor | `id` de un attempt de un template propio | Página con cabecera (piloto, examen, nota, aprobado/no) + lista de todas las preguntas calificadas | N/A |
| Pregunta sin responder | `answers[uid]` ausente o `[]` | La pregunta se muestra como incorrecta, 0 puntos, sin opción elegida | N/A |
| uid ya no existe en el banco | uid en `question_uids` sin match en `QUESTIONS_BY_ID` | Se omite de la lista (no rompe la página) | Filtrar |
| Intento inexistente o de otro instructor | `id` no encontrado por RLS | `notFound()` (404) | 404 |

</frozen-after-approval>

## Code Map

- `src/app/instructor/results/[id]/page.tsx` -- NUEVO. Server Component: fetch del attempt + template, calificación y render del detalle.
- `src/app/instructor/results/[id]/AttemptQuestionList.tsx` -- NUEVO. Componente server read-only que renderiza una pregunta con sus opciones marcadas (correcta / elegida por el piloto) y el puntaje.
- `src/app/instructor/results/page.tsx` -- EDIT. Agregar `answers` no; agregar un enlace "Ver detalle" por fila hacia `/instructor/results/${r.id}`.
- `src/lib/scoring.ts` -- REFERENCIA. `gradeQuestion(q, selected)` → `{ score, maxScore, perfect }`.
- `src/lib/questions.ts` -- REFERENCIA. `QUESTIONS_BY_ID[uid]` → `Question`.
- `src/lib/types.ts` -- REFERENCIA. `Question`, `Option`.
- `src/components/ui/*` -- REFERENCIA. `Card`, `Badge`, `Button` para mantener estilo.

## Tasks & Acceptance

**Execution:**
- [ ] `src/app/instructor/results/[id]/page.tsx` -- Server Component `async`. Recibir `params.id`. Consultar `attempts` con `.select('id, score, max_score, passed, finished_at, student_name, answers, template:exam_templates(title, question_uids, pass_mark), invitation:invitations(student_email)').eq('id', id).single()`. Si no hay data → `notFound()`. Resolver preguntas: `question_uids.map(uid => QUESTIONS_BY_ID[uid]).filter(Boolean)`. Calificar cada una con `gradeQuestion(q, answers[q.uid] ?? [])`. Renderizar cabecera (nombre/email del piloto, título del examen, `score/max_score`, Badge aprobado/no, fecha, conteo de correctas) + `AttemptQuestionList`. Incluir enlace "Volver a Resultados".
- [ ] `src/app/instructor/results/[id]/AttemptQuestionList.tsx` -- Recibe `questions` y `answers`. Por pregunta: número + enunciado + Badge de estado (Correcta / Incorrecta) + puntaje `score/maxScore`. Por opción: texto y marcadores visuales — correcta (verde), elegida por el piloto (resaltada), correcta-no-elegida y elegida-incorrecta bien diferenciadas (íconos Check/X estilo `QuestionCard`). Sin interactividad.
- [ ] `src/app/instructor/results/page.tsx` -- En la última celda de cada fila agregar `<Link href={`/instructor/results/${r.id}`}>` con un `Button variant="outline" size="sm"` ("Ver detalle"), conviviendo con el botón Diploma existente.

**Acceptance Criteria:**
- Given un instructor autenticado viendo Resultados, when hace clic en "Ver detalle" de un piloto, then llega a `/instructor/results/[id]` y ve todas las preguntas del examen calificadas.
- Given un intento con respuestas, when se renderiza el detalle, then cada pregunta muestra las opciones correctas, la selección del piloto y si acertó (perfect) o no, con el puntaje por pregunta y el total coincidiendo con `attempts.score`.
- Given una pregunta que el piloto dejó en blanco, when se renderiza, then aparece como incorrecta con 0 puntos y sin opción elegida.
- Given un `id` inexistente o de un examen de otro instructor, when se abre la URL, then responde 404 (`notFound()`), sin filtrar datos.

## Verification

**Commands:**
- `npm run lint` -- expected: sin errores nuevos.
- `npm run build` -- expected: compila; la ruta `/instructor/results/[id]` aparece en el output.

**Manual checks:**
- Con un intento real, abrir `/instructor/results/[id]`: la suma de puntajes por pregunta coincide con la nota total; opciones correctas y la selección del piloto se ven claramente diferenciadas.

## Review Findings

Code review 2026-07-09 (3 capas adversariales). 1 decision-needed, 1 patch, 1 defer, 4 descartados.

- [x] [Review][Decision] Consistencia por re-calificación contra el banco vivo — RESUELTO: se planifica como **historia nueva** (robustez completa). La página re-califica con `QUESTIONS_BY_ID` actual en vez de datos congelados al enviar (solo se guardan letras elegidas en `attempts.answers`). Si el banco cambia después del envío: la lista puede contradecir el header (score/passed congelados), descartar uids huérfanos y ocultar letras obsoletas. Fuente: edge (ECH1+ECH2+ECH4). Fix acordado = guardar snapshot calificado por pregunta al enviar (cambio de esquema + RPC submit + ExamRunner). Ver deferred-work.
- [x] [Review][Patch] Sin empty-state cuando el template es null o sin preguntas [src/app/instructor/results/[id]/page.tsx:91] — APLICADO: empty-state con Inbox + "Este intento no tiene preguntas para mostrar" cuando `entries=[]`.
- [x] [Review][Defer] Denominador del header `/{max_score}` (360) vs suma de maxScore por pregunta en templates no estándar [src/app/instructor/results/[id]/page.tsx:125] — diferido: el score sí coincide con `attempts.score`; solo el denominador máximo diverge para templates que no sumen 360. El max oficial es el correcto (consistente con el diploma).

Descartados: embed to-one como array (mismo idiom que la página de Resultados en prod), `finished_at` nullable (es NOT NULL en el esquema), divergencia por escalado de `gradeExam` (el examen real guarda la suma cruda, no escalada), "Sin responder" vs "Incorrecta" (mejora deliberada de UX, funcionalmente conforme: variante roja, 0 pts, sin "Elegida").
