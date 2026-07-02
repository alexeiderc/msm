const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://vcfevlpoqwnsvkwfoprv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmV2bHBvcXduc3Zrd2ZvcHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgzNjEwNCwiZXhwIjoyMDk4NDEyMTA0fQ.6jMR4nb1HauEl-s4G36ETWFSLzhBsyWE9AC92WGWBEQ";

const users = [
  { email: "user@msm.test", password: "TestUser2026!" },
  { email: "vip@msm.test", password: "TestVip2026!" },
  { email: "admin@msm.test", password: "TestAdmin2026!" },
];

async function main() {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const u of users) {
    console.log(`Actualizando password para ${u.email}...`);
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list.users.find((x) => x.email === u.email);
    if (!existing) { console.log(`  No encontrado`); continue; }
    await admin.auth.admin.updateUserById(existing.id, { password: u.password });
    console.log(`  OK - ${u.email} / ${u.password}`);
  }

  console.log("\nListo. Prueba iniciar sesion ahora.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
