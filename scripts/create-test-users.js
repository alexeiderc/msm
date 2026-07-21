const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_USER_PASSWORD = process.env.MSM_TEST_USER_PASSWORD;
const TEST_VIP_PASSWORD = process.env.MSM_TEST_VIP_PASSWORD;
const TEST_ADMIN_PASSWORD = process.env.MSM_TEST_ADMIN_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !TEST_USER_PASSWORD || !TEST_VIP_PASSWORD || !TEST_ADMIN_PASSWORD) {
  throw new Error("Configura NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y las contrasenas MSM_TEST_* antes de ejecutar este script.");
}

const testUsers = [
  { email: "user@msm.test", password: TEST_USER_PASSWORD, name: "Cliente Demo", phone: "+5351111111", role: "cliente", country: "Cuba" },
  { email: "vip@msm.test", password: TEST_VIP_PASSWORD, name: "Vendedor VIP Demo", phone: "+5352222222", role: "vendedor_vip", country: "Cuba", province: "Santiago de Cuba", municipality: "Santiago de Cuba" },
  { email: "admin@msm.test", password: TEST_ADMIN_PASSWORD, name: "Administrador MSM", phone: "+5353333333", role: "administrador", country: "Cuba" },
];

async function main() {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const user of testUsers) {
    console.log(`\nCreando usuario: ${user.email} (${user.role})...`);

    let userId;
    const { data: existingList, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;
    const existing = existingList.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());

    if (existing) {
      userId = existing.id;
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: user.name, role: user.role },
      });
    } else {
      const { data, error: createError } = await admin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.name, role: user.role },
      });
      if (createError) throw createError;
      if (!data.user) throw new Error(`No se pudo crear ${user.email}`);
      userId = data.user.id;
    }

    const profileData = {
      id: userId,
      email: user.email,
      full_name: user.name,
      phone: user.phone,
      role: user.role,
      status: "activo",
      customer_kyc_status: "aprobado",
      customer_risk_level: "normal",
      payment_method_valid: true,
      country: user.country ?? "Cuba",
      updated_at: new Date().toISOString(),
    };
    if (user.province) profileData.province = user.province;
    if (user.municipality) profileData.municipality = user.municipality;

    const { error: profileError } = await admin.from("profiles").upsert(profileData, { onConflict: "id" });
    if (profileError) {
      console.log(`  Nota de perfil: ${profileError.message}`);
    } else {
      console.log("  Usuario y perfil actualizados.");
    }
  }

  console.log("\nUsuarios demo creados o actualizados.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });