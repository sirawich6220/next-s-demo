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
        const name = formData.get('name');
        const price = formData.get('price');
        const description = formData.get('description');
        const category = formData.get('category');
        const video_url = formData.get('video_url');
        const features = formData.get('features');
        
        // รับไฟล์รูปภาพทั้งหมด (ส่งมาเป็น Array ในชื่อเดียวกัน)
        const images = formData.getAll('images'); 
        const uploadedFilenames = [];

        // จัดการอัปโหลดรูปภาพ
        const uploadDir = path.join(process.cwd(), 'public/uploads/products');
        await mkdir(uploadDir, { recursive: true });

        for (const file of images) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const uploadPath = path.join(uploadDir, filename);
            await writeFile(uploadPath, buffer);
            uploadedFilenames.push(filename);
        }

        connection = await mysql.createConnection(dbConfig);
        
        // บันทึกลง Database (เก็บชื่อไฟล์รูปแรกใน image และรูปทั้งหมดใน gallery แบบ JSON)
        await connection.execute(
            'INSERT INTO products (name, price, description, category, video_url, features, image, gallery) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name, price, description, category, video_url, features, 
                uploadedFilenames[0] || null, // รูปหน้าปก
                JSON.stringify(uploadedFilenames) // รูปทั้งหมดในเครื่อง
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}