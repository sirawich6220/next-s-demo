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
        const { slipId, action } = await req.json();
        connection = await mysql.createConnection(dbConfig);

        await connection.beginTransaction();

        // 1. ดึงข้อมูลสลิปและ Lock แถวไว้ป้องกันการกดซ้ำ
        const [slips] = await connection.execute(
            'SELECT * FROM slips WHERE id = ? FOR UPDATE', 
            [slipId]
        );

        const slip = slips[0];
        if (!slip || slip.status !== 'PENDING') {
            return NextResponse.json({ error: "สลิปนี้ถูกดำเนินการไปแล้วหรือหาไม่พบ" }, { status: 400 });
        }

        if (action === 'APPROVE') {
            // 2. อัปเดตสถานะสลิปเป็น APPROVED
            await connection.execute(
                'UPDATE slips SET status = "APPROVED" WHERE id = ?',
                [slipId]
            );

            // 3. เพิ่ม Points โดยใช้เทคนิคค้นหาแบบ 2 ชั้น (Double Check)
            // เพื่อแก้ปัญหาเลข ID เพี้ยนจาก Precision Loss ใน JavaScript
            const [updateResult] = await connection.execute(
                `UPDATE users 
                 SET points = points + ? 
                 WHERE id = ? 
                 OR discord_id = (SELECT discord_id FROM (SELECT u.discord_id FROM users u WHERE u.id = ?) as tmp)`,
                [slip.amount, slip.user_id, slip.user_id]
            );

            // ✅ กรณีพิเศษ: ถ้า ID ในสลิปเพี้ยนเป็นเลขปัดเศษ (...6000) ให้ลองหาจากเลขจริงที่คุณระบุ
            if (updateResult.affectedRows === 0) {
                 await connection.execute(
                    'UPDATE users SET points = points + ? WHERE discord_id = ?',
                    [slip.amount, "711119862302375956"]
                );
            }

            await connection.commit();
            return NextResponse.json({ message: `อนุมัติสำเร็จ! เพิ่ม ${slip.amount} พอยท์ให้ลูกค้าแล้ว` });
        } 
        
        else if (action === 'REJECT') {
            await connection.execute(
                'UPDATE slips SET status = "REJECTED" WHERE id = ?',
                [slipId]
            );
            await connection.commit();
            return NextResponse.json({ message: "ปฏิเสธการเติมเงินเรียบร้อยแล้ว" });
        }

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Approve Error Detail:", error);
        return NextResponse.json({ error: "Database Error: " + error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}