'use client';

import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEY } from './constants';
import type { Progress, Section } from './types';

export const EMPTY_PROGRESS: Progress = {
  bestExamScore: null,
  examsTaken: 0,
  questionsAnswered: 0,
  perSection: {},
  wrongQueue: {},
  knownFlashcards: [],
};

function read(): Progress {
  if (typeof window === 'undefined') return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    return { ...EMPTY_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function write(p: Progress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* almacenamiento lleno o bloqueado: ignorar */
  }
}

/**
 * Hook de progreso persistido en localStorage.
 * `ready` evita parpadeos de hidratación: el estado real se lee tras montar.
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(read());
    setReady(true);
  }, []);

  const update = useCallback((fn: (prev: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  /** Registra el resultado de una pregunta (práctica/repaso/flashcards). */
  const recordAnswer = useCallback(
    (questionId: string, section: Section, perfect: boolean) => {
      update((prev) => {
        const sec = prev.perSection[section] ?? { correct: 0, answered: 0 };
        const wrongQueue = { ...prev.wrongQueue };
        if (perfect) {
          if (wrongQueue[questionId]) {
            wrongQueue[questionId] -= 1;
            if (wrongQueue[questionId] <= 0) delete wrongQueue[questionId];
          }
        } else {
          wrongQueue[questionId] = Math.min((wrongQueue[questionId] ?? 0) + 1, 5);
        }
        return {
          ...prev,
          questionsAnswered: prev.questionsAnswered + 1,
          perSection: {
            ...prev.perSection,
            [section]: {
              correct: sec.correct + (perfect ? 1 : 0),
              answered: sec.answered + 1,
            },
          },
          wrongQueue,
        };
      });
    },
    [update]
  );

  const recordExam = useCallback(
    (
      total: number,
      perSectionPerfect: Array<{ section: Section; perfect: boolean; id: string }>
    ) => {
      update((prev) => {
        const perSection = { ...prev.perSection };
        const wrongQueue = { ...prev.wrongQueue };
        for (const { section, perfect, id } of perSectionPerfect) {
          const sec = perSection[section] ?? { correct: 0, answered: 0 };
          perSection[section] = {
            correct: sec.correct + (perfect ? 1 : 0),
            answered: sec.answered + 1,
          };
          if (!perfect) {
            wrongQueue[id] = Math.min((wrongQueue[id] ?? 0) + 1, 5);
          }
        }
        return {
          ...prev,
          examsTaken: prev.examsTaken + 1,
          bestExamScore:
            prev.bestExamScore == null
              ? total
              : Math.max(prev.bestExamScore, total),
          questionsAnswered: prev.questionsAnswered + perSectionPerfect.length,
          perSection,
          wrongQueue,
        };
      });
    },
    [update]
  );

  const markFlashcard = useCallback(
    (questionId: string, known: boolean) => {
      update((prev) => {
        const knownSet = new Set(prev.knownFlashcards);
        const wrongQueue = { ...prev.wrongQueue };
        if (known) {
          knownSet.add(questionId);
          if (wrongQueue[questionId]) delete wrongQueue[questionId];
        } else {
          knownSet.delete(questionId);
          wrongQueue[questionId] = Math.min((wrongQueue[questionId] ?? 0) + 1, 5);
        }
        return {
          ...prev,
          knownFlashcards: [...knownSet],
          wrongQueue,
        };
      });
    },
    [update]
  );

  const reset = useCallback(() => update(() => EMPTY_PROGRESS), [update]);

  return {
    progress,
    ready,
    recordAnswer,
    recordExam,
    markFlashcard,
    reset,
  };
}
