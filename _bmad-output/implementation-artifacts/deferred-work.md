# Deferred Work

## Nueva historia: snapshot calificado del intento (robustez de re-calificación)

Origen: code review de spec-instructor-attempt-detail (2026-07-09), decision-needed resuelta como "robustez completa".

**Problema:** el detalle del intento re-califica contra el banco de preguntas vivo (`QUESTIONS_BY_ID`) porque `attempts.answers` solo guarda las letras elegidas. Si el banco cambia (correct/score/uid) después de un envío, la lista itemizada puede contradecir la nota/passed congelados del header, descartar preguntas huérfanas y ocultar letras obsoletas.

**Fix acordado:** guardar una "foto" calificada por pregunta al momento de enviar el examen.
- Esquema: nueva columna/tabla para el snapshot por pregunta (uid, letras correctas, score obtenido, maxScore, enunciado/opciones o al menos las flags necesarias).
- RPC `submit_exam_attempt`: persistir el snapshot junto con score/answers.
- `ExamRunner.tsx`: componer el snapshot en `finish()`.
- `instructor/results/[id]/page.tsx`: leer del snapshot en vez de re-calificar contra el banco vivo (fallback al banco solo si el snapshot no existe, para intentos previos).
- Migración de datos: intentos existentes no tienen snapshot → mantener el re-cálculo actual como fallback.

## Deferred from: code review of spec-instructor-attempt-detail (2026-07-09)

- Denominador del header `/{max_score}` (360) vs suma de `maxScore` por pregunta en templates no estándar — `src/app/instructor/results/[id]/page.tsx:125`. El score por pregunta sí coincide con `attempts.score`; solo el denominador máximo puede diverger para templates que no sumen 360 (p. ej. 40 preguntas → 240 real vs "/360" mostrado). El máximo oficial almacenado es intencional (consistente con el diploma). Revisar solo si se usan templates de longitud personalizada.
