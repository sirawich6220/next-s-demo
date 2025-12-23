 import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';
export const dynamic = 'force-static';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export async function GET() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // ดึงสินค้าทั้งหมด เรียงจากใหม่ไปเก่า
        const [rows] = await connection.execute('SELECT * FROM products ORDER BY id DESC');
        
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Fetch Products Error:", error);
        return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลสินค้าได้" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}