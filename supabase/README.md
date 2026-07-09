# Base de datos (Supabase)

El esquema vive en **migraciones versionadas** dentro de `supabase/migrations/`.
Nunca se edita una migración ya aplicada: cada cambio es un archivo nuevo.

> ⚠️ **Regla de oro:** cada vez que cambias algo del schema o agregas una migración,
> hay que **aplicarla a la base**. Si no, el código en producción llama funciones/columnas
> que no existen todavía → errores tipo _"Could not find the function ... in the schema cache"_.

---

## Aplicar migraciones (a producción)

```bash
# 1. Exporta las credenciales (solo la primera vez en cada terminal)
export SUPABASE_ACCESS_TOKEN="sbp_..."   # https://supabase.com/dashboard/account/tokens
export SUPABASE_DB_PASSWORD="..."         # Settings → Database → Database password

# 2. (Solo la primera vez) enlaza el proyecto
npx supabase link --project-ref nbfnoivdsxtnznvxcxpx

# 3. Aplica TODAS las migraciones pendientes
npx supabase db push
```

`db push` aplica en orden todos los archivos de `supabase/migrations/` que aún no
estén registrados en la base. Es seguro correrlo varias veces.

---

## Crear una migración nueva

```bash
# 1. Crea el archivo
npx supabase migration new nombre_del_cambio

# 2. Edita el .sql que aparece en supabase/migrations/
#    Usa formas idempotentes cuando puedas:
#      create table if not exists ...
#      create or replace function ...
#      drop policy if exists ...; create policy ...

# 3. Aplícala
npx supabase db push
```

Después: **commit del archivo `.sql`** junto con el código que lo usa.

---

## Auto-deploy (GitHub Action)

`.github/workflows/supabase-migrations.yml` aplica las migraciones **automáticamente**
en cada push a `main` que toque `supabase/migrations/**`.

Requiere estos **secrets** en GitHub (repo → Settings → Secrets and variables → Actions):

| Secret | De dónde |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Account → Access Tokens (`sbp_...`) |
| `SUPABASE_PROJECT_REF` | `nbfnoivdsxtnznvxcxpx` |
| `SUPABASE_DB_PASSWORD` | Settings → Database → Database password |

Con esto, olvidarse de aplicar migraciones deja de ser un problema. ✅

---

## Notas

- **`project ref`:** `nbfnoivdsxtnznvxcxpx`
- El schema completo (roles, invitaciones, exámenes, intentos, RPCs) está en las
  migraciones. La primera (`*_init.sql`) es idempotente y sirve para levantar una base
  desde cero.
- Los pilotos rinden **anónimos** (sin login); los instructores usan **email + contraseña**.
  Por eso muchas operaciones sensibles son funciones `SECURITY DEFINER` (RPC) y **no**
  dependen de la service-role key.
