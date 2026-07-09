import type { Section } from '@/lib/types';

export type Locale = 'es' | 'en';

export const LOCALES: Locale[] = ['es', 'en'];
export const DEFAULT_LOCALE: Locale = 'es';

/** Clave heredada: solo se lee una vez para migrar a la cookie. */
export const LANG_STORAGE_KEY = 'paraglide-exam:lang';

/**
 * El idioma viaja en cookie (no en localStorage) para que el servidor pueda
 * leerlo y renderizar los server components ya traducidos.
 */
export const LANG_COOKIE = 'lang';

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'en';
}

export type Vars = Record<string, string | number>;

/** Reemplaza los marcadores {nombre} por sus valores. */
export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

/**
 * Catálogo de mensajes de la UI. Cada clave define ambos idiomas juntos para
 * garantizar paridad (si falta una traducción, no compila).
 * El contenido de las preguntas NO se traduce (material oficial en español).
 */
export const DICT = {
  // Metadata del documento (pestaña del navegador, buscadores)
  'meta.title': {
    es: 'ParaglideExam · Examen Piloto Básico Nivel 3',
    en: 'ParaglideExam · Basic Pilot Level 3 Exam',
  },
  'meta.description': {
    es: 'App de estudio para el examen teórico de licencia de parapente Piloto Básico Nivel 3 (Federación Argentina de Vuelo Libre).',
    en: 'Study app for the Basic Pilot Level 3 paragliding licence theory exam (Argentine Free Flight Federation).',
  },

  // Comunes
  'common.home': { es: 'Inicio', en: 'Home' },
  'common.next': { es: 'Siguiente', en: 'Next' },
  'common.exit': { es: 'Salir', en: 'Exit' },
  'common.goHome': { es: 'Ir al inicio', en: 'Go to home' },
  'common.backHome': { es: 'Volver al inicio', en: 'Back to home' },
  'common.signIn': { es: 'Iniciar sesión', en: 'Sign in' },
  'common.signOut': { es: 'Cerrar sesión', en: 'Sign out' },
  'common.save': { es: 'Guardar', en: 'Save' },
  'common.saving': { es: 'Guardando…', en: 'Saving…' },
  'common.loading': { es: 'Cargando…', en: 'Loading…' },
  'common.namePlaceholder': { es: 'Ej: Juan Pérez', en: 'e.g. Jane Smith' },
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

  // Invitación (pantallas servidas por /exam/[token])
  'inv.defaultTitle': { es: 'Examen', en: 'Exam' },
  'inv.invalid.title': { es: 'Invitación no válida', en: 'Invalid invitation' },
  'inv.invalid.desc': {
    es: 'Este enlace no existe o fue eliminado. Pide una invitación nueva a tu instructor.',
    en: 'This link does not exist or was deleted. Ask your instructor for a new invitation.',
  },
  'inv.used.title': {
    es: 'Este examen ya fue rendido',
    en: 'This exam has already been taken',
  },
  'inv.used.desc': {
    es: 'Cada invitación se puede usar una sola vez. Para repetir, pide una nueva.',
    en: 'Each invitation can be used only once. To retake it, ask for a new one.',
  },
  'inv.expired.title': { es: 'Invitación expirada', en: 'Invitation expired' },
  'inv.expired.desc': {
    es: 'Pide una invitación nueva a tu instructor.',
    en: 'Ask your instructor for a new invitation.',
  },
  'inv.passed': { es: 'Aprobado', en: 'Passed' },
  'inv.failed': { es: 'No aprobado', en: 'Not passed' },

  // Examen del invitado (ExamRunner)
  'xr.empty.title': { es: 'Examen vacío', en: 'Empty exam' },
  'xr.empty.desc': {
    es: 'Este examen no tiene preguntas válidas. Avisa a tu instructor.',
    en: 'This exam has no valid questions. Let your instructor know.',
  },
  'xr.intro.meta': {
    es: '{count} preguntas · aprobás con {pass}/{max}',
    en: '{count} questions · pass with {pass}/{max}',
  },
  'xr.intro.minutes': { es: '{min} min', en: '{min} min' },
  'xr.intro.attemptTitle': {
    es: 'Tienes un solo intento',
    en: 'You have a single attempt',
  },
  'xr.intro.attemptDesc': {
    es: 'Al terminar se guarda y no puedes repetir.',
    en: 'Once you finish it is saved and you cannot retake it.',
  },
  'xr.name.label': { es: 'Nombre y apellido', en: 'Full name' },
  'xr.start': { es: 'Comenzar examen', en: 'Start exam' },
  'xr.exitConfirm': {
    es: '¿Salir del examen? Perderás las respuestas de esta sesión (todavía no se guarda nada).',
    en: 'Leave the exam? You will lose this session’s answers (nothing has been saved yet).',
  },
  'xr.done.passed': { es: '¡Aprobado!', en: 'Passed!' },
  'xr.done.failed': { es: 'No aprobado', en: 'Not passed' },
  'xr.done.sent': {
    es: 'Tu resultado fue enviado a tu instructor.',
    en: 'Your result was sent to your instructor.',
  },
  'xr.submitting': { es: 'Enviando…', en: 'Submitting…' },
  'xr.finish': { es: 'Terminar', en: 'Finish' },
  'xr.confirm.title': { es: '¿Terminar examen?', en: 'Finish exam?' },
  'xr.confirm.desc': {
    es: 'Respondiste {answered} de {total}. No podrás volver a rendir.',
    en: 'You answered {answered} of {total}. You will not be able to retake it.',
  },
  'xr.err.alreadyUsed': {
    es: 'Ya rendiste este examen. Pide una invitación nueva.',
    en: 'You already took this exam. Ask for a new invitation.',
  },
  'xr.err.wrongEmail': {
    es: 'Esta invitación es para otro email.',
    en: 'This invitation is for a different email.',
  },
  'xr.err.notAuth': {
    es: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    en: 'Your session expired. Please sign in again.',
  },
  'xr.err.notFound': {
    es: 'La invitación ya no existe.',
    en: 'The invitation no longer exists.',
  },

  // Cabecera pública
  'header.signOut': { es: 'Salir', en: 'Sign out' },
  'header.access': { es: 'Acceso', en: 'Sign in' },

  // Guardia del área de instructor
  'guard.title': { es: 'No eres instructor', en: 'You are not an instructor' },
  'guard.signedInAs': { es: 'Sesión iniciada como', en: 'Signed in as' },
  'guard.role': { es: 'rol', en: 'role' },
  'guard.needWhitelist': {
    es: 'Tu email debe estar en la lista de instructores para acceder.',
    en: 'Your email must be on the instructor list to get in.',
  },

  // Navegación del instructor
  'nav.dashboard': { es: 'Panel', en: 'Dashboard' },
  'nav.exams': { es: 'Exámenes', en: 'Exams' },
  'nav.invite': { es: 'Invitar', en: 'Invite' },
  'nav.results': { es: 'Resultados', en: 'Results' },
  'nav.instructors': { es: 'Instructores', en: 'Instructors' },
  'nav.users': { es: 'Usuarios', en: 'Users' },
  'nav.account': { es: 'Mi cuenta', en: 'My account' },
  'nav.brandRole': { es: 'Instructor', en: 'Instructor' },
  'nav.openMenu': { es: 'Abrir menú', en: 'Open menu' },
  'nav.closeMenu': { es: 'Cerrar menú', en: 'Close menu' },

  // Panel del instructor
  'dash.hello': { es: 'Hola, {name}', en: 'Hello, {name}' },
  'dash.subtitle': {
    es: 'Panel del instructor. Crea exámenes, invita pilotos y revisa resultados.',
    en: 'Instructor panel. Create exams, invite pilots and review results.',
  },
  'dash.stat.templates': { es: 'Plantillas de examen', en: 'Exam templates' },
  'dash.stat.invites': { es: 'Invitaciones enviadas', en: 'Invitations sent' },
  'dash.stat.attempts': { es: 'Exámenes completados', en: 'Exams completed' },
  'dash.action.create.title': { es: 'Crear un examen', en: 'Create an exam' },
  'dash.action.create.desc': {
    es: 'Elige preguntas del banco y arma una plantilla reutilizable.',
    en: 'Pick questions from the bank and build a reusable template.',
  },
  'dash.action.invite.title': { es: 'Invitar a un piloto', en: 'Invite a pilot' },
  'dash.action.invite.desc': {
    es: 'Envía una invitación por email o WhatsApp para rendir el examen.',
    en: 'Send an invitation by email or WhatsApp to take the exam.',
  },

  // Lista de plantillas
  'tpl.title': { es: 'Exámenes', en: 'Exams' },
  'tpl.subtitle': {
    es: 'Plantillas reutilizables que puedes enviar a tus pilotos.',
    en: 'Reusable templates you can send to your pilots.',
  },
  'tpl.new': { es: 'Nuevo examen', en: 'New exam' },
  'tpl.create': { es: 'Crear examen', en: 'Create exam' },
  'tpl.empty.title': { es: 'Aún no tienes exámenes', en: 'You have no exams yet' },
  'tpl.empty.desc': {
    es: 'Crea tu primera plantilla eligiendo preguntas del banco.',
    en: 'Create your first template by picking questions from the bank.',
  },
  'tpl.passLabel': { es: 'Aprobado: {pass}/{max}', en: 'Pass: {pass}/{max}' },
  'tpl.minutes': { es: '{min} min', en: '{min} min' },
  'tpl.invitePilot': { es: 'Invitar piloto', en: 'Invite pilot' },
  'tpl.edit': { es: 'Editar', en: 'Edit' },

  // Formulario de plantilla
  'tf.title.edit': { es: 'Editar examen', en: 'Edit exam' },
  'tf.title.new': { es: 'Nuevo examen', en: 'New exam' },
  'tf.subtitle': {
    es: 'Ponle un nombre y elige las preguntas del banco.',
    en: 'Give it a name and pick the questions from the bank.',
  },
  'tf.search': { es: 'Buscar pregunta…', en: 'Search question…' },
  'tf.random60': { es: '60 al azar', en: '60 at random' },
  'tf.clear': { es: 'Limpiar', en: 'Clear' },
  'tf.selectAll': { es: 'Seleccionar todas', en: 'Select all' },
  'tf.unselectAll': { es: 'Quitar todas', en: 'Unselect all' },
  'tf.field.title': { es: 'Título', en: 'Title' },
  'tf.field.titlePlaceholder': {
    es: 'Ej: Simulacro Nivel 3',
    en: 'e.g. Level 3 mock exam',
  },
  'tf.field.description': {
    es: 'Descripción (opcional)',
    en: 'Description (optional)',
  },
  'tf.field.passPct': { es: 'Aprobado (%)', en: 'Pass mark (%)' },
  'tf.field.time': { es: 'Tiempo (min)', en: 'Time (min)' },
  'tf.field.timePlaceholder': { es: 'Sin límite', en: 'No limit' },
  'tf.summary.questions': { es: 'Preguntas', en: 'Questions' },
  'tf.summary.maxScore': { es: 'Puntaje máximo', en: 'Max score' },
  'tf.summary.passWith': { es: 'Aprobar con', en: 'Pass with' },
  'tf.saveChanges': { es: 'Guardar cambios', en: 'Save changes' },
  'tf.saveExam': { es: 'Guardar examen', en: 'Save exam' },
  'tf.saveError': { es: 'No se pudo guardar.', en: 'Could not save.' },

  // Invitar pilotos (instructor)
  'invite.title': { es: 'Invitar pilotos', en: 'Invite pilots' },
  'invite.subtitle': {
    es: 'Crea enlaces únicos y compártelos por WhatsApp o email.',
    en: 'Create unique links and share them via WhatsApp or email.',
  },
  'invite.needTemplate.title': {
    es: 'Primero crea un examen',
    en: 'First create an exam',
  },
  'invite.needTemplate.desc': {
    es: 'Necesitas al menos una plantilla para poder invitar pilotos.',
    en: 'You need at least one template before you can invite pilots.',
  },
  'invite.card.title': { es: 'Invitar a un piloto', en: 'Invite a pilot' },
  'invite.card.desc': {
    es: 'Se crea un enlace único. El piloto solo puede rendir una vez; para repetir necesita una invitación nueva.',
    en: 'A unique link is created. The pilot can take it only once; to retake it they need a new invitation.',
  },
  'invite.emailPlaceholder': { es: 'piloto@email.com', en: 'pilot@email.com' },
  'invite.creating': { es: 'Creando…', en: 'Creating…' },
  'invite.create': { es: 'Crear invitación', en: 'Create invitation' },
  'invite.created': {
    es: '✅ Invitación creada. Compártela por WhatsApp o copia el enlace abajo. 👇',
    en: '✅ Invitation created. Share it on WhatsApp or copy the link below. 👇',
  },
  'invite.listTitle': { es: 'Invitaciones ({n})', en: 'Invitations ({n})' },
  'invite.empty': { es: 'Aún no hay invitaciones.', en: 'No invitations yet.' },
  'invite.defaultTemplate': { es: 'el examen', en: 'the exam' },
  'invite.status.pending': { es: 'Pendiente', en: 'Pending' },
  'invite.status.used': { es: 'Completado', en: 'Completed' },
  'invite.status.expired': { es: 'Expirado', en: 'Expired' },
  'invite.copy': { es: 'Copiar', en: 'Copy' },
  'invite.copied': { es: 'Copiado', en: 'Copied' },
  'invite.remove': { es: 'Quitar invitación', en: 'Remove invitation' },
  'invite.removeConfirm': {
    es: '¿Quitar la invitación de {email}?',
    en: 'Remove the invitation for {email}?',
  },
  'invite.error': {
    es: 'No se pudo invitar.',
    en: 'Could not create the invitation.',
  },
  'invite.waMessage': {
    es: '¡Hola! Te invito a rendir "{title}". Entra con este enlace (es solo para ti, {email}): {url}',
    en: 'Hi! I’m inviting you to take "{title}". Use this link (it’s just for you, {email}): {url}',
  },

  // Resultados
  'res.title': { es: 'Resultados', en: 'Results' },
  'res.subtitle': {
    es: 'Notas de los pilotos que ya rindieron.',
    en: 'Scores of the pilots who have already taken the exam.',
  },
  'res.empty.title': { es: 'Aún no hay resultados', en: 'No results yet' },
  'res.empty.desc': {
    es: 'Cuando un piloto termine su examen, su nota aparecerá aquí.',
    en: 'When a pilot finishes their exam, their score will appear here.',
  },
  'res.col.pilot': { es: 'Piloto', en: 'Pilot' },
  'res.col.exam': { es: 'Examen', en: 'Exam' },
  'res.col.score': { es: 'Nota', en: 'Score' },
  'res.col.result': { es: 'Resultado', en: 'Result' },
  'res.col.date': { es: 'Fecha', en: 'Date' },
  'res.detail': { es: 'Ver detalle', en: 'View detail' },
  'res.diploma': { es: 'Diploma', en: 'Diploma' },

  // Detalle de intento
  'rd.back': { es: 'Volver a Resultados', en: 'Back to Results' },
  'rd.correctCount': {
    es: '{correct}/{total} preguntas correctas',
    en: '{correct}/{total} questions correct',
  },
  'rd.noQuestions': {
    es: 'Este intento no tiene preguntas para mostrar.',
    en: 'This attempt has no questions to show.',
  },

  // Estadísticas del intento
  'as.title': { es: 'Desempeño por tema', en: 'Performance by topic' },
  'as.correct': { es: '{n} correctas', en: '{n} correct' },
  'as.wrong': { es: '{n} incorrectas', en: '{n} incorrect' },
  'as.blank': { es: '{n} sin responder', en: '{n} unanswered' },
  'as.hint': {
    es: 'Temas ordenados de más flojo a más fuerte — enfoca el repaso en los primeros.',
    en: 'Topics ordered weakest to strongest — focus your review on the first ones.',
  },
  'as.weak': { es: 'A reforzar', en: 'Needs work' },

  // Lista de preguntas del intento
  'aq.correct': { es: 'Correcta', en: 'Correct' },
  'aq.incorrect': { es: 'Incorrecta', en: 'Incorrect' },
  'aq.blank': { es: 'Sin responder', en: 'Unanswered' },
  'aq.chosen': { es: 'Elegida', en: 'Chosen' },

  // Instructores
  'team.title': { es: 'Instructores', en: 'Instructors' },
  'team.subtitle': {
    es: 'Gestiona quién puede crear exámenes e invitar pilotos.',
    en: 'Manage who can create exams and invite pilots.',
  },
  'team.add.title': { es: 'Agregar un instructor', en: 'Add an instructor' },
  'team.add.desc': {
    es: 'Si ya tiene cuenta, se convierte en instructor al instante. Si no, lo será la primera vez que inicie sesión.',
    en: 'If they already have an account, they become an instructor instantly. If not, they will on their first sign-in.',
  },
  'team.emailPlaceholder': {
    es: 'email@instructor.com',
    en: 'email@instructor.com',
  },
  'team.adding': { es: 'Agregando…', en: 'Adding…' },
  'team.add': { es: 'Agregar instructor', en: 'Add instructor' },
  'team.you': { es: 'Tú', en: 'You' },
  'team.active': { es: 'Activo', en: 'Active' },
  'team.pending': { es: 'Pendiente', en: 'Pending' },
  'team.removeSelf': {
    es: 'No puedes quitarte a ti mismo',
    en: 'You cannot remove yourself',
  },
  'team.remove': { es: 'Quitar instructor', en: 'Remove instructor' },
  'team.addError': { es: 'No se pudo agregar.', en: 'Could not add.' },
  'team.removeError': { es: 'No se pudo quitar.', en: 'Could not remove.' },

  // Usuarios (admin)
  'users.title': { es: 'Usuarios', en: 'Users' },
  'users.subtitle': {
    es: 'Gestiona cuentas: cambia contraseñas o elimina usuarios.',
    en: 'Manage accounts: change passwords or delete users.',
  },
  'users.adminOnly.title': { es: 'Solo para el admin', en: 'Admin only' },
  'users.adminOnly.desc': {
    es: 'Esta sección es únicamente para el administrador de la cuenta.',
    en: 'This section is only for the account administrator.',
  },
  'users.col.email': { es: 'Email', en: 'Email' },
  'users.col.role': { es: 'Rol', en: 'Role' },
  'users.col.password': { es: 'Contraseña', en: 'Password' },
  'users.col.actions': { es: 'Acciones', en: 'Actions' },
  'users.badge.admin': { es: 'Admin', en: 'Admin' },
  // Etiquetas de los roles: la BD guarda 'instructor'/'student' en inglés.
  'users.role.instructor': { es: 'Instructor', en: 'Instructor' },
  'users.role.student': { es: 'Estudiante', en: 'Student' },
  'users.newPassword': { es: 'Nueva contraseña', en: 'New password' },
  'users.deleteConfirm': {
    es: '¿Borrar a {email}? Esto elimina su cuenta y todo lo que creó. No se puede deshacer.',
    en: 'Delete {email}? This removes their account and everything they created. It cannot be undone.',
  },
  'users.delete': { es: 'Borrar usuario', en: 'Delete user' },
  'users.error': { es: 'Error.', en: 'Error.' },

  // Mi cuenta
  'account.title': { es: 'Mi cuenta', en: 'My account' },
  'account.session': { es: 'Sesión', en: 'Session' },
  'account.changePassword': { es: 'Cambiar contraseña', en: 'Change password' },
  'account.changeDesc': {
    es: 'Elige una contraseña nueva (mínimo 6 caracteres).',
    en: 'Choose a new password (at least 6 characters).',
  },
  'account.newPassword': { es: 'Nueva contraseña', en: 'New password' },
  'account.repeatPassword': { es: 'Repetir contraseña', en: 'Repeat password' },
  'account.tooShort': {
    es: 'La contraseña debe tener al menos 6 caracteres.',
    en: 'The password must be at least 6 characters.',
  },
  'account.mismatch': {
    es: 'Las contraseñas no coinciden.',
    en: 'The passwords do not match.',
  },
  'account.updated': { es: 'Contraseña actualizada.', en: 'Password updated.' },
  'account.save': { es: 'Guardar contraseña', en: 'Save password' },

  // Login
  'login.signedIn.title': {
    es: 'Ya iniciaste sesión',
    en: 'You are already signed in',
  },
  'login.signedIn.as': { es: 'Estás conectado como', en: 'You are signed in as' },
  'login.toPanel': {
    es: 'Ir al panel de instructor',
    en: 'Go to the instructor panel',
  },
  'login.createAccount': { es: 'Crear cuenta', en: 'Create account' },
  'login.signupDesc': {
    es: 'Elige una contraseña para tu cuenta.',
    en: 'Choose a password for your account.',
  },
  'login.loginDesc': {
    es: 'Ingresa con tu email y contraseña.',
    en: 'Sign in with your email and password.',
  },
  'login.emailPlaceholder': { es: 'tu@email.com', en: 'you@email.com' },
  'login.passwordPlaceholder': {
    es: 'Contraseña (mín. 6)',
    en: 'Password (min. 6)',
  },
  'login.errorTitle': { es: 'No se pudo continuar', en: 'Could not continue' },
  'login.wait': { es: 'Un momento…', en: 'One moment…' },
  'login.toSignup': {
    es: '¿No tienes cuenta? Crea una',
    en: 'No account? Create one',
  },
  'login.toLogin': {
    es: '¿Ya tienes cuenta? Inicia sesión',
    en: 'Already have an account? Sign in',
  },
  'login.err.credentials': {
    es: 'Email o contraseña incorrectos.',
    en: 'Incorrect email or password.',
  },
  'login.err.registered': {
    es: 'Ese email ya tiene cuenta. Inicia sesión.',
    en: 'That email already has an account. Sign in.',
  },
  'login.err.short': {
    es: 'La contraseña debe tener al menos 6 caracteres.',
    en: 'The password must be at least 6 characters.',
  },
  'login.err.confirmEmail': {
    es: 'Cuenta creada, pero falta desactivar la confirmación por email en Supabase (Auth → Providers → Email → "Confirm email" OFF).',
    en: 'Account created, but email confirmation still needs to be turned off in Supabase (Auth → Providers → Email → "Confirm email" OFF).',
  },

  // Setup inicial
  'setup.title': { es: 'Configuración inicial', en: 'Initial setup' },
  'setup.desc': {
    es: 'Reclama tu rol de instructor. Solo funciona si tu email está en la lista autorizada.',
    en: 'Claim your instructor role. It only works if your email is on the authorized list.',
  },
  'setup.signInFirst': { es: 'Primero inicia sesión.', en: 'Sign in first.' },
  'setup.done': { es: '¡Listo!', en: 'Done!' },
  'setup.nowInstructor': {
    es: 'Ahora eres instructor.',
    en: 'You are now an instructor.',
  },
  'setup.roleAssigned': { es: 'Rol asignado', en: 'Role assigned' },
  'setup.roleDesc': {
    es: 'Tu rol quedó como {role}. Tu email no está en la lista de instructores.',
    en: 'Your role is {role}. Your email is not on the instructor list.',
  },
  'setup.claiming': { es: 'Reclamando…', en: 'Claiming…' },
  'setup.claim': {
    es: 'Reclamar rol de instructor',
    en: 'Claim instructor role',
  },

  // Error de enlace mágico
  'authErr.title': { es: 'El enlace no es válido', en: 'The link is not valid' },
  'authErr.desc': {
    es: 'El enlace mágico expiró o ya fue usado. Solicita uno nuevo para entrar.',
    en: 'The magic link expired or was already used. Request a new one to get in.',
  },
  'authErr.back': { es: 'Volver a iniciar sesión', en: 'Back to sign in' },

  // Diploma
  'dip.notFound': {
    es: 'Diploma no encontrado o sin permiso.',
    en: 'Diploma not found, or you do not have permission.',
  },
  'dip.notPassed': {
    es: 'Este examen no fue aprobado, por lo que no hay diploma.',
    en: 'This exam was not passed, so there is no diploma.',
  },
  'dip.nameLabel': {
    es: 'Nombre y apellido del piloto',
    en: 'Pilot’s full name',
  },
  'dip.print': {
    es: 'Descargar / Imprimir PDF',
    en: 'Download / Print PDF',
  },
  'dip.certificate': {
    es: 'Certificado de Aprobación',
    en: 'Certificate of Achievement',
  },
  'dip.certifies': { es: 'Se certifica que', en: 'This certifies that' },
  'dip.passedExam': {
    es: 'aprobó satisfactoriamente el examen',
    en: 'has successfully passed the exam',
  },
  'dip.scoring': { es: ', obteniendo un puntaje de', en: ', scoring' },
  'dip.outOf': { es: 'sobre {max}', en: 'out of {max}' },
  'dip.date': { es: 'Fecha', en: 'Date' },
  'dip.instructor': { es: 'Instructor', en: 'Instructor' },
  'dip.signature': { es: 'Firma', en: 'Signature' },
  'dip.fallbackPilot': { es: 'Piloto', en: 'Pilot' },
  'dip.fallbackExam': { es: 'de piloto', en: 'pilot exam' },

  // Errores lanzados por los server actions
  'act.unauthorized': { es: 'No autorizado.', en: 'Not authorized.' },
  'act.invalidEmail': { es: 'Email inválido.', en: 'Invalid email.' },
  'act.templateNotFound': {
    es: 'Plantilla no encontrada.',
    en: 'Template not found.',
  },
  'act.titleRequired': {
    es: 'El título es obligatorio.',
    en: 'The title is required.',
  },
  'act.pickQuestion': {
    es: 'Elige al menos una pregunta.',
    en: 'Pick at least one question.',
  },
  'act.cannotRemoveSelf': {
    es: 'No puedes quitarte a ti mismo como instructor.',
    en: 'You cannot remove yourself as an instructor.',
  },
  'act.adminOnly': {
    es: 'Solo el admin puede hacer esto.',
    en: 'Only the admin can do this.',
  },
  'act.passwordTooShort': {
    es: 'La contraseña debe tener al menos 6 caracteres.',
    en: 'The password must be at least 6 characters.',
  },
  'act.userNotFound': { es: 'Usuario no encontrado.', en: 'User not found.' },
  'act.cannotDeleteSelf': {
    es: 'No puedes borrarte a ti mismo.',
    en: 'You cannot delete yourself.',
  },
} as const;

/** Locale para formatear fechas con toLocaleDateString. */
export const DATE_LOCALE: Record<Locale, string> = {
  es: 'es-AR',
  en: 'en-US',
};

export type MessageKey = keyof typeof DICT;

/** Etiquetas de los temas para mostrar (el valor interno queda en español). */
export const SECTION_LABELS: Record<Section, Record<Locale, string>> = {
  Meteorología: { es: 'Meteorología', en: 'Meteorology' },
  Aerodinámica: { es: 'Aerodinámica', en: 'Aerodynamics' },
  Material: { es: 'Material', en: 'Equipment' },
  Reglamentación: { es: 'Reglamentación', en: 'Regulations' },
  'Técnica de vuelo': { es: 'Técnica de vuelo', en: 'Flight technique' },
};
