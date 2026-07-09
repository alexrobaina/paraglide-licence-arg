import { ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ResetPasswordButton, DeleteUserButton } from './ui';

interface UserRow {
  email: string;
  role: string;
  has_password: boolean;
  is_admin: boolean;
  exams_created: number;
  last_sign_in_at: string | null;
  created_at: string;
}

export default async function UsersPage() {
  const { t } = await getT();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_list_users');

  // Non-admins get 'not_authorized' from the RPC.
  if (error) {
    return (
      <Card variant="modern" size="lg" className="text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
        <CardTitle size="md" className="mt-3">
          {t('users.adminOnly.title')}
        </CardTitle>
        <CardDescription className="mt-1">
          {t('users.adminOnly.desc')}
        </CardDescription>
      </Card>
    );
  }

  const users = (data as UserRow[]) ?? [];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('users.title')}</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          {t('users.subtitle')}
        </p>
      </div>

      <Card variant="default" size="md" className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
              <th className="py-2 pr-4 font-medium">{t('users.col.email')}</th>
              <th className="py-2 pr-4 font-medium">{t('users.col.role')}</th>
              <th className="py-2 pr-4 font-medium">{t('users.col.password')}</th>
              <th className="py-2 pr-4 font-medium">{t('users.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60">
                <td className="py-3 pr-4 font-medium">
                  {u.email}
                  {u.is_admin && (
                    <Badge variant="primary" className="ml-2">
                      {t('users.badge.admin')}
                    </Badge>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={u.role === 'instructor' ? 'success' : 'default'}>
                    {t(
                      u.role === 'instructor'
                        ? 'users.role.instructor'
                        : 'users.role.student'
                    )}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  {u.has_password ? (
                    <span className="text-emerald-600">✓</span>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1">
                    <ResetPasswordButton email={u.email} />
                    {!u.is_admin && <DeleteUserButton email={u.email} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
