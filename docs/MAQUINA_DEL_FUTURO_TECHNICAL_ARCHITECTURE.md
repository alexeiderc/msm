# Arquitectura Tecnica - La Maquina del Futuro

## Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  Next.js 15 + React + TypeScript + Tailwind        │
│                                                     │
│  /maquina-del-futuro (landing)                       │
│  /dashboard/maquina-del-futuro (panel)              │
│  /dashboard/maquina-del-futuro/visions/*            │
│  /dashboard/maquina-del-futuro/investor-room        │
│  /dashboard/maquina-del-futuro/book                 │
│  /investors/[token] (vista publica)                 │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                    API ROUTES                        │
│  /api/maquina-futuro/vision/create                  │
│  /api/maquina-futuro/vision/[id]                    │
│  /api/maquina-futuro/meditation/create              │
│  /api/maquina-futuro/interview/create               │
│  /api/maquina-futuro/prototype/create               │
│  /api/maquina-futuro/pitch/create                   │
│  /api/maquina-futuro/investors/create-room          │
│  /api/maquina-futuro/investors/list                 │
│  /api/maquina-futuro/book/generate                  │
│  /api/maquina-futuro/book/list                      │
│  /api/maquina-futuro/declaration/create             │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  SERVICIOS                           │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Supabase   │  │   OpenAI     │  │  Auth      │ │
│  │  PostgreSQL │  │   GPT API    │  │  RLS       │ │
│  │  Storage    │  │   Prompts    │  │  Roles     │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Modelo de Datos

### project_visions
Tabla principal que almacena las visiones creadas por los usuarios.

```
id              UUID (PK)
owner_id        UUID (FK -> auth.users)
title           TEXT
subtitle        TEXT
vision_type     TEXT (INVENTION|BOOK|BUSINESS|SPIRITUAL|PERSONAL|TECHNOLOGY)
status          TEXT (DRAFT|ACTIVE|COMPLETED|ARCHIVED)
final_scene     TEXT
divine_purpose  TEXT
problem_statement TEXT
solution_statement TEXT
target_users    TEXT
vision_json     JSONB
metadata        JSONB
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### vision_sessions
Sesiones generadas por IA para cada vision.

```
id              UUID (PK)
vision_id       UUID (FK -> project_visions)
owner_id        UUID (FK -> auth.users)
session_type    TEXT (MEDITATION|INTERVIEW|PROTOTYPE|PITCH|PRAYER|ROADMAP)
input_text      TEXT
output_text     TEXT
ai_model        TEXT
symbolic_seal   TEXT (369)
metadata        JSONB
created_at      TIMESTAMPTZ
```

### declarations
Declaraciones personales del usuario.

```
id              UUID (PK)
owner_id        UUID (FK -> auth.users)
vision_id       UUID (FK -> project_visions)
declaration_text TEXT
category        TEXT (YO_SOY|DECLARO|RECIBO|CONSTRUYO)
created_at      TIMESTAMPTZ
```

### scriptures
Versiculos biblicos del proyecto.

```
id              UUID (PK)
reference       TEXT
text            TEXT
purpose         TEXT
project_area    TEXT
created_at      TIMESTAMPTZ
```

### prototypes
Prototipos tecnicos generados.

```
id              UUID (PK)
vision_id       UUID (FK -> project_visions)
owner_id        UUID (FK -> auth.users)
name            TEXT
description     TEXT
modules         JSONB
technologies    JSONB
roadmap         JSONB
risks           JSONB
status          TEXT
created_at      TIMESTAMPTZ
```

### investor_rooms
Rooms privados para inversionistas.

```
id              UUID (PK)
vision_id       UUID (FK -> project_visions)
owner_id        UUID (FK -> auth.users)
room_name       TEXT
summary         TEXT
pitch_text      TEXT
target_raise_amount NUMERIC
currency        TEXT
status          TEXT (PRIVATE|PUBLIC)
access_token    TEXT (UNIQUE)
created_at      TIMESTAMPTZ
```

### investor_contacts
Contactos de inversionistas.

```
id              UUID (PK)
room_id         UUID (FK -> investor_rooms)
name            TEXT
email           TEXT
organization    TEXT
role            TEXT
status          TEXT (LEAD|CONTACTED|MEETING|COMMITTED)
notes           TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### book_projects
Proyectos de libro.

```
id              UUID (PK)
owner_id        UUID (FK -> auth.users)
title           TEXT
subtitle        TEXT
status          TEXT
manuscript      TEXT
metadata        JSONB
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### book_chapters
Capitulos del libro.

```
id              UUID (PK)
book_id         UUID (FK -> book_projects)
chapter_number  INTEGER
title           TEXT
content         TEXT
status          TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### audit_events
Eventos de auditoria.

```
id              UUID (PK)
actor_id        UUID (FK -> auth.users)
event_type      TEXT
entity_type     TEXT
entity_id       UUID
metadata        JSONB
created_at      TIMESTAMPTZ
```

## Seguridad

- RLS activado en todas las tablas
- Owner solo ve y modifica sus datos
- OWNER_SUPERADMIN ve todo
- Investor rooms privados solo visibles por owner o access_token
- No se exponen API keys en frontend
- MFA para OWNER_SUPERADMIN
- Logs de auditoria en todas las operaciones criticas

## Flujo de IA

```
1. Usuario envia datos via Vision Wizard
2. Frontend llama POST /api/maquina-futuro/vision/create
3. API route recibe datos
4. API route llama generateVision() con OpenAI
5. OpenAI retorna JSON con vision completa
6. API route guarda en project_visions
7. API route guarda evento de auditoria
8. Retorna vision al frontend
```

Para meditacion, entrevista, prototipo y pitch, el flujo es similar pero usando sus respectivos endpoints y funciones de generacion.
