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
        const file = formData.get('file');
        const amount = formData.get('amount');
        const date = formData.get('date');
        const time = formData.get('time');
        const discordIdFromClient = formData.get('userId'); 

        if (!file || !discordIdFromClient || !amount) {
            return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
        }

        // --- 1. จัดการไฟล์ ---
        const uploadDir = path.join(process.cwd(), 'public/uploads/slips');
        await mkdir(uploadDir, { recursive: true });
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const uploadPath = path.join(uploadDir, filename);
        await writeFile(uploadPath, buffer);

        // --- 2. เชื่อมต่อ DB ---
        connection = await mysql.createConnection(dbConfig);
        
        // --- 3. ค้นหาข้อมูลผู้ใช้ (ID และ Username) ---
        let [userRows] = await connection.execute(
            'SELECT id, username FROM users WHERE discord_id = ? OR id = ?',
            [discordIdFromClient, discordIdFromClient]
        );

        let realPrimaryId;
        let currentUsername = "Unknown User";

        if (userRows.length === 0) {
            // ถ้าไม่พบ สร้างใหม่
            currentUsername = 'New User ' + discordIdFromClient.substring(0, 5);
            const [newUser] = await connection.execute(
                'INSERT INTO users (username, discord_id, points) VALUES (?, ?, ?)',
                [currentUsername, discordIdFromClient, 0]
            );
            realPrimaryId = newUser.insertId;
        } else {
            realPrimaryId = userRows[0].id;
            currentUsername = userRows[0].username; // ✅ ดึงชื่อปัจจุบันมาเก็บไว้
        }

        // --- 4. บันทึกสลิปพร้อม Username ---
        // ✅ เพิ่มคอลัมน์ username ในคำสั่ง INSERT
        await connection.execute(
            'INSERT INTO slips (user_id, username, amount, transfer_date, transfer_time, slip_img, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [realPrimaryId, currentUsername, amount, date, time, filename, 'PENDING']
        );
        
        return NextResponse.json({ 
            success: true, 
            message: "ส่งหลักฐานสำเร็จแล้ว! ชื่อของคุณคือ: " + currentUsername 
        });

    } catch (error) {
        console.error("Topup Submit Error Details:", error);
        return NextResponse.json({ error: "เกิดข้อผิดพลาด: " + error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}