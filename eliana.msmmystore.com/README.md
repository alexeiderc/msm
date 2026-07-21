# YO SOY ELIANA

ELIANA es la incubadora de ideas, procesos y proyectos del universo ZAFIRO y MSM my store. Es un servicio Node.js independiente, preparado para usar `eliana.msmmystore.com`.

## Lo que funciona

- Landing cosmica responsive, creada en CSS sin imagen plana.
- Chat con cinco mensajes gratuitos y modal de activacion.
- Groq para el plan Gratis.
- Groq, Gemini y fusion ELIANA para los planes activados.
- Membresias y conversaciones persistentes cuando Supabase esta configurado.
- Widget embebible en ZAFIRO o MSM MY STORE.
- Limite basico por direccion de red, CORS permitido y protecciones de cabecera.

## Ejecutar localmente

```bash
npm install
copy .env.example .env
npm run dev
```

Abre `http://localhost:369`.

## Produccion

1. Crea las claves de Groq y Gemini en sus consolas oficiales.
2. Ejecuta `supabase.sql` en Supabase.
3. Configura las variables de `.env.example` como secretos del hosting.
4. Usa `NODE_ENV=production`. Sin Supabase, el chat se bloquea en produccion para no perder membresias.
5. Conecta `eliana.msmmystore.com` al hosting y agrega ese dominio a tu DNS.
6. Inserta `https://eliana.msmmystore.com/widget.js` en ZAFIRO.

Para un hosting con contenedores, este proyecto incluye `Dockerfile` y expone el puerto `369`.

## Activar planes

Despues de confirmar una activacion, actualiza el plan en Supabase desde una operacion autorizada:

```sql
update public.membresias set plan = 'iniciado' where email = 'cliente@correo.com';
```

Nunca expongas `SUPABASE_SERVICE_KEY`, Groq o Gemini en el navegador.
