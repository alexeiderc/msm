-- LA MAQUINA DEL FUTURO - Migration 015
-- MSM MY STORE LLC - Miguel Soria Martinez
-- Plataforma de visualizacion temporal consciente

-- TABLE: project_visions
CREATE TABLE IF NOT EXISTS project_visions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  vision_type text CHECK (vision_type IN ('INVENTION','BOOK','BUSINESS','SPIRITUAL','PERSONAL','TECHNOLOGY')),
  status text DEFAULT 'DRAFT',
  final_scene text,
  divine_purpose text,
  problem_statement text,
  solution_statement text,
  target_users text,
  vision_json jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_visions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own visions" ON project_visions
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owner can insert own visions" ON project_visions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can update own visions" ON project_visions
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete own visions" ON project_visions
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Superadmin can do everything on visions" ON project_visions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TABLE: vision_sessions
CREATE TABLE IF NOT EXISTS vision_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vision_id uuid REFERENCES project_visions(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text CHECK (session_type IN ('MEDITATION','INTERVIEW','PROTOTYPE','PITCH','PRAYER','ROADMAP')),
  input_text text,
  output_text text,
  ai_model text,
  symbolic_seal text DEFAULT '369',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vision_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own sessions" ON vision_sessions
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owner can insert own sessions" ON vision_sessions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Superadmin can do everything on sessions" ON vision_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TABLE: declarations
CREATE TABLE IF NOT EXISTS declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vision_id uuid REFERENCES project_visions(id) ON DELETE CASCADE,
  declaration_text text NOT NULL,
  category text DEFAULT 'YO_SOY',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own declarations" ON declarations
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Superadmin can do everything on declarations" ON declarations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TABLE: scriptures
CREATE TABLE IF NOT EXISTS scriptures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  text text NOT NULL,
  purpose text,
  project_area text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scriptures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scriptures" ON scriptures
  FOR SELECT USING (true);

CREATE POLICY "Superadmin can manage scriptures" ON scriptures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- SEED: Initial scriptures
INSERT INTO scriptures (reference, text, purpose, project_area) VALUES
  ('Genesis 1:1', 'En el principio creo Dios los cielos y la tierra.', 'Dios es el primer Creador, la fuente de toda inteligencia, ciencia, creatividad, tecnologia y posibilidad.', 'FOUNDATION'),
  ('Habacuc 2:2', 'Escribe la vision y declala en tablas, para que corra el que leyere en ella.', 'Toda vision debe escribirse, organizarse, documentarse, programarse y convertirse en plano para que otros puedan correr con ella.', 'VISION'),
  ('Jeremias 33:3', 'Clama a mi, y yo te respondere, y te ensenare cosas grandes y ocultas que tu no conoces.', 'Dios revela conocimiento, conexiones, tecnologia, personas correctas y caminos correctos en el tiempo perfecto.', 'REVELATION'),
  ('Juan 3:12', 'Si os he dicho cosas terrenales, y no creen, como creeis si os dijere las celestiales?', 'Las visiones grandes deben explicarse primero con cosas terrenales: prototipos, pantallas, codigo, documentacion, imagenes, simulaciones y ejemplos claros.', 'EXECUTION')
ON CONFLICT DO NOTHING;

-- TABLE: prototypes
CREATE TABLE IF NOT EXISTS prototypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vision_id uuid REFERENCES project_visions(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  modules jsonb DEFAULT '[]',
  technologies jsonb DEFAULT '[]',
  roadmap jsonb DEFAULT '[]',
  risks jsonb DEFAULT '[]',
  status text DEFAULT 'CONCEPT',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prototypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own prototypes" ON prototypes
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Superadmin can do everything on prototypes" ON prototypes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TABLE: investor_rooms
CREATE TABLE IF NOT EXISTS investor_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vision_id uuid REFERENCES project_visions(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  room_name text NOT NULL,
  summary text,
  pitch_text text,
  target_raise_amount numeric,
  currency text DEFAULT 'USD',
  status text DEFAULT 'PRIVATE',
  access_token text UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investor_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own investor rooms" ON investor_rooms
  FOR ALL USING (auth.uid() = owner_id);

-- A private room is read only by its owner through RLS. The public investor page
-- uses the server-only admin client and must match the full opaque access token.
-- Do not add a client SELECT policy based only on access_token IS NOT NULL: every
-- newly created room has a token, which would expose all rooms to every caller.
DROP POLICY IF EXISTS "Anyone with access token can read investor room" ON investor_rooms;

CREATE POLICY "Superadmin can do everything on investor rooms" ON investor_rooms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TABLE: investor_contacts
CREATE TABLE IF NOT EXISTS investor_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES investor_rooms(id) ON DELETE CASCADE,
  name text,
  email text,
  organization text,
  role text,
  status text DEFAULT 'LEAD',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investor_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own investor contacts" ON investor_contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM investor_rooms WHERE id = investor_contacts.room_id AND owner_id = auth.uid())
  );

CREATE POLICY "Superadmin can do everything on investor contacts" ON investor_contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TABLE: book_projects
CREATE TABLE IF NOT EXISTS book_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  status text DEFAULT 'DRAFT',
  manuscript text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE book_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own book projects" ON book_projects
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Superadmin can do everything on book projects" ON book_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TABLE: book_chapters
CREATE TABLE IF NOT EXISTS book_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES book_projects(id) ON DELETE CASCADE,
  chapter_number integer,
  title text NOT NULL,
  content text,
  status text DEFAULT 'DRAFT',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own book chapters" ON book_chapters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM book_projects WHERE id = book_chapters.book_id AND owner_id = auth.uid())
  );

CREATE POLICY "Superadmin can do everything on book chapters" ON book_chapters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TABLE: audit_events
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin can read all audit events" ON audit_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "Owner can read own audit events" ON audit_events
  FOR SELECT USING (auth.uid() = actor_id);

-- API routes insert the authenticated user's own audit event. Service-role jobs
-- bypass RLS when system events without an actor are necessary.
DROP POLICY IF EXISTS "System can insert audit events" ON audit_events;
CREATE POLICY "Authenticated users can insert own audit events" ON audit_events
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_visions_owner ON project_visions(owner_id);
CREATE INDEX IF NOT EXISTS idx_visions_status ON project_visions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_vision ON vision_sessions(vision_id);
CREATE INDEX IF NOT EXISTS idx_sessions_owner ON vision_sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_prototypes_vision ON prototypes(vision_id);
CREATE INDEX IF NOT EXISTS idx_investor_rooms_token ON investor_rooms(access_token);
CREATE INDEX IF NOT EXISTS idx_investor_rooms_owner ON investor_rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_book_chapters_book ON book_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);
