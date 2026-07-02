import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolvePostAuthPath, sanitizeRedirectPath } from "@/lib/auth/routing";
import { createAdminClient } from "@/lib/supabase/admin";

function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );
}

function copyResponseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const authError = searchParams.get("error");
  const requestedNext = searchParams.get("next");

  if (authError || !code) {
    return NextResponse.redirect(new URL("/auth/login?error=auth_callback", origin));
  }

  const sessionResponse = NextResponse.redirect(new URL(sanitizeRedirectPath(requestedNext), origin));
  const supabase = createSupabaseClient(request, sessionResponse);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth/login?error=auth_callback", origin));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login?error=auth_callback", origin));
  }

  let profileStatus: string | null = null;
  let profileRole: string | null = null;

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("status,role")
      .eq("id", user.id)
      .maybeSingle();

    profileStatus = profile?.status ?? null;
    profileRole = profile?.role ?? null;

    await admin
      .from("profiles")
      .update({
        email_confirmed_at: user.email_confirmed_at ?? null,
        last_login_at: new Date().toISOString()
      })
      .eq("id", user.id);
  } catch {
    const { data: profile } = await supabase.from("profiles").select("status,role").eq("id", user.id).maybeSingle();
    profileStatus = profile?.status ?? null;
    profileRole = profile?.role ?? null;
  }

  if (profileStatus === "bloqueado") {
    const blocked = NextResponse.redirect(new URL("/auth/login?error=cuenta_bloqueada", origin));
    copyResponseCookies(sessionResponse, blocked);
    const signOutClient = createSupabaseClient(request, blocked);
    await signOutClient.auth.signOut();
    return blocked;
  }

  const destination = resolvePostAuthPath(requestedNext, profileStatus, profileRole);
  const finalResponse = NextResponse.redirect(new URL(destination, origin));
  copyResponseCookies(sessionResponse, finalResponse);

  return finalResponse;
}
