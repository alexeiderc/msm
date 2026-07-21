# Database Schema - La Maquina del Futuro

## Migracion: 015_maquina_del_futuro.sql

### Tablas

| Tabla | Descripcion | RLS |
|-------|------------|-----|
| project_visions | Visiones creadas por usuarios | Owner select/insert/update/delete, Superadmin all |
| vision_sessions | Sesiones IA generadas | Owner select/insert, Superadmin all |
| declarations | Declaraciones personales | Owner all, Superadmin all |
| scriptures | Versiculos biblicos | Public read, Superadmin manage |
| prototypes | Prototipos tecnicos | Owner all, Superadmin all |
| investor_rooms | Rooms para inversionistas | Owner all, public read with token, Superadmin all |
| investor_contacts | Contactos inversionistas | Owner manage own rooms, Superadmin all |
| book_projects | Proyectos de libro | Owner all, Superadmin all |
| book_chapters | Capitulos del libro | Owner manage own books, Superadmin all |
| audit_events | Eventos de auditoria | Superadmin read all, actor read own, system insert |

### Relaciones

```
auth.users (Supabase Auth)
  └── project_visions.owner_id
  └── vision_sessions.owner_id
  └── declarations.owner_id
  └── prototypes.owner_id
  └── investor_rooms.owner_id
  └── book_projects.owner_id
  └── audit_events.actor_id

project_visions.id
  └── vision_sessions.vision_id (CASCADE)
  └── declarations.vision_id (CASCADE)
  └── prototypes.vision_id (CASCADE)
  └── investor_rooms.vision_id (CASCADE)

investor_rooms.id
  └── investor_contacts.room_id (CASCADE)

book_projects.id
  └── book_chapters.book_id (CASCADE)
```

### Indexes

```sql
idx_visions_owner ON project_visions(owner_id)
idx_visions_status ON project_visions(status)
idx_sessions_vision ON vision_sessions(vision_id)
idx_sessions_owner ON vision_sessions(owner_id)
idx_prototypes_vision ON prototypes(vision_id)
idx_investor_rooms_token ON investor_rooms(access_token)
idx_investor_rooms_owner ON investor_rooms(owner_id)
idx_book_chapters_book ON book_chapters(book_id)
idx_audit_actor ON audit_events(actor_id)
idx_audit_entity ON audit_events(entity_type, entity_id)
```

### Seeds Iniciales

```sql
-- 4 versiculos biblicos
INSERT INTO scriptures (reference, text, purpose, project_area) VALUES
  ('Genesis 1:1', 'En el principio creo Dios los cielos y la tierra.', ...),
  ('Habacuc 2:2', 'Escribe la vision y declala en tablas, ...', ...),
  ('Jeremias 33:3', 'Clama a mi, y yo te respondere, ...', ...),
  ('Juan 3:12', 'Si os he dicho cosas terrenales, ...', ...);
```

### Tipos de Vision

```
INVENTION  - Invencion o descubrimiento
TECHNOLOGY - Proyecto tecnologico
BUSINESS   - Negocio o empresa
BOOK       - Libro o publicacion
SPIRITUAL  - Proyecto espiritual
PERSONAL   - Meta personal
```

### Tipos de Sesion

```
MEDITATION  - Meditacion guiada
INTERVIEW   - Entrevista futura
PROTOTYPE   - Prototipo tecnico
PITCH       - Pitch para inversionistas
PRAYER      - Oracion del proyecto
ROADMAP     - Plan de ejecucion
```

### Estados de Investor Room

```
PRIVATE - Solo owner puede ver
PUBLIC  - Cualquiera con link puede ver
```

### Estados de Vision

```
DRAFT     - En borrador
ACTIVE    - Activa y en uso
COMPLETED - Completada
ARCHIVED  - Archivada
```
