# La Maquina del Futuro

Plataforma de visualizacion temporal consciente: IA + meditacion + escritura + prototipos + fe.

**Propietario:** Miguel Soria Martinez
**Empresa:** MSM MY STORE LLC
**Stack:** Next.js 15, TypeScript, Supabase, OpenAI, Tailwind CSS

## Que es

La Maquina del Futuro es una plataforma que ayuda a una persona a ver el final antes de construir el principio. No es una maquina para mover fisicamente el cuerpo por el tiempo. Es una maquina para mover la conciencia, la imaginacion, la planificacion, la simulacion, la memoria y la creatividad hacia futuros posibles para volver al presente con instrucciones concretas.

## Modulos

- **Vision Wizard** - Escribe tu vision paso a paso y la IA la convierte en plan completo
- **Meditacion Guiada** - Entra a La Maquina del Futuro, ve el final cumplido y regresa con instrucciones
- **Entrevista Futura** - Simula una entrevista donde ya lograste tu invento
- **Modo Inventor** - Genera prototipos tecnicos, modulos, stack y roadmap
- **Investor Room** - Room privado para inversionistas con pitch y documentos
- **Libro** - Escribe tu libro capitulo por capitulo con IA
- **Declaraciones Yo Soy** - Declara tu identidad y proposito
- **Base Espiritual** - Versiculos biblicos y oracion de uncion

## Como correr

```bash
npm install
cp .env.example .env.local
# Configurar variables de entorno
npm run dev
```

## Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## Base de datos

Ejecutar la migracion `supabase/migrations/015_maquina_del_futuro.sql` en Supabase.

## Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Build de produccion
npm run lint         # Verificar codigo
npm run typecheck    # Verificar tipos
```
