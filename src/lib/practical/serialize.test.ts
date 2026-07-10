import { describe, expect, it } from 'vitest';
import { emptySections } from './form';
import { inputToRow, rowToInput } from './serialize';
import type { PracticalExamRow } from './serialize';

const STUDENT_ID = '3f1c2f4e-9a1b-4c1d-8e2f-0a1b2c3d4e5f';

function input() {
  return {
    student_id: STUDENT_ID,
    attempt_id: null,
    license_level: 'N3' as const,
    license_type: 'Piloto Básico Nivel 3',
    exam_date: '2025-05-28',
    place: 'Cuchi Corral',
    club: 'Club Andino',
    instructor_name: 'Ana Pérez',
    examiner_name: 'Luis Gómez',
    previously_taken: 'SI' as const,
    weather: {
      wind_deg: 270, cloud_base_ft: 4500, precipitation: false,
      temperature_c: 18.5, start_time: '09:30', end_time: '11:05',
    },
    sections: emptySections(),
    result_declared: true,
    result_observations: '',
    sworn: true,
  };
}

describe('inputToRow', () => {
  it('flattens weather into flat columns', () => {
    const row = inputToRow(input());
    expect(row.wind_deg).toBe(270);
    expect(row.cloud_base_ft).toBe(4500);
    expect(row.precipitation).toBe(false);
    expect(row.temperature_c).toBe(18.5);
    expect(row.start_time).toBe('09:30');
    expect(row.end_time).toBe('11:05');
    expect('weather' in row).toBe(false);
  });

  it('turns a blank time into a null column, never an empty string', () => {
    const i = input();
    i.weather.start_time = '';
    i.weather.end_time = '';
    const row = inputToRow(i);
    expect(row.start_time).toBeNull();
    expect(row.end_time).toBeNull();
  });

  it('never writes the computed result — that is the DB/action job', () => {
    expect('result_computed' in inputToRow(input())).toBe(false);
  });
});

describe('rowToInput', () => {
  it('is the inverse of inputToRow', () => {
    const original = input();
    const round = rowToInput(inputToRow(original) as PracticalExamRow);
    expect(round.weather).toEqual(original.weather);
    expect(round.student_id).toBe(original.student_id);
    expect(round.sections).toEqual(original.sections);
    expect(round.previously_taken).toBe('SI');
  });

  it('turns null time columns back into empty strings for the form', () => {
    const row = { ...inputToRow(input()), start_time: null, end_time: null } as PracticalExamRow;
    const back = rowToInput(row);
    expect(back.weather.start_time).toBe('');
    expect(back.weather.end_time).toBe('');
  });

  it('backfills sections a stored older exam may be missing', () => {
    const row = { ...inputToRow(input()), sections: {} } as PracticalExamRow;
    const back = rowToInput(row);
    expect(Object.keys(back.sections).sort()).toEqual(Object.keys(emptySections()).sort());
  });
});
