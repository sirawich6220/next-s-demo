import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';
export const dynamic = 'force-static';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dvl_store',
};

export async function GET(req) {
    let connection;
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId'); // รับค่า ID จากฝั่ง Client

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        connection = await mysql.createConnection(dbConfig);
        
        // ดึงสลิปเฉพาะของ User นั้นๆ (ใช้ได้ทั้ง id หลัก หรือ discord_id ขึ้นอยู่กับการบันทึกของคุณ)
        // แนะนำให้ใช้ WHERE user_id = ?
        const [rows] = await connection.execute(
            'SELECT id, amount, transfer_date, transfer_time, status FROM slips WHERE user_id = ? OR username = (SELECT username FROM users WHERE discord_id = ?) ORDER BY id DESC',
            [userId, userId]
        );

        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}