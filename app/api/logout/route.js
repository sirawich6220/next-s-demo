import { NextResponse } from "next/server";
export const dynamic = 'force-static';

export async function GET(request) {
  const redirectUrl = new URL("/", request.url); // ✅ absolute URL

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("discord_user", "", {
    maxAge: 0,
    path: "/", // สำคัญ
  });

  return response;
}
