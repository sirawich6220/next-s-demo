import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dvl_store',
};

export async function POST(req) {
    let connection;
    try {
        const { productId, userId } = await req.json(); 
        const discordIdStr = String(userId); // บังคับเป็น String ทันทีเพื่อกันการปัดเศษ

        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction(); 

        // 1. ค้นหา User โดยเน้น discord_id ที่เป็น String เป็นหลัก
        // CAST id AS CHAR ช่วยให้การดึงข้อมูลออกมาไม่ถูก JS ปัดเศษอีกรอบ
        const [userRows] = await connection.execute(
            'SELECT CAST(id AS CHAR) as real_id, points FROM users WHERE discord_id = ? OR id = ?', 
            [discordIdStr, discordIdStr]
        );
        
        if (userRows.length === 0) {
            // กรณีเลขเพี้ยนหนัก (เช่น ...6000) ให้ใช้การค้นหาแบบ Partial
            const partialId = discordIdStr.substring(0, 15);
            const [fallbackRows] = await connection.execute(
                'SELECT CAST(id AS CHAR) as real_id, points FROM users WHERE discord_id LIKE ?',
                [`${partialId}%`]
            );
            
            if (fallbackRows.length === 0) throw new Error("ไม่พบผู้ใช้งานในระบบ");
            userRows.push(fallbackRows[0]);
        }
        
        const dbUser = userRows[0];
        const realPrimaryId = dbUser.real_id; // เลข ID จริงในรูปแบบ String (เช่น "711119862302375956")

        // 2. ดึงข้อมูลสินค้า
        const [products] = await connection.execute(
            'SELECT name, price FROM products WHERE id = ?', 
            [productId]
        );
        if (products.length === 0) throw new Error("ไม่พบสินค้าในระบบ");
        const product = products[0];

        // 3. เช็คแต้ม
        if (Number(dbUser.points) < Number(product.price)) {
            throw new Error("แต้มของคุณไม่เพียงพอ กรุณาเติมเงินก่อนซื้อ");
        }

        // 4. หักแต้ม
        await connection.execute(
            'UPDATE users SET points = points - ? WHERE id = ?',
            [product.price, realPrimaryId]
        );

        // 5. สร้าง License
        const licenseKey = `DVL-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // ✅ 6. บันทึกลงตาราง licenses
        // ส่ง realPrimaryId ที่เป็น String ไปยัง DB เพื่อให้ Match กับ Primary Key จริง
        await connection.execute(
            'INSERT INTO licenses (user_id, resource_name, license_key, ip_address) VALUES (?, ?, ?, ?)',
            [realPrimaryId, product.name, licenseKey, '0.0.0.0']
        );

        await connection.commit(); 
        return NextResponse.json({ message: "ซื้อสินค้าสำเร็จ", licenseKey });

    } catch (error) {
        if (connection) await connection.rollback(); 
        console.error("Buy Error Log:", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    } finally {
        if (connection) await connection.end();
    }
}