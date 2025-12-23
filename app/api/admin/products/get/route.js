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
        const id = searchParams.get('id');

        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);

        if (rows.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}