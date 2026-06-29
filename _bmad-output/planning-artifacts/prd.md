---
title: "PRD: ParaglideExam"
status: draft
created: 2026-06-25
updated: 2026-06-25
author: Alex
module: bmm
---

# PRD: ParaglideExam

## 0. Document Purpose

Define el alcance funcional de la v1 de ParaglideExam: una web app de estudio para
el examen teórico de Piloto Básico Nivel 3 de la FAVL. Deriva del [brief](./brief.md).

## 1. Vision

Que cualquier aspirante pueda preparar y aprobar el examen teórico practicando
bajo condiciones reales, midiendo su progreso y reforzando sus puntos débiles, sin
instalar nada ni crear una cuenta.

## 2. Target User

Aspirante a licencia de parapente Piloto Básico Nivel 3, con fecha de examen
próxima, nivel técnico variable, que estudia desde computadora o celular.

### 2.1 Jobs To Be Done

- "Cuando tengo poco tiempo antes del examen, quiero practicar como si fuera el
  examen real, para saber si ya estoy listo."
- "Cuando fallo preguntas, quiero que me las vuelva a preguntar, para no repetir el
  error el día del examen."
- "Cuando estoy flojo en un tema, quiero practicar solo ese tema, para reforzarlo."
- "Cuando quiero memorizar rápido, quiero ver tarjetas de pregunta/respuesta."

### 2.3 Key User Journeys

1. **Simulacro**: Home → "Simulacro" → responde 60 preguntas con cronómetro →
   ve puntaje (X/360), veredicto (APROBADO si ≥270), desglose por tema → revisa
   respuestas → vuelve al home (mejor puntaje guardado).
2. **Práctica por tema**: Home → "Práctica" → elige tema(s) → responde con feedback
   inmediato por pregunta (correcto/incorrecto y puntaje de cada opción).
3. **Repaso**: Home → "Repaso" (badge con N preguntas pendientes) → responde solo
   las falladas; al acertar, salen de la cola.
4. **Flashcards**: Home → "Flashcards" → elige tema → voltea tarjetas → marca
   "la sabía / no la sabía".

## 3. Glossary

- **Pregunta**: ítem del banco con enunciado, tema y 2+ opciones.
- **Opción correcta**: opción con puntaje positivo. Una pregunta puede tener varias.
- **Multi-respuesta**: pregunta con más de una opción correcta.
- **Penalización**: las opciones incorrectas tienen puntaje negativo (típicamente -6).
- **Umbral de aprobación**: 270 de 360 puntos (75%) en el examen de 60 preguntas.

## 4. Features

### 4.1 Banco de preguntas

#### FR-1: Cargar el banco estructurado
La app carga 371 preguntas desde un JSON con: `id`, `section`, `question`,
`options[]` (cada una con `letter`, `text`, `score`, `correct`), `multi`, `maxScore`.

#### FR-2: Categorización por tema
Cada pregunta pertenece a uno de 5 temas: Meteorología, Aerodinámica, Material,
Reglamentación, Técnica de vuelo. La app permite filtrar por tema.

### 4.2 Motor de puntaje

#### FR-3: Selección de respuesta single y multi
Para preguntas de una sola correcta, selección tipo radio; para multi-respuesta,
selección tipo checkbox. La UI indica cuántas correctas tiene la pregunta.

#### FR-4: Cálculo de puntaje por pregunta
El puntaje de una pregunta es la suma de los `score` de las opciones seleccionadas
(positivos suman, negativos restan), acotado de modo que una pregunta no reste al
total global por debajo de 0 a nivel examen. El máximo por pregunta es `maxScore`.

#### FR-5: Puntaje y veredicto del examen
El simulacro toma 60 preguntas al azar, suma el puntaje, lo escala a /360 y declara
APROBADO si ≥270. Muestra desglose por tema.

### 4.3 Simulacro de examen

#### FR-6: 60 preguntas al azar + cronómetro
Muestreo aleatorio de 60 preguntas del banco. Cronómetro ascendente visible.
Navegación entre preguntas (siguiente/anterior, ir a #).

#### FR-7: Pantalla de resultados
Al terminar: puntaje total, veredicto, tiempo, aciertos/errores, desglose por tema
y revisión pregunta por pregunta (qué eligió vs. correctas). Guarda mejor puntaje.

### 4.4 Práctica por tema

#### FR-8: Feedback inmediato
Tras responder cada pregunta, se revela inmediatamente correcto/incorrecto y el
puntaje de cada opción. Las falladas se registran para el modo Repaso.

### 4.5 Repaso de errores (repetición espaciada)

#### FR-9: Cola de errores persistente
Las preguntas falladas (en cualquier modo) se guardan en localStorage. El modo
Repaso las presenta priorizando las más falladas; acertar reduce su prioridad y al
dominarlas salen de la cola.

### 4.6 Flashcards

#### FR-10: Tarjetas voltear
Frente: enunciado. Dorso: opciones correctas resaltadas. El usuario marca "la sabía"
/ "no la sabía"; las no sabidas alimentan el repaso.

### 4.7 Progreso y persistencia

#### FR-11: Estadísticas locales
Persistencia en localStorage: mejores puntajes de simulacro, aciertos por tema,
cola de errores, total de preguntas practicadas. Visible en el home.

#### FR-12: Tema claro/oscuro y responsive
Dark mode (next-themes) y layout responsive (mobile-first).

## 5. Non-Goals (Explicit)

- Cuentas de usuario o autenticación.
- Backend, base de datos o sincronización entre dispositivos.
- Edición del banco de preguntas desde la UI.
- Otros niveles de licencia u otros idiomas.
- Contenido explicativo/teórico más allá del puntaje por opción.

## 6. MVP Scope

### 6.1 In Scope
Los 4 modos (simulacro, práctica, repaso, flashcards), banco de 371 preguntas,
motor de puntaje multi-respuesta, persistencia local, dark mode, responsive, español.

### 6.2 Out of Scope for MVP
Lo listado en Non-Goals; PWA instalable; export/import de progreso.

## 7. Success Metrics

- 100% de coincidencia entre el puntaje calculado y el esquema oficial.
- El usuario completa un simulacro de 60 sin fricción y recibe veredicto correcto.
- El usuario ve desglose por tema y cola de errores funcional.

## 8. Open Questions

- ¿El examen real penaliza dejar una multi-respuesta incompleta? (v1 asume: suma solo
  lo seleccionado, no penaliza por correctas no marcadas.)
- ¿Conviene escalar 60 preguntas exactamente a 360 puntos, o usar la suma cruda?
  (v1: total objetivo 360 = 60 × 6; se usa la suma cruda acotada a [0, maxScore] por pregunta.)

## 9. Assumptions Index

- A1: Banco fuente = `questions.txt` (FAVL), 371 preguntas, ya parseado a JSON.
- A2: Opción correcta ⇔ `score > 0`. Incorrecta ⇔ `score < 0`.
- A3: Max por pregunta = suma de positivas (`maxScore`). Promedio ≈ 6/pregunta.
- A4: Aprobación examen = ≥270/360.
