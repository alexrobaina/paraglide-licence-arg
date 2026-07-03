import { ShieldCheck, Clock } from 'lucide-react';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { AddInstructorForm, RemoveInstructorButton } from './ui';

interface InstructorRow {
  email: string;
  signed_up: boolean;
  full_name: string | null;
}

export default async function TeamPage() {
  const me = await getCurrentProfile();
  const supabase = await createClient();

  const { data } = await supabase.rpc('list_instructors');
  const list = (data as InstructorRow[]) ?? [];

  const rows = list.map((r) => ({
    ...r,
    isMe: me?.email.toLowerCase() === r.email.toLowerCase(),
  }));

  return (
    <>
      <PageHeader />

      <Card variant="modern" size="lg" className="mt-4">
        <CardTitle size="sm">Agregar un instructor</CardTitle>
        <CardDescription className="mb-3 mt-1">
          Si ya tiene cuenta, se convierte en instructor al instante. Si no, lo será
          la primera vez que inicie sesión.
        </CardDescription>
        <AddInstructorForm />
      </Card>

      <div className="mt-4 flex flex-col gap-2">
        {rows.map((r) => (
          <Card key={r.email} variant="default" size="md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </span>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {r.full_name ?? r.email}
                    {r.isMe && <Badge variant="primary">Tú</Badge>}
                  </div>
                  {r.full_name && (
                    <div className="text-xs text-neutral-500">{r.email}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {r.signed_up ? (
                  <Badge variant="success">Activo</Badge>
                ) : (
                  <Badge variant="default">
                    <Clock className="mr-1 h-3 w-3" />
                    Pendiente
                  </Badge>
                )}
                <RemoveInstructorButton email={r.email} disabled={r.isMe} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Instructores</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        Gestiona quién puede crear exámenes e invitar pilotos.
      </p>
    </div>
  );
}
