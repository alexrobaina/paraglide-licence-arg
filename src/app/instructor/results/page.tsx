import Link from 'next/link';
import { Award, Inbox } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface AttemptRow {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  template: { title: string } | null;
  student: { email: string; full_name: string | null } | null;
}

export default async function ResultsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('attempts')
    .select(
      `id, score, max_score, passed, finished_at,
       template:exam_templates(title),
       student:profiles(email, full_name)`
    )
    .order('finished_at', { ascending: false });

  const rows = (data as unknown as AttemptRow[]) ?? [];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Resultados</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Notas de los pilotos que ya rindieron.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card variant="modern" size="lg" className="text-center">
          <Inbox className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <CardTitle size="md" className="mt-3">
            Aún no hay resultados
          </CardTitle>
          <CardDescription className="mt-1">
            Cuando un piloto termine su examen, su nota aparecerá aquí.
          </CardDescription>
        </Card>
      ) : (
        <Card variant="default" size="md" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">Piloto</th>
                <th className="py-2 pr-4 font-medium">Examen</th>
                <th className="py-2 pr-4 font-medium">Nota</th>
                <th className="py-2 pr-4 font-medium">Resultado</th>
                <th className="py-2 pr-4 font-medium">Fecha</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                >
                  <td className="py-3 pr-4 font-medium">
                    {r.student?.full_name ?? r.student?.email ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-400">
                    {r.template?.title ?? '—'}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    {r.score}/{r.max_score}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={r.passed ? 'success' : 'error'}>
                      {r.passed ? 'Aprobado' : 'No aprobado'}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-neutral-500">
                    {new Date(r.finished_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="py-3">
                    {r.passed && (
                      <Link href={`/diploma/${r.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Award className="h-4 w-4" />
                          Diploma
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
