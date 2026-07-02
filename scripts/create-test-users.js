const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://vcfevlpoqwnsvkwfoprv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmV2bHBvcXduc3Zrd2ZvcHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgzNjEwNCwiZXhwIjoyMDk4NDEyMTA0fQ.6jMR4nb1HauEl-s4G36ETWFSLzhBsyWE9AC92WGWBEQ";

const testUsers = [
  { email: "user@msm.test", password: "TestUser2026!", name: "Cliente Demo", phone: "+5351111111", role: "cliente", country: "Cuba" },
  { email: "vip@msm.test", password: "TestVip2026!", name: "Vendedor VIP Demo", phone: "+5352222222", role: "vendedor_vip", country: "Cuba", province: "Santiago de Cuba", municipality: "Santiago de Cuba" },
  { email: "admin@msm.test", password: "TestAdmin2026!", name: "Administrador MSM", phone: "+5353333333", role: "administrador", country: "Cuba" },
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
      console.log(`  Ya existe en Auth, ID: ${existing.id}. Actualizando metadata...`);
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
      console.log(`  Creado en Auth, ID: ${userId}`);
    }

    try {
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
        console.log(`  Nota: ${profileError.message}`);
      } else {
        console.log(`  Perfil actualizado.`);
      }
    } catch (e) {
      console.log(`  Nota: ${e.message}`);
    }

    console.log(`  ${user.email} / ${user.password}`);
  }

  console.log("\nUsuarios creados exitosamente.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
