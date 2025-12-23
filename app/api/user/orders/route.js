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
        const userId = searchParams.get('userId');

        connection = await mysql.createConnection(dbConfig);
        
        // ดึงข้อมูลการซื้อสินค้าจากตารางของคุณ (สมมติชื่อตาราง orders หรือ purchases)
        const [rows] = await connection.execute(
            'SELECT id, resource_name, price, created_at FROM licenses WHERE user_id = ? ORDER BY id DESC',
            [userId]
        );

        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}