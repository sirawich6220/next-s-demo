'use client';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function AdminSlipManager() {
  const [slips, setSlips] = useState([]);

  // ดึงข้อมูลสลิปที่รอตรวจสอบ
  const fetchSlips = async () => {
    const res = await fetch('/api/admin/get-slips'); // คุณต้องสร้าง API นี้เพิ่มเพื่อดึงข้อมูล
    const data = await res.json();
    setSlips(data);
  };

  useEffect(() => { fetchSlips(); }, []);

  const handleAction = async (slipId, action) => {
    const res = await fetch('/api/admin/approve-slip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slipId, action })
    });

    const result = await res.json();
    if (res.ok) {
      Swal.fire('สำเร็จ', result.message, 'success');
      fetchSlips(); // โหลดรายการใหม่
    } else {
      Swal.fire('ผิดพลาด', result.error, 'error');
    }
  };

  return (
    <div className="p-10 bg-[#0a0f1d] min-h-screen text-white font-black uppercase">
      <h1 className="text-2xl mb-6">ระบบจัดการสลิป (Admin)</h1>
      <div className="grid gap-4">
        {slips.map(slip => (
          <div key={slip.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-purple-400 text-xs">User ID: {slip.user_id}</p>
              <p className="text-xl">จำนวน: {slip.amount} บาท</p>
              <a href={`/uploads/slips/${slip.slip_img}`} target="_blank" className="text-blue-400 text-xs underline">ดูรูปสลิป</a>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction(slip.id, 'APPROVE')} className="bg-emerald-500 px-6 py-2 rounded-xl text-sm">อนุมัติ</button>
              <button onClick={() => handleAction(slip.id, 'REJECT')} className="bg-red-500 px-6 py-2 rounded-xl text-sm">ปฏิเสธ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}