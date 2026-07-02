import type { Section } from '@/lib/types';

export type Locale = 'es' | 'en';

export const LOCALES: Locale[] = ['es', 'en'];
export const DEFAULT_LOCALE: Locale = 'es';
export const LANG_STORAGE_KEY = 'paraglide-exam:lang';

/**
 * Catálogo de mensajes de la UI. Cada clave define ambos idiomas juntos para
 * garantizar paridad (si falta una traducción, no compila).
 * El contenido de las preguntas NO se traduce (material oficial en español).
 */
export const DICT = {
  // Comunes
  'common.home': { es: 'Inicio', en: 'Home' },
  'common.next': { es: 'Siguiente', en: 'Next' },
  'common.exit': { es: 'Salir', en: 'Exit' },
  'ps.exitConfirm': {
    es: '¿Salir de la práctica? Perderás el progreso de esta sesión.',
    en: 'Exit practice? You will lose this session’s progress.',
  },

  // Header
  'header.themeToggle': { es: 'Cambiar tema', en: 'Toggle theme' },
  'header.langToggle': { es: 'Cambiar idioma', en: 'Change language' },

  // Home
  'home.org': {
    es: 'Federación Argentina de Vuelo Libre',
    en: 'Argentine Free Flight Federation',
  },
  'home.title.pre': {
    es: 'Examen teórico · Piloto Básico ',
    en: 'Theory exam · Basic Pilot ',
  },
  'home.title.level': { es: 'Nivel 3', en: 'Level 3' },
  'home.subtitle': {
    es: 'Preparate con {count} preguntas oficiales en 5 temas. Simulá el examen real, practicá por tema, repasá tus errores y memorizá con flashcards.',
    en: 'Prepare with {count} official questions across 5 topics. Simulate the real exam, practice by topic, review your mistakes and memorize with flashcards.',
  },
  'home.stat.best': { es: 'Mejor simulacro', en: 'Best mock exam' },
  'home.stat.best.empty': { es: 'Sin intentos', en: 'No attempts' },
  'home.stat.exams': { es: 'Simulacros', en: 'Mock exams' },
  'home.stat.exams.sub': { es: 'completados', en: 'completed' },
  'home.stat.practiced': { es: 'Practicadas', en: 'Practiced' },
  'home.stat.practiced.sub': { es: 'respuestas', en: 'answers' },
  'home.stat.review': { es: 'Para repasar', en: 'To review' },
  'home.stat.review.sub': { es: 'preguntas', en: 'questions' },
  'home.mastery': { es: 'Tu dominio por tema', en: 'Your mastery by topic' },
  'home.section.questions': { es: '{count} preguntas', en: '{count} questions' },

  // Modos
  'mode.exam.title': { es: 'Simulacro de examen', en: 'Mock exam' },
  'mode.exam.desc': {
    es: '{count} preguntas al azar, cronómetro y puntaje real. Aprobás con {pass}/{max}.',
    en: '{count} random questions, timer and real score. Pass with {pass}/{max}.',
  },
  'mode.practice.title': { es: 'Práctica por tema', en: 'Practice by topic' },
  'mode.practice.desc': {
    es: 'Elegí uno o varios temas y practicá con feedback inmediato.',
    en: 'Pick one or more topics and practice with instant feedback.',
  },
  'mode.review.title': { es: 'Repaso de errores', en: 'Mistake review' },
  'mode.review.desc': {
    es: 'Volvé a las preguntas que fallaste hasta dominarlas.',
    en: 'Revisit the questions you missed until you master them.',
  },
  'mode.flashcards.title': { es: 'Flashcards', en: 'Flashcards' },
  'mode.flashcards.desc': {
    es: 'Tarjetas pregunta/respuesta para memorizar rápido.',
    en: 'Question/answer cards for fast memorization.',
  },

  // QuestionCard
  'q.counter': { es: 'Pregunta {index} / {total}', en: 'Question {index} / {total}' },
  'q.multi': { es: 'Múltiple · {n} correctas', en: 'Multiple · {n} correct' },
  'q.single': { es: 'Una correcta', en: 'One correct' },

  // Resultados del examen
  'result.passed': { es: 'APROBADO', en: 'PASSED' },
  'result.failed': { es: 'DESAPROBADO', en: 'FAILED' },
  'result.needPass': {
    es: '{pct}% · Necesitás {pass} para aprobar',
    en: '{pct}% · You need {pass} to pass',
  },
  'result.perfect': { es: '{n} perfectas', en: '{n} perfect' },
  'result.withError': { es: '{n} con error', en: '{n} with errors' },
  'result.breakdown': { es: 'Desglose por tema', en: 'Breakdown by topic' },
  'result.newExam': { es: 'Nuevo simulacro', en: 'New mock exam' },
  'result.showReview': { es: 'Revisar respuestas', en: 'Review answers' },
  'result.hideReview': { es: 'Ocultar respuestas', en: 'Hide answers' },

  // Examen
  'exam.intro.desc': {
    es: '{count} preguntas al azar de todos los temas. Tenés cronómetro y podés navegar entre preguntas. Aprobás con {pass}/{max} puntos (75%).',
    en: '{count} random questions from all topics. You get a timer and can navigate between questions. Pass with {pass}/{max} points (75%).',
  },
  'exam.intro.warn': {
    es: 'Ojo: muchas preguntas tienen más de una respuesta correcta. Sumás los puntos de las opciones correctas que marques.',
    en: 'Note: many questions have more than one correct answer. You add up the points of the correct options you select.',
  },
  'exam.intro.start': { es: 'Comenzar simulacro', en: 'Start mock exam' },
  'exam.prev': { es: 'Anterior', en: 'Previous' },
  'exam.finish': { es: 'Finalizar', en: 'Finish' },
  'exam.finishView': {
    es: 'Finalizar y ver resultado',
    en: 'Finish and see result',
  },
  'exam.confirm.title': { es: '¿Finalizar simulacro?', en: 'Finish mock exam?' },
  'exam.confirm.desc': {
    es: 'Respondiste {answered} de {total}. Las no respondidas cuentan como 0.',
    en: 'You answered {answered} of {total}. Unanswered count as 0.',
  },
  'exam.confirm.keep': { es: 'Seguir', en: 'Keep going' },

  // Sesión de práctica
  'ps.completed': { es: '¡Sesión completada!', en: 'Session complete!' },
  'ps.accuracy': { es: '{pct}% de aciertos', en: '{pct}% correct' },
  'ps.another': { es: 'Otra ronda', en: 'Another round' },
  'ps.correct': { es: '¡Correcto! +{score} puntos.', en: 'Correct! +{score} points.' },
  'ps.partial': {
    es: 'Obtuviste {score}/{max}. Revisá las opciones correctas (en verde).',
    en: 'You got {score}/{max}. Check the correct options (in green).',
  },
  'ps.check': { es: 'Comprobar', en: 'Check' },
  'ps.seeResult': { es: 'Ver resultado', en: 'See result' },

  // Práctica
  'practica.desc': {
    es: 'Elegí los temas (o ninguno = todos). Feedback inmediato.',
    en: 'Pick topics (or none = all). Instant feedback.',
  },
  'practica.start': { es: 'Practicar {n} preguntas', en: 'Practice {n} questions' },
  'practica.allTopics': { es: 'Todos los temas', en: 'All topics' },
  'practica.someTopics': { es: '{n} tema(s)', en: '{n} topic(s)' },
  'practica.available': { es: '{n} disponibles', en: '{n} available' },

  // Repaso
  'repaso.desc': {
    es: 'Las preguntas que fallás aparecen acá hasta que las domines.',
    en: 'The questions you miss appear here until you master them.',
  },
  'repaso.emptyTitle': {
    es: '¡No tenés errores pendientes!',
    en: 'No pending mistakes!',
  },
  'repaso.emptyDesc': {
    es: 'Practicá o hacé un simulacro: las preguntas que falles se guardarán acá para repasarlas.',
    en: 'Practice or take a mock exam: the questions you miss will be saved here to review.',
  },
  'repaso.goPractice': { es: 'Ir a practicar', en: 'Go practice' },
  'repaso.count': { es: 'preguntas para repasar', en: 'questions to review' },
  'repaso.reviewAll': { es: 'Repasar las {n}', en: 'Review all {n}' },

  // Flashcards
  'fc.desc': {
    es: 'Volteá la tarjeta y marcá si la sabías. Memorización rápida.',
    en: 'Flip the card and mark whether you knew it. Fast memorization.',
  },
  'fc.start': { es: 'Empezar mazo de {n}', en: 'Start deck of {n}' },
  'fc.deckDone': { es: '¡Mazo terminado!', en: 'Deck finished!' },
  'fc.knewCount': { es: 'Sabías {known} de {total}.', en: 'You knew {known} of {total}.' },
  'fc.another': { es: 'Otro mazo', en: 'Another deck' },
  'fc.tapToSee': {
    es: 'Tocá para ver la respuesta',
    en: 'Tap to see the answer',
  },
  'fc.knew': { es: 'La sabía', en: 'I knew it' },
  'fc.didntKnow': { es: 'No la sabía', en: "I didn't" },
} as const;

export type MessageKey = keyof typeof DICT;

/** Etiquetas de los temas para mostrar (el valor interno queda en español). */
export const SECTION_LABELS: Record<Section, Record<Locale, string>> = {
  Meteorología: { es: 'Meteorología', en: 'Meteorology' },
  Aerodinámica: { es: 'Aerodinámica', en: 'Aerodynamics' },
  Material: { es: 'Material', en: 'Equipment' },
  Reglamentación: { es: 'Reglamentación', en: 'Regulations' },
  'Técnica de vuelo': { es: 'Técnica de vuelo', en: 'Flight technique' },
};
