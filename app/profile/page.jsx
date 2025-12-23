'use client';

import { useEffect, useState } from "react";
import { 
  Package, RefreshCw, Copy, Clock, Upload, Settings, Key, Info, 
  Coins, Calendar, Timer, DownloadCloud, Layout, Shield, 
  User, CheckCircle2, History, CreditCard, ChevronRight, XCircle
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- Theme Config ---
const swalConfig = {
  background: '#111827',
  color: '#f3f4f6',
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#374151',
  customClass: {
    popup: 'rounded-3xl border border-white/10 backdrop-blur-3xl shadow-2xl',
    confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm transition-all',
    cancelButton: 'px-6 py-2.5 rounded-xl font-bold text-sm transition-all'
  }
};

const formatCooldown = (ms) => {
  if (ms <= 0) return "00:00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getRemainingTime = (lastUpdate) => {
    if (!lastUpdate) return 0;
    const lastDate = new Date(lastUpdate).getTime();
    const now = new Date().getTime();
    const cooldownInMs = 5 * 60 * 60 * 1000; 
    return Math.max(0, cooldownInMs - (now - lastDate));
};

function CooldownDisplay({ lastUpdate }) {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const calculate = () => {
      const remaining = getRemainingTime(lastUpdate);
      setTimeLeft(remaining);
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [lastUpdate]);
  if (timeLeft <= 0) return null;
  return (
    <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10 font-black">
       <Timer size={12} className="animate-pulse" />
       <span>คูลดาวน์: {formatCooldown(timeLeft)}</span>
    </div>
  );
}

const getDiscordAvatar = (user) => {
    if (!user) return "https://cdn.discordapp.com/embed/avatars/0.png";
    if (user.avatar && user.avatar.startsWith('http')) return user.avatar; 
    const userId = user.discord_id || user.id;
    if (userId && user.avatar) return `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png?size=256`;
    return "https://cdn.discordapp.com/embed/avatars/0.png"; 
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('scripts'); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [amount, setAmount] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [transferTime, setTransferTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slips, setSlips] = useState([]); 

  const fetchUserData = async () => {
    try {
        const res = await fetch("/api/me"); 
        const data = await res.json();
        if (data && !data.error) {
            setUser(data);
            if (Array.isArray(data.slips)) {
                setSlips(data.slips);
            }
        }
    } catch (err) {
        console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchUserData(); }, []);

  const handleUpdateIP = async (licenseId, currentIP, lastUpdate) => {
    const remainingMs = getRemainingTime(lastUpdate);
    const isFirstTime = currentIP === '0.0.0.0' || !currentIP;
    if (!isFirstTime && remainingMs > 0) return;

    const { value: ipValue } = await MySwal.fire({
      ...swalConfig,
      title: 'อัปเดตไอพีเซิร์ฟเวอร์',
      text: 'กรุณากรอกหมายเลข IPv4 ของเซิร์ฟเวอร์คุณ',
      input: 'text',
      inputValue: isFirstTime ? '' : currentIP,
      showCancelButton: true,
      confirmButtonText: 'อัปเดตข้อมูล',
      cancelButtonText: 'ยกเลิก',
      inputValidator: (value) => { if (!value) return 'จำเป็นต้องระบุหมายเลขไอพี!'; }
    });

    if (ipValue) {
      try {
        const res = await fetch("/api/licenses/update-ip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ licenseId, ip: ipValue }),
        });
        if (res.ok) {
          await MySwal.fire({ ...swalConfig, icon: 'success', title: 'อัปเดตสำเร็จ', text: 'ไอพีเซิร์ฟเวอร์ของคุณถูกเปลี่ยนเรียบร้อยแล้ว' });
          fetchUserData(); 
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    MySwal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'คัดลอกลงคลิปบอร์ดแล้ว', showConfirmButton: false, timer: 1500, background: '#111827', color: '#fff' });
  };

  const handleSubmitSlip = async () => {
    if (!selectedFile || !amount || !transferDate || !transferTime) {
        return MySwal.fire({ ...swalConfig, icon: 'warning', title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกข้อมูลและแนบสลิปให้ครบถ้วน' });
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", selectedFile); 
    formData.append("amount", amount); 
    formData.append("date", transferDate); 
    formData.append("time", transferTime); 
    formData.append("userId", user.discord_id);
    
    try {
      const res = await fetch("/api/topup/submit", { method: "POST", body: formData });
      if (res.ok) { 
          MySwal.fire({ ...swalConfig, icon: 'success', title: 'ส่งสำเร็จ', text: 'แอดมินกำลังตรวจสอบสลิปของคุณ โปรดรอสักครู่' }); 
          setSelectedFile(null); setAmount(""); setTransferDate(""); setTransferTime("");
          fetchUserData(); 
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#030712] text-slate-200 pb-20 relative font-sans">
      <Navbar user={user} />
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/10 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto pt-36 px-6 font-black uppercase">
        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mb-12 font-black">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                <div className="relative shrink-0">
                    <img src={getDiscordAvatar(user)} className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white/5 shadow-2xl" alt="avatar" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-[#030712] flex items-center justify-center shadow-lg"><Shield size={14} className="text-white" /></div>
                </div>
                <div className="flex-1 text-center md:text-left pt-2 font-black">
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4 font-black">
                        <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] tracking-widest border border-indigo-500/20 uppercase font-black">บัญชีที่ได้รับการยืนยัน</span>
                        <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px] border border-white/5 uppercase font-black">ID: {user.discord_id || user.id}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4 font-black font-black">ยินดีต้อนรับกลับมา, {user.username}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {user.roles?.map((role, idx) => (
                            <div key={idx} style={{ borderColor: `${role.color}44`, backgroundColor: `${role.color}11`, color: role.color }} className="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider font-black">@{role.name}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center p-8 rounded-[2.5rem] bg-indigo-600 border border-indigo-500 shadow-xl shadow-indigo-500/20 font-black">
                <Coins className="text-white/40 mb-4" size={32} />
                <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1 font-black">ยอดเงินคงเหลือ</span>
                <span className="text-5xl font-black text-white">{user.points?.toLocaleString() || 0}</span>
                <span className="text-indigo-200 text-[10px] font-bold mt-2 opacity-60 uppercase font-black">พอยท์พร้อมใช้งาน</span>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl w-fit mx-auto mb-10 backdrop-blur-md font-black">
            {[
                { id: 'scripts', label: 'คลังสินค้า', icon: <Package size={16}/> },
                { id: 'topup', label: 'เติมเงิน', icon: <CreditCard size={16}/> },
                { id: 'history', label: 'ประวัติรายการ', icon: <History size={16}/> }
            ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all font-black uppercase ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        {/* Main Content Area */}
        <div className="min-h-[500px] uppercase font-black font-black">
          {/* ✅ 1. แท็บคลังสินค้า */}
          {activeTab === 'scripts' && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {user.licenses && user.licenses.length > 0 ? (
                  user.licenses.map((license, idx) => {
                    const isCooldown = getRemainingTime(license.last_ip_update) > 0 && license.ip_address !== '0.0.0.0';

                    return (
                      <div key={idx} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 font-black">
                        <div className="flex items-center gap-6 flex-1 font-black font-black">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10 font-black"><Package size={24} /></div>
                          <div className="space-y-1 font-black">
                            <div className="flex items-center gap-3 font-black">
                              <h3 className="text-lg font-bold text-white tracking-tight uppercase font-black">{license.resource_name}</h3>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-bold border border-emerald-500/20">ใช้งานได้</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 text-xs font-medium font-black font-black">
                              <div className="flex items-center gap-1.5 font-black"><Calendar size={12} /> วันที่ซื้อ: {new Date(license.created_at).toLocaleDateString('th-TH')}</div>
                              <div className="flex items-center gap-1.5 font-black"><Layout size={12} /> ไอพี: <span className="text-slate-300 font-mono">{license.ip_address || 'ยังไม่ได้ตั้งค่า'}</span></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 font-black">
                          {isCooldown && <CooldownDisplay lastUpdate={license.last_ip_update} />}
                          <button onClick={() => handleCopy(license.license_key)} className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition text-[11px] font-bold border border-white/5 uppercase font-black">คัดลอกคีย์</button>
                          <button 
                            onClick={() => handleUpdateIP(license.id, license.ip_address, license.last_ip_update)} 
                            disabled={isCooldown}
                            className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase font-black flex items-center gap-2 shadow-lg ${
                              isCooldown 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed' 
                                : 'bg-white text-slate-900 hover:bg-indigo-600 hover:text-white active:scale-95'
                            }`}
                          >
                            <Settings size={14} />
                            {isCooldown ? "ติดคูลดาวน์" : "อัปเดตไอพี"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : <EmptyState text="ไม่พบสินค้าที่คุณครอบครอง" />}
              </div>
          )}

          {/* ✅ 2. แท็บเติมเงิน */}
          {activeTab === 'topup' && (
                <div className="grid lg:grid-cols-[1fr_380px] gap-8 animate-in fade-in duration-500 font-black">
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center font-black">
                        <div className="p-4 bg-white rounded-3xl shadow-2xl relative mb-8">
                          <img src="/IMG_9318.jpg" alt="QR" className="w-[300px] h-[300px] rounded-2xl object-cover" />
                          <div className="absolute inset-x-0 bottom-6 flex justify-center uppercase font-black"><span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-widest shadow-xl font-black font-black font-black font-black font-black">Official Store</span></div>
                        </div>
                        <div className="flex gap-4 font-black uppercase"><div className="flex items-center gap-2 text-slate-400 text-xs font-black"><CheckCircle2 size={16} className="text-emerald-500" /> ตรวจสอบทันที</div><div className="flex items-center gap-2 text-slate-400 text-xs font-black"><CheckCircle2 size={16} className="text-emerald-500" /> เข้ารหัสปลอดภัย</div></div>
                    </div>
                    <div className="space-y-6 font-black font-black">
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 uppercase font-black font-black">
                            <div className="flex items-center gap-3 mb-8 uppercase"><History className="text-indigo-400 font-black font-black font-black" size={20} /><h3 className="text-sm font-bold uppercase tracking-widest font-black uppercase font-black font-black">ยืนยันการโอนเงิน</h3></div>
                            <div className="space-y-5 text-left font-black uppercase font-black"><div className="space-y-2 font-black font-black"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">จำนวนเงิน (บาท)</label><input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-sm text-white focus:border-indigo-500 outline-none font-bold uppercase font-black font-black" /></div><div className="grid grid-cols-2 gap-4 font-black uppercase font-black"><div className="space-y-2 font-black font-black"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">วันที่โอน</label><input type="date" value={transferDate} onChange={(e)=>setTransferDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white outline-none font-bold uppercase font-black" /></div><div className="space-y-2 font-black font-black"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">เวลาที่โอน</label><input type="time" value={transferTime} onChange={(e)=>setTransferTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white outline-none font-bold uppercase font-black" /></div></div><div className="space-y-2 font-black font-black"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1 font-black font-black">หลักฐานสลิป</label><div className="relative border-2 border-dashed border-white/10 rounded-2xl py-8 px-4 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer text-center group font-black"><input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer font-black" onChange={(e) => setSelectedFile(e.target.files[0])} /><Upload className="mx-auto mb-3 text-slate-600 group-hover:text-indigo-400 font-black font-black" size={24} /><p className="text-[11px] font-bold text-slate-500 uppercase font-black">{selectedFile ? selectedFile.name : "เลือกรูปภาพสลิป"}</p></div></div><button onClick={handleSubmitSlip} disabled={isSubmitting} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 text-xs uppercase tracking-widest font-black font-black">{isSubmitting ? "กำลังดำเนินการ..." : "ส่งข้อมูลตรวจสอบ"}</button></div>
                        </div>
                    </div>
                </div>
          )}

          {/* ✅ 3. แท็บประวัติรายการ */}
          {activeTab === 'history' && (
              <div className="space-y-3 animate-in fade-in duration-500 font-black font-black font-black">
                {/* ประวัติเติมเงิน */}
                {slips.length > 0 ? slips.map((slip, idx) => (
                    <div key={`slip-${idx}`} className="group p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4 font-black">
                        <div className="flex items-center gap-5 font-black">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${slip.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {slip.status === 'APPROVED' ? <CheckCircle2 size={20}/> : <Clock size={20}/>}
                            </div>
                            <div className="text-left font-black">
                                <h4 className="text-sm font-bold text-white uppercase font-black">เติมพอยท์เข้าระบบ</h4>
                                <div className="text-[10px] text-slate-500 font-black uppercase font-black">{slip.transfer_date} • {slip.transfer_time}</div>
                            </div>
                        </div>
                        <div className="text-right font-black">
                            <p className="text-lg font-black text-white font-black font-black">+ ฿{Number(slip.amount).toLocaleString()}</p>
                            <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${slip.status === 'APPROVED' ? 'text-emerald-500 bg-emerald-500/5' : 'text-amber-500 bg-amber-500/5'}`}>
                                {slip.status === 'APPROVED' ? 'สำเร็จ' : 'รอดำเนินการ'}
                            </span>
                        </div>
                    </div>
                )) : null}

                {/* ประวัติซื้อสคริปต์ */}
                {user.licenses?.map((license, idx) => (
                  <div key={`buy-${idx}`} className="group p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between gap-4 font-black">
                      <div className="flex items-center gap-5 font-black">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 font-black">
                              <Package size={20}/>
                          </div>
                          <div className="text-left font-black">
                              <h4 className="text-sm font-bold text-white uppercase font-black">ซื้อสคริปต์สำเร็จ</h4>
                              <div className="text-[10px] text-slate-500 font-black uppercase">
                                  {new Date(license.created_at).toLocaleDateString('th-TH')} • {license.resource_name}
                              </div>
                          </div>
                      </div>
                      <div className="text-right font-black">
                          <p className="text-lg font-black text-rose-400 font-black">
                              - ฿{(license.price || 0).toLocaleString()}
                          </p>
                          <span className="text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter text-indigo-400 bg-indigo-400/5 font-black">
                              ชำระเงินสำเร็จ
                          </span>
                      </div>
                  </div>
                ))}

                {slips.length === 0 && (!user.licenses || user.licenses.length === 0) && <EmptyState text="ไม่พบประวัติการทำรายการ" />}
              </div>
          )}
        </div>
      </div>
    </main>
  );
}

function EmptyState({text}) {
    return <div className="py-32 text-center text-white/10 font-black uppercase tracking-[0.5em] border-2 border-dashed border-white/5 rounded-[3rem] font-black">{text}</div>
}