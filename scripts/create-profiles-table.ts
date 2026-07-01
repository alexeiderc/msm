import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";

function loadEnv() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {}
}

loadEnv();

async function main() {
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DIRECT_URL no configurada en .env.local");

  const pool = new pg.Pool({ connectionString: databaseUrl });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'cliente',
        status TEXT NOT NULL DEFAULT 'activo',
        country TEXT,
        province TEXT,
        municipality TEXT,
        address TEXT,
        customer_kyc_status TEXT DEFAULT 'pendiente',
        customer_risk_level TEXT DEFAULT 'normal',
        payment_method_valid BOOLEAN DEFAULT false,
        identity_document_type TEXT,
        identity_document_last4 TEXT,
        payment_account_owner TEXT,
        chargeback_policy_accepted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log("✓ Tabla profiles creada");

    await pool.query("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;");

    await pool.query(`
      CREATE POLICY "users can read own profile"
        ON public.profiles FOR SELECT
        USING (id = auth.uid());
      CREATE POLICY "users can update own profile"
        ON public.profiles FOR UPDATE
        USING (id = auth.uid());
      CREATE POLICY "service_role can manage all"
        ON public.profiles FOR ALL
        USING (true);
    `);
    console.log("✓ RLS policies creadas");

    const users = [
      { email: "user@msm.test", name: "Cliente Demo", phone: "+5351111111", role: "cliente" },
      { email: "vip@msm.test", name: "Vendedor VIP Demo", phone: "+5352222222", role: "vendedor_vip", province: "Santiago de Cuba", municipality: "Santiago de Cuba" },
      { email: "admin@msm.test", name: "Administrador MSM", phone: "+5353333333", role: "administrador" },
    ];

    for (const u of users) {
      const { rows } = await pool.query("SELECT id FROM auth.users WHERE email = $1", [u.email]);
      if (rows.length === 0) {
        console.log(`  Saltando ${u.email}: no existe en auth.users`);
        continue;
      }
      const userId = rows[0].id;
      await pool.query(
        `INSERT INTO public.profiles (id, email, full_name, phone, role, country, province, municipality, customer_kyc_status, customer_risk_level, payment_method_valid, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'aprobado', 'normal', true, now())
         ON CONFLICT (id) DO UPDATE SET full_name = $3, phone = $4, role = $5, updated_at = now()`,
        [userId, u.email, u.name, u.phone, u.role, "Cuba", u.province ?? null, u.municipality ?? null]
      );
      console.log(`  Perfil creado: ${u.email} (${u.role})`);
    }

    console.log("\nTabla profiles creada y poblada exitosamente.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
