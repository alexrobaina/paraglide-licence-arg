export type Section =
  | 'Meteorología'
  | 'Aerodinámica'
  | 'Material'
  | 'Reglamentación'
  | 'Técnica de vuelo';

export interface Option {
  letter: string;
  text: string;
  score: number;
  correct: boolean;
}

export interface Question {
  uid: string; // clave global única (el banco repite `id` entre temas)
  id: string; // número original para mostrar
  section: Section;
  question: string;
  options: Option[];
  multi: boolean;
  maxScore: number;
}

/** Resultado de calificar una sola pregunta. */
export interface QuestionResult {
  questionId: string;
  selected: string[]; // letras elegidas
  score: number; // puntaje obtenido (acotado a [0, maxScore])
  maxScore: number;
  perfect: boolean; // eligió exactamente las correctas
}

/** Resultado completo de un simulacro. */
export interface ExamResult {
  total: number; // suma de puntajes (0..360)
  maxTotal: number; // 360
  passed: boolean;
  passMark: number; // 270
  correctCount: number; // preguntas perfectas
  questionCount: number; // 60
  elapsedMs: number;
  perSection: Record<string, { correct: number; total: number; score: number }>;
  details: Array<QuestionResult & { question: Question }>;
}

export interface SectionProgress {
  correct: number;
  answered: number;
}

export interface Progress {
  bestExamScore: number | null;
  examsTaken: number;
  questionsAnswered: number;
  perSection: Record<string, SectionProgress>;
  wrongQueue: Record<string, number>; // questionId -> fallos pendientes
  knownFlashcards: string[];
}
