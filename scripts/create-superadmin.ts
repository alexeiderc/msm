import { createClient } from "@supabase/supabase-js";

function arg(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = arg("email");
  const fullName = arg("name") ?? "Superadmin MSM";
  const phone = arg("phone") ?? "";
  const userIdArg = arg("user-id");

  if (!url || !serviceRole) {
    throw new Error("Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.");
  }
  if (!email && !userIdArg) {
    throw new Error("Usa --email=correo@dominio.com o --user-id=UUID.");
  }

  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  let userId = userIdArg;
  let userEmail = email;

  if (!userId && email) {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error(`No existe usuario Auth con email ${email}. Primero crea la cuenta en /auth/signup.`);
    }
    userId = user.id;
    userEmail = user.email ?? email;
  }

  if (!userId) throw new Error("No se pudo resolver el user id.");

  const { error } = await admin.from("profiles").upsert({
    id: userId,
    email: userEmail ?? `${userId}@msm.local`,
    full_name: fullName,
    phone,
    role: "superadmin",
    status: "activo",
    customer_kyc_status: "aprobado",
    customer_risk_level: "normal",
    payment_method_valid: true,
    updated_at: new Date().toISOString()
  });

  if (error) throw error;

  await admin.from("audit_logs").insert({
    actor_id: userId,
    action: "superadmin.bootstrap",
    entity: "profiles",
    entity_id: userId,
    after: { email: userEmail, role: "superadmin" }
  });

  console.log(`Superadmin listo: ${userEmail ?? userId}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
