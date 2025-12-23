import mysql from 'mysql2/promise';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ADMIN_DISCORD_IDS = ["711119862302375956"]; // ไอดีแอดมินของคุณ

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dvl_store',
};

export async function GET() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("discord_user");

  if (!userDataCookie) return NextResponse.json(null);

  let connection;
  try {
    const sessionUser = JSON.parse(userDataCookie.value);
    const discordIdStr = String(sessionUser.id); // บังคับเป็น String ป้องกันเลขเพี้ยน
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. ดึงข้อมูล User (ใช้ CAST เพื่อป้องกัน Precision Loss ใน JS)
    const [userRows] = await connection.execute(
      'SELECT CAST(id AS CHAR) as real_id, avatar, points, username FROM users WHERE discord_id = ?', 
      [discordIdStr]
    );
    
    let dbUser = userRows[0];

    // 2. จัดการข้อมูลผู้ใช้ (สร้างใหม่หากไม่พบ)
    if (!dbUser) {
        // ✅ แก้ไขส่วน Query Licenses ในไฟล์ app/api/me/route.js
        const [licenseRows] = await connection.execute(
          'SELECT id, resource_name, license_key, price, ip_address, last_ip_update, created_at FROM licenses WHERE user_id = ? ORDER BY created_at DESC',
          [dbUser.real_id]
        );
        dbUser = { 
            real_id: String(insertResult.insertId), 
            avatar: sessionUser.avatar, 
            points: 0,
            username: sessionUser.username
        };
    } else {
        // อัปเดตข้อมูลให้เป็นปัจจุบัน
        if (dbUser.avatar !== sessionUser.avatar || dbUser.username !== sessionUser.username) {
            await connection.execute(
                'UPDATE users SET avatar = ?, username = ? WHERE discord_id = ?',
                [sessionUser.avatar, sessionUser.username, discordIdStr]
            );
        }
    }

    // 3. ดึงข้อมูลประวัติการซื้อ (Licenses)
    const [licenseRows] = await connection.execute(
      `SELECT 
        l.id, 
        l.resource_name, 
        l.license_key, 
        l.ip_address, 
        l.last_ip_update, 
        l.created_at,
        p.price -- ✅ ดึงราคามาจากตาราง products
       FROM licenses l
       LEFT JOIN products p ON l.resource_name = p.name -- หรือเชื่อมด้วย field ที่ตรงกัน
       WHERE l.user_id = ? 
       ORDER BY l.created_at DESC`,
      [dbUser.real_id]
    );

    // ✅ 4. เพิ่มการดึงประวัติการทำธุรกรรม (Slips) มาพร้อมกันเลย
    // ดึงทั้งจาก real_id (ID หลัก) และ username (คอลัมน์ใหม่ที่คุณเพิ่ม)
    const [slipRows] = await connection.execute(
      'SELECT id, amount, transfer_date, transfer_time, status FROM slips WHERE user_id = ? OR username = ? ORDER BY id DESC',
      [dbUser.real_id, dbUser.username]
    );

    // 5. ดึงข้อมูล Roles จาก Discord
    let userRoles = [];
    try {
        const memberRes = await fetch(
          `https://discord.com/api/guilds/${GUILD_ID}/members/${discordIdStr}`,
          { headers: { Authorization: `Bot ${BOT_TOKEN}` }, next: { revalidate: 0 } }
        );
        if (memberRes.ok) {
            const memberData = await memberRes.json();
            const guildRolesRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/roles`, {
                headers: { Authorization: `Bot ${BOT_TOKEN}` },
            });
            const allGuildRoles = await guildRolesRes.json();
            userRoles = allGuildRoles
                .filter(role => memberData.roles.includes(role.id))
                .map(role => ({
                    name: role.name,
                    color: role.color === 0 ? "#9ca3af" : `#${role.color.toString(16).padStart(6, '0')}`
                }));
        }
    } catch (discordErr) { console.error("Discord API Error:", discordErr); }

    // 6. ส่งข้อมูลทั้งหมดกลับไป (รวมถึง slips)
    return NextResponse.json({
      ...sessionUser,
      id: dbUser.real_id,
      discord_id: discordIdStr,
      avatar: dbUser.avatar, 
      points: dbUser?.points || 0, 
      roles: userRoles,
      licenses: licenseRows, // ประวัติการซื้อ
      slips: slipRows, // ประวัติการโอนเงิน (เพิ่มเข้าไปใหม่)
      isAdmin: ADMIN_DISCORD_IDS.includes(discordIdStr)
    });

  } catch (err) {
    console.error("API Me Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}