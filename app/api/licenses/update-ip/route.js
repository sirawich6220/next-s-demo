import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export async function POST(req) {
    let connection;
    try {
        const { licenseId, ip } = await req.json();
        connection = await mysql.createConnection(dbConfig);
        
        // 1. ดึงข้อมูล IP และเวลาอัปเดตล่าสุดมาเช็คก่อน
        const [rows] = await connection.execute(
            'SELECT ip_address, last_ip_update FROM licenses WHERE id = ?',
            [licenseId]
        );

        if (rows.length > 0) {
            const currentIP = rows[0].ip_address;
            const lastUpdate = rows[0].last_ip_update;

            // ✅ อนุญาตถ้าเป็นครั้งแรก (0.0.0.0) แต่ถ้าไม่ใช่ ต้องเช็คเวลา 5 ชม.
            const isFirstTime = currentIP === '0.0.0.0' || !currentIP;

            if (!isFirstTime && lastUpdate) {
                const lastUpdateDate = new Date(lastUpdate);
                const now = new Date();
                const hoursDiff = (now - lastUpdateDate) / (1000 * 60 * 60);

                // ❌ ถ้ายังไม่ถึง 5 ชม. ให้ตีกลับ (Error 403)
                if (hoursDiff < 5) {
                    const remainingHours = Math.ceil(5 - hoursDiff);
                    return NextResponse.json({ 
                        error: `ระบบล็อค: กรุณารออีก ${remainingHours} ชั่วโมง` 
                    }, { status: 403 });
                }
            }
        }

        // 2. ถ้าผ่านเงื่อนไข ให้บันทึก IP ใหม่และอัปเดตเวลาเป็น NOW()
        await connection.execute(
            'UPDATE licenses SET ip_address = ?, last_ip_update = NOW() WHERE id = ?',
            [ip, licenseId]
        );
          
        return NextResponse.json({ message: "อัปเดตสำเร็จ" });

    } catch (error) {
        return NextResponse.json({ error: "Database Error" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}