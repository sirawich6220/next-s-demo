import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dvl_store',
};

export async function DELETE(req) {
    let connection;
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM products WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}