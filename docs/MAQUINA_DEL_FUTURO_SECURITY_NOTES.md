# Security Notes - La Maquina del Futuro

## Principios de Seguridad

1. **No exponer claves API en frontend** - Todas las llamadas a OpenAI se hacen desde server-side
2. **RLS en todas las tablas** - Row Level Security activado en Supabase
3. **Autenticacion obligatoria** - Todas las API routes requieren usuario autenticado
4. **Owner solo ve sus datos** - Cada tabla filtra por owner_id
5. **Investor rooms protegidos** - Solo accesibles por owner o access_token
6. **MFA para superadmin** - Autenticacion multifactor para OWNER_SUPERADMIN
7. **Logs de auditoria** - Todas las operaciones criticas se registran

## RLS (Row Level Security)

### Politicas por Tabla

**project_visions:**
- Owner puede SELECT, INSERT, UPDATE, DELETE sus visiones
- Superadmin puede hacer todo

**vision_sessions:**
- Owner puede SELECT e INSERT sus sesiones
- Superadmin puede hacer todo

**declarations:**
- Owner puede hacer todo con sus declaraciones
- Superadmin puede hacer todo

**scriptures:**
- Cualquiera puede leer
- Solo superadmin puede modificar

**prototypes:**
- Owner puede hacer todo con sus prototipos
- Superadmin puede hacer todo

**investor_rooms:**
- Owner puede hacer todo con sus rooms
- Cualquiera con access_token puede leer
- Superadmin puede hacer todo

**investor_contacts:**
- Owner puede gestionar contactos de sus rooms
- Superadmin puede hacer todo

**book_projects:**
- Owner puede hacer todo con sus libros
- Superadmin puede hacer todo

**book_chapters:**
- Owner puede gestionar capitulos de sus libros
- Superadmin puede hacer todo

**audit_events:**
- Superadmin puede leer todos
- Actor puede leer los suyos
- Sistema puede insertar

## Proteccion de API Keys

```typescript
// NUNCA en componentes client-side
// SIEMPRE en API routes o server components

// Correcto:
const res = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}` // Solo en server
  }
});

// INCORRECTO:
// process.env.OPENAI_API_KEY en un componente "use client"
```

## Validacion de Entrada

- Todas las API routes validan campos requeridos
- Se retornan errores genericos (no se expone informacion interna)
- Se valida que el usuario sea owner antes de operar

## Rate Limiting

Recomendado para produccion:
- Implementar rate limiting en API routes
- Maximo 10 llamadas IA por minuto por usuario
- Maximo 50 llamadas IA por hora por usuario

## Datos Sensibles

- **Datos biometricos:** Consentimiento explicito requerido
- **Datos espirituales:** Privacidad garantizada
- **Datos de inversionistas:** Solo accesibles por owner autorizado
- **Datos de auditoria:** Solo accesibles por superadmin

## Auditoria

Cada operacion critica registra:
- `actor_id` - Quien ejecuto la accion
- `event_type` - Tipo de evento
- `entity_type` - Tabla afectada
- `entity_id` - Registro afectado
- `metadata` - Datos adicionales
- `created_at` - Timestamp

### Eventos Registrados

```
VISION_CREATED
INVESTOR_ROOM_CREATED
BOOK_CHAPTER_GENERATED
MEDITATION_GENERATED
INTERVIEW_GENERATED
PROTOTYPE_GENERATED
PITCH_GENERATED
DECLARATION_CREATED
```

## Checklist de Seguridad

- [x] RLS activado en todas las tablas
- [x] API keys no expuestas en frontend
- [x] Autenticacion en todas las API routes
- [x] Validacion de entrada
- [x] Owner solo ve sus datos
- [x] Investor rooms protegidos
- [x] Auditoria basica
- [ ] Rate limiting (produccion)
- [ ] MFA para superadmin (produccion)
- [ ] Encriptacion en reposo (produccion)
- [ ] Backup automatico (produccion)
