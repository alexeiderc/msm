# Sincronizar MSM MY STORE Con GitHub

## Opcion simple

1. Crea un repositorio privado en GitHub.
2. Copia la URL HTTPS del repo.
3. En la carpeta del proyecto, abre `github-first-push.cmd`.
4. Pega la URL cuando lo pida.
5. Si GitHub pide login, inicia sesion con tu navegador o token.

El script hace:

- `git init -b main` si falta repositorio.
- configura nombre/email si faltan;
- `git add .`;
- commit inicial con el mensaje `El comienzo`;
- configura `origin`;
- `git push -u origin main`.

## Importante

No subas:

- `.env.local`;
- claves Supabase;
- claves Resend;
- claves OpenAI;
- claves WhatsApp;
- datos reales de clientes.

`.gitignore` ya excluye esos archivos sensibles.

## Despues

Conecta el repo en Vercel y usa las variables de `docs/vercel-deploy.md`.
