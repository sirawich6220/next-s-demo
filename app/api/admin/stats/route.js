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

        // 1. นับสลิปที่รออนุมัติ
        const [pending] = await connection.execute('SELECT COUNT(*) as count FROM slips WHERE status = "PENDING"');
        
        // 2. นับสินค้าทั้งหมด
        const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
        
        // 3. นับจำนวนผู้ใช้ทั้งหมด
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        
        // 4. คำนวณรายได้ทั้งหมดจากสลิปที่ APPROVED แล้ว
        const [revenue] = await connection.execute('SELECT SUM(amount) as total FROM slips WHERE status = "APPROVED"');

        return NextResponse.json({
            pendingSlips: pending[0]?.count || 0,
            totalProducts: products[0]?.count || 0,
            activeUsers: users[0]?.count || 0,
            totalRevenue: parseFloat(revenue[0]?.total) || 0
        });

    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}