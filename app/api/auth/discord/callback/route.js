import { NextResponse } from "next/server";
export const dynamic = 'force-static';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("/");
  }

  // 1. ขอ access token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();

  // 2. ขอข้อมูล user
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const user = await userRes.json();

  // user = { id, username, avatar, email }

  // 3. สร้าง session (แบบง่าย)
  const response = NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL);

  response.cookies.set("discord_user", JSON.stringify({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
  }), {
    httpOnly: true,
    path: "/",
  });

  return response;
}
