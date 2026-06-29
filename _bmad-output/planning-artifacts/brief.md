---
title: "Product Brief: ParaglideExam"
status: draft
created: 2026-06-25
updated: 2026-06-25
author: Alex
module: bmm
---

# Product Brief: ParaglideExam

## Executive Summary

ParaglideExam es una aplicación web de estudio para aprobar el examen teórico de
licencia de parapente **Piloto Básico - Nivel 3** de la Federación Argentina de
Vuelo Libre (FAVL). El examen real toma 60 preguntas al azar de un banco de 371,
distribuidas en cinco temas (Meteorología, Aerodinámica, Material, Reglamentación
y Técnica de vuelo), y se aprueba con 270 de 360 puntos (75%).

Hoy el aspirante estudia sobre un archivo de texto plano, difícil de leer, sin
forma de practicar bajo condiciones de examen ni de saber en qué temas falla. La
app convierte ese banco de preguntas en una experiencia de estudio interactiva:
simulacros cronometrados con el puntaje real, práctica por tema con feedback
inmediato, repaso dirigido de los errores y flashcards para memorizar. Todo corre
en el navegador, sin backend ni cuentas, usando los componentes de UIPulse.

Importa ahora porque el examen es la barrera concreta entre el aspirante y volar
legalmente; reducir el tiempo de preparación y la incertidumbre tiene valor
inmediato y medible (aprobar a la primera).

## The Problem

El material oficial es un `.txt` con 371 preguntas y un esquema de puntaje por
opción (las correctas suman, las incorrectas restan 6). Estudiarlo así tiene
varios costos:

- **Ilegible y sin estructura**: venía con encoding DOS roto; no hay navegación,
  ni separación clara por tema, ni forma de ocultar las respuestas.
- **No se puede simular el examen**: el examen real es de 60 preguntas al azar,
  cronometrado, con un umbral de 270/360. Leer el txt no entrena esa situación.
- **Puntaje no trivial**: muchas preguntas tienen **varias respuestas correctas**
  con puntajes distintos; calcular el resultado a mano es tedioso y propenso a error.
- **Sin diagnóstico**: el aspirante no sabe en qué tema está flojo ni qué
  preguntas falla repetidamente, así que estudia a ciegas.

## The Solution

Una app web que carga el banco de preguntas ya estructurado y ofrece cuatro modos:

1. **Simulacro de examen** — 60 preguntas al azar, cronómetro, puntaje real y
   veredicto aprobado/desaprobado contra el umbral de 270/360.
2. **Práctica por tema** — filtrar por uno o varios temas, con feedback inmediato
   y explicación del puntaje de cada opción.
3. **Repaso de errores** — las preguntas falladas se guardan y se vuelven a
   preguntar (repetición espaciada) hasta dominarlas.
4. **Flashcards** — tarjetas pregunta/respuesta para memorización rápida.

El progreso (errores, estadísticas por tema, mejores puntajes) se guarda localmente
en el navegador. Sin login, sin servidor: se abre y funciona.

## What Makes This Different

No compite con un producto existente; reemplaza un `.txt`. La ventaja es el ajuste
exacto al examen real de la FAVL: mismo banco, mismo esquema de puntaje
multi-respuesta, mismo umbral. El simulacro replica las condiciones reales en lugar
de un quiz genérico. La ejecución es la ventaja: rápido de usar, offline-first,
diseñado sobre un sistema de componentes propio (UIPulse).

## Who This Serves

- **Usuario primario**: el aspirante a Piloto Básico Nivel 3 que tiene fecha de
  examen y quiere llegar preparado, midiendo su progreso. Necesita confianza de que
  va a aprobar y saber dónde reforzar.
- **Secundario**: instructores/escuelas que quieran recomendar una herramienta de
  repaso a sus alumnos.

## Success Criteria

- El usuario puede completar un simulacro de 60 preguntas y recibe su puntaje real
  y veredicto sin intervención manual.
- El puntaje calculado coincide exactamente con el esquema oficial (suma de
  positivas seleccionadas, penalización de incorrectas).
- El usuario ve su rendimiento por tema y la lista de preguntas que más falla.
- Señal de producto: el usuario alcanza ≥270/360 de forma consistente en
  simulacros antes de rendir.

## Scope

**Dentro (v1):** los 4 modos de estudio, banco de 371 preguntas en 5 temas,
puntaje multi-respuesta, persistencia local (errores + estadísticas), dark mode,
responsive, español.

**Fuera (v1):** cuentas de usuario, backend/sync entre dispositivos, edición del
banco de preguntas desde la UI, otros niveles de licencia, multiidioma,
explicaciones didácticas más allá del puntaje por opción.

## Vision

Convertirse en la herramienta de referencia para preparar exámenes de vuelo libre
en Argentina: agregar los demás niveles de licencia, estadísticas más ricas,
modo offline instalable (PWA) y, eventualmente, contenido explicativo por tema.
