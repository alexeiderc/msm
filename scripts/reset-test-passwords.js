const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const users = [
  { email: "user@msm.test", password: process.env.MSM_TEST_USER_PASSWORD },
  { email: "vip@msm.test", password: process.env.MSM_TEST_VIP_PASSWORD },
  { email: "admin@msm.test", password: process.env.MSM_TEST_ADMIN_PASSWORD },
];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || users.some((user) => !user.password)) {
  throw new Error("Configura NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y las contrasenas MSM_TEST_* antes de ejecutar este script.");
}

async function main() {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const user of users) {
    console.log(`Actualizando password para ${user.email}...`);
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    const existing = data.users.find((item) => item.email === user.email);
    if (!existing) { console.log("  No encontrado"); continue; }
    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, { password: user.password });
    if (updateError) throw updateError;
    console.log("  OK");
  }

  console.log("\nContrasenas demo actualizadas.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });