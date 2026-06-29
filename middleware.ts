import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/types/domain";

const protectedRoutes: Record<string, UserRole[]> = {
  "/dashboard/vip": ["vendedor_vip", "administrador", "superadmin"],
  "/dashboard/admin": ["administrador", "superadmin"],
  "/dashboard/economic": ["administrador_economico", "superadmin"],
  "/dashboard/economico": ["administrador_economico", "superadmin"],
  "/dashboard/don-miguel": ["administrador", "administrador_economico", "superadmin"],
  "/dashboard": ["cliente", "vendedor_vip", "administrador", "administrador_economico", "superadmin"]
};

function hasRealSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return Boolean(
    url &&
      anonKey &&
      !url.includes("example.supabase.co") &&
      !anonKey.includes("placeholder") &&
      !anonKey.includes("replace-with")
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  if (
    process.env.BETA_MODE === "true" &&
    (pathname === "/" || pathname.startsWith("/products") || pathname.startsWith("/marketplace")) &&
    !request.cookies.get("msm_beta_preview")
  ) {
    return NextResponse.redirect(new URL("/beta", request.url));
  }

  if (!hasRealSupabaseConfig()) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const route = Object.keys(protectedRoutes).find((prefix) => pathname.startsWith(prefix));

  if (!route) return response;

  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !protectedRoutes[route].includes(profile.role as UserRole)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/products/:path*", "/dashboard/:path*", "/marketplace/:path*"]
};
