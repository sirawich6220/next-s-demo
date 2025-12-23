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
        const showAll = searchParams.get('all') === 'true';

        connection = await mysql.createConnection(dbConfig);
        
        // ✅ ใช้ SQL JOIN เพื่อดึง Username มาจากตาราง users
        // ✅ CAST user_id AS CHAR เพื่อป้องกันเลขไอดีเพี้ยนใน JavaScript
        let query = `
            SELECT 
                id, 
                CAST(user_id AS CHAR) as user_id, 
                username, -- ดึงจากคอลัมน์ใหม่ใน slips
                amount, 
                transfer_date, 
                transfer_time, 
                slip_img, 
                status
            FROM slips 
        `; 

        if (!showAll) {
            query += ` WHERE status = 'PENDING'`;
        }

        // ❌ ของเดิม: query += ` ORDER BY s.id DESC`;
        // ✅ ของใหม่: ลบ s. ออก
        query += ` ORDER BY id DESC`;

        const [rows] = await connection.execute(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Admin Get Slips Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}