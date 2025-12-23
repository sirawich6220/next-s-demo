import { NextResponse } from "next/server";

// ✅ 1. ต้องเป็น dynamic เพราะต้องรับค่า code จาก Discord และมีการใช้ Cookies
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  // ✅ 2. แก้ไข Redirect ให้เป็น Absolute URL เสมอ
  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  try {
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

    if (!tokenData.access_token) {
        return NextResponse.redirect(`${origin}/auth-error`);
    }

    // 2. ขอข้อมูล user
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const user = await userRes.json();

    // ✅ 3. สร้าง session และ Redirect กลับไปยังหน้าหลัก (Absolute URL)
    // ใช้ process.env.NEXT_PUBLIC_BASE_URL หากตั้งค่าไว้ หรือใช้ origin จาก request
    const redirectUrl = process.env.NEXT_PUBLIC_BASE_URL || origin;
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("discord_user", JSON.stringify({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ใช้ Secure cookie ใน production
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 วัน
    });

    return response;

  } catch (error) {
    console.error("Discord Auth Error:", error);
    return NextResponse.redirect(`${origin}/error?msg=server_error`);
  }
}