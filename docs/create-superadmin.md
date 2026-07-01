# Crear Primer Superadmin

## Opcion Recomendada

1. Crear cuenta desde `/auth/signup`.
2. Confirmar que el usuario existe en Supabase Auth.
3. Ejecutar:

```bash
pnpm create-superadmin -- --email=correo@dominio.com --name="Miguel Soria" --phone="+1..."
```

El script busca el usuario en Supabase Auth y actualiza `profiles.role = superadmin`.

## Con User ID

```bash
pnpm create-superadmin -- --user-id=UUID --email=correo@dominio.com --name="Miguel Soria"
```

## Requisitos

`.env.local` debe tener:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Verificacion

Despues de ejecutar:

1. Iniciar sesion.
2. Abrir `/dashboard/admin`.
3. Abrir `/dashboard/admin/users`.
4. Abrir `/dashboard/don-miguel`.

No subas `.env.local` a GitHub.
