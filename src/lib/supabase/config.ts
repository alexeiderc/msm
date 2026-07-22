export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  if (!url || !key) {
    throw new Error("Supabase public configuration is missing.");
  }

  return { url, key };
}

export function hasSupabasePublicConfig() {
  const { url, key } = getSupabasePublicConfigSafe();

  return Boolean(
    url &&
      key &&
      !url.includes("example.supabase.co") &&
      !key.includes("placeholder") &&
      !key.includes("replace-with")
  );
}

function getSupabasePublicConfigSafe() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    key:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      ""
  };
}
