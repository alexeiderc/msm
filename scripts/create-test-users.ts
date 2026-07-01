import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

type UserRole = "cliente" | "vendedor_vip" | "administrador" | "administrador_economico" | "superadmin";

const testUsers: Array<{
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  country?: string;
  province?: string;
  municipality?: string;
}> = [
  {
    email: "user@msm.test",
    password: "TestUser2026!",
    name: "Cliente Demo",
    phone: "+5351111111",
    role: "cliente",
    country: "Cuba",
  },
  {
    email: "vip@msm.test",
    password: "TestVip2026!",
    name: "Vendedor VIP Demo",
    phone: "+5352222222",
    role: "vendedor_vip",
    country: "Cuba",
    province: "Santiago de Cuba",
    municipality: "Santiago de Cuba",
  },
  {
    email: "admin@msm.test",
    password: "TestAdmin2026!",
    name: "Administrador MSM",
    phone: "+5353333333",
    role: "administrador",
    country: "Cuba",
  },
];

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.");
  }

  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const user of testUsers) {
    console.log(`\nCreando usuario: ${user.email} (${user.role})...`);

    let userId: string;

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
      const profileData: Record<string, unknown> = {
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
        console.log(`  Nota: no se pudo actualizar profiles (${profileError.message}). El rol queda en auth.users.metadata.`);
      } else {
        console.log(`  Perfil actualizado en profiles.`);
      }
    } catch {
      console.log(`  Nota: profiles no accesible. El rol queda en auth.users.metadata.`);
    }

    console.log(`  Usuario listo: ${user.name} (${user.role})`);
    console.log(`  Credenciales: ${user.email} / ${user.password}`);
  }

  console.log("\nTodos los usuarios de prueba han sido creados exitosamente.");
  console.log("\nResumen de credenciales:");
  console.log("  user@msm.test / TestUser2026!  (cliente)");
  console.log("  vip@msm.test   / TestVip2026!   (vendedor_vip)");
  console.log("  admin@msm.test / TestAdmin2026! (administrador)");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
