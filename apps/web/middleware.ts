import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PUBLIC_PATH = /^\/(auth|_next|favicon\.ico|robots\.txt)(\/|$)/;

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          req.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options as CookieOptions);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  if (!user && !PUBLIC_PATH.test(path)) {
    const target = req.nextUrl.clone();
    target.pathname = "/auth/signin";
    target.searchParams.set("next", path);
    return NextResponse.redirect(target);
  }

  if (user && (path === "/auth/signin" || path === "/auth/signup")) {
    const target = req.nextUrl.clone();
    target.pathname = req.nextUrl.searchParams.get("next") || "/";
    target.searchParams.delete("next");
    return NextResponse.redirect(target);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
