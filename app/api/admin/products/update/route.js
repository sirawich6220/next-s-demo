import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dvl_store',
};

export async function POST(req) {
    let connection;
    try {
        const formData = await req.formData();
        const id = formData.get('id');
        const name = formData.get('name');
        const price = formData.get('price');
        const description = formData.get('description');
        const version = formData.get('version');
        const file = formData.get('image'); // รับไฟล์รูปภาพใหม่ (ถ้ามี)

        connection = await mysql.createConnection(dbConfig);

        let query = 'UPDATE products SET name = ?, price = ?, description = ?, version = ?';
        let params = [name, price, description, version];

        // ถ้ามีการอัปโหลดรูปภาพใหม่
        if (file && typeof file !== 'string') {
            const uploadDir = path.join(process.cwd(), 'public/uploads/products');
            await mkdir(uploadDir, { recursive: true });
            
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const uploadPath = path.join(uploadDir, filename);
            
            await writeFile(uploadPath, buffer);
            
            query += ', image = ?';
            params.push(filename);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await connection.execute(query, params);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update Product Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}