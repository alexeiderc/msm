import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig, hasSupabasePublicConfig } from "@/lib/supabase/config";
import type { UserRole } from "@/types/domain";

const protectedRoutes: Record<string, UserRole[]> = {
  "/dashboard/vip": ["vendedor_vip", "administrador", "superadmin"],
  "/dashboard/admin": ["administrador", "superadmin"],
  "/dashboard/economic": ["administrador_economico", "superadmin"],
  "/dashboard/economico": ["administrador_economico", "superadmin"],
  "/dashboard/don-miguel": ["administrador", "administrador_economico", "superadmin"],
  "/dashboard": ["cliente", "vendedor_vip", "administrador", "administrador_economico", "superadmin"],
  "/account": ["cliente", "vendedor_vip", "administrador", "administrador_economico", "superadmin"],
  "/wallet": ["cliente", "vendedor_vip", "administrador", "administrador_economico", "superadmin"]
};

function createSupabaseClient(request: NextRequest, response: NextResponse) {
  const { url, key } = getSupabasePublicConfig();

  return createServerClient(
    url,
    key,
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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    process.env.BETA_MODE === "true" &&
    (pathname === "/" || pathname.startsWith("/products") || pathname.startsWith("/marketplace")) &&
    !request.cookies.get("msm_beta_preview")
  ) {
    return NextResponse.redirect(new URL("/beta", request.url));
  }

  const route = Object.keys(protectedRoutes).find((prefix) => pathname.startsWith(prefix));

  if (!route) {
    return NextResponse.next({ request });
  }

  if (!hasSupabasePublicConfig()) {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("next", pathname);
    login.searchParams.set("error", "auth_unavailable");
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next({ request });
  const supabase = createSupabaseClient(request, response);
  const authResult = await Promise.race([
    supabase.auth.getUser(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000))
  ]).catch(() => null);

  if (!authResult) {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("next", pathname);
    login.searchParams.set("error", "auth_unavailable");
    return NextResponse.redirect(login);
  }

  const user = authResult.data.user;

  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .single();

  if (!profile || !protectedRoutes[route].includes(profile.role as UserRole)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (profile.status === "bloqueado") {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("error", "cuenta_bloqueada");
    const blockedResponse = NextResponse.redirect(login);
    const signOutClient = createSupabaseClient(request, blockedResponse);
    await signOutClient.auth.signOut();
    return blockedResponse;
  }

  if (profile.status === "pausado" && pathname.startsWith("/dashboard")) {
    const account = request.nextUrl.clone();
    account.pathname = "/account";
    account.searchParams.set("status", "pausado");
    return NextResponse.redirect(account);
  }

  return response;
}

export const config = {
  matcher: ["/", "/products/:path*", "/dashboard/:path*", "/account", "/account/:path*", "/wallet", "/wallet/:path*", "/marketplace/:path*"]
};
