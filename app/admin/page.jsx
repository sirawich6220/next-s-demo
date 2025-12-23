'use client';

import { useState, useEffect } from "react";
import { 
  CheckCircle2, XCircle, Eye, Search, Users, CreditCard, 
  Package, Settings, ShieldCheck, Clock, Trash2, History,
  Edit3, Plus, User,
  ExternalLink, TrendingUp, Filter, RefreshCcw, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('slips');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [allSlips, setAllSlips] = useState([]); 
  const [products, setProducts] = useState([]); 
  const [stats, setStats] = useState({
    pendingSlips: 0,
    totalProducts: 0,
    activeUsers: 0,
    totalRevenue: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (!statsData.error) setStats(statsData);

      const slipRes = await fetch("/api/admin/slips?all=true");
      const slipData = await slipRes.json();
      if (Array.isArray(slipData)) setAllSlips(slipData);

      const productRes = await fetch("/api/products");
      const productData = await productRes.json();
      if (Array.isArray(productData)) setProducts(productData);
      
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (slipId, action) => {
    const actionText = action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ';
    const result = await MySwal.fire({
      title: `ยืนยันการ${actionText}`,
      text: `คุณต้องการ ${actionText} รายการนี้ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'APPROVE' ? '#10b981' : '#ef4444',
      background: '#111827',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/admin/approve-slip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slipId, action })
        });
        if (res.ok) {
          setSelectedSlip(null);
          fetchData(); 
          MySwal.fire({ title: 'ดำเนินการสำเร็จ', icon: 'success', background: '#111827', color: '#fff' });
        }
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการทำรายการ");
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await MySwal.fire({
      title: 'ลบสคริปต์?',
      text: "คุณแน่ใจหรือไม่ที่จะลบสคริปต์นี้ออกจากระบบ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      background: '#111827',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/products/delete?id=${productId}`, { method: "DELETE" });
        if (res.ok) {
          fetchData();
          MySwal.fire({ title: 'ลบเรียบร้อย', icon: 'success', background: '#111827', color: '#fff' });
        }
      } catch (err) { console.error(err); }
    }
  };

  const pendingSlips = allSlips.filter(s => s.status === 'PENDING' && 
    (s.username?.toLowerCase().includes(searchTerm.toLowerCase()) || s.user_id?.toString().includes(searchTerm))
  );

  const paymentHistory = allSlips.filter(s => s.status !== 'PENDING' && 
    (s.username?.toLowerCase().includes(searchTerm.toLowerCase()) || s.amount?.toString().includes(searchTerm))
  );

  return (
    <main className="min-h-screen bg-[#0a0f1d] text-white pb-12 pt-28 px-4 md:px-8 relative overflow-hidden font-sans uppercase font-black">
      <Navbar />
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] -z-10 animate-pulse" />

      <div className="max-w-7xl mx-auto font-black">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div className="text-left font-black">
                <h4 className="text-indigo-400 text-[11px] uppercase tracking-[0.4em] mb-2 font-black">Management Terminal</h4>
                <h1 className="text-4xl md:text-5xl tracking-tighter uppercase font-black font-black">Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-black">Control</span></h1>
            </div>
            <div className="flex gap-3 font-black">
                <button onClick={fetchData} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition border border-white/5 group">
                    <RefreshCcw size={20} className={`text-white/40 group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
                </button>
                <Link href="/admin/products" className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 font-black">
                    <Plus size={18} /> New Script
                </Link>
            </div>
        </div>
        
        {/* --- Stats --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 font-black">
            <StatCard title="Pending Slips" value={stats?.pendingSlips || 0} icon={<Clock size={20}/>} color="text-amber-400" />
            <StatCard title="Total Resources" value={stats?.totalProducts || 0} icon={<Package size={20}/>} color="text-purple-400" />
            <StatCard title="Total Revenue" value={`฿ ${(stats?.totalRevenue?.toLocaleString() || 0)}`} icon={<TrendingUp size={20}/>} color="text-emerald-400" />
            <StatCard title="Active Users" value={(stats?.activeUsers?.toLocaleString() || 0)} icon={<Users size={20}/>} color="text-blue-400" />
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 font-black">
          {/* --- Sidebar --- */}
          <aside className="space-y-2 font-black">
            <div className="bg-white/[0.02] border border-white/10 p-4 rounded-[2.5rem] backdrop-blur-xl sticky top-32 font-black">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] mb-6 ml-4 mt-2 font-black">Menu</p>
                <nav className="space-y-1.5 font-black font-black">
                    <AdminNavItem active={activeTab === 'slips'} onClick={() => setActiveTab('slips')} icon={<CreditCard size={18}/>} label="Verification" badge={stats?.pendingSlips} />
                    <AdminNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18}/>} label="Transaction History" />
                    <AdminNavItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={18}/>} label="Scripts Manager" />
                    <AdminNavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18}/>} label="User Base" />
                </nav>
            </div>
          </aside>

          {/* --- Main Box --- */}
          <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-2xl min-h-[600px] font-black font-black">
            <div className="px-8 py-7 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 font-black font-black font-black">
                <div className="text-left flex items-center gap-4 font-black">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        {activeTab === 'slips' ? <CreditCard /> : activeTab === 'history' ? <History /> : <Package />}
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight leading-none mb-1 font-black font-black">
                            {activeTab === 'slips' ? "Pending Slips" : activeTab === 'history' ? "All Records" : "Script Manager"}
                        </h2>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">Admin Database Sync</p>
                    </div>
                </div>
                <div className="relative w-full md:w-80 font-black font-black">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input type="text" placeholder="Search customer or ID..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:border-indigo-500 outline-none transition-all font-black font-black" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="p-6 md:p-8 font-black font-black font-black">
                {/* ✅ ตาราง Verification */}
                {activeTab === 'slips' && (
                    <div className="overflow-x-auto text-left animate-in fade-in duration-500 font-black">
                        {pendingSlips.length > 0 ? (
                            <table className="w-full border-separate border-spacing-y-3 font-black">
                                <thead>
                                    <tr className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-black font-black">
                                        <th className="px-6 font-black">Customer Name</th>
                                        <th className="px-6 font-black">Amount</th>
                                        <th className="px-6 font-black">Timeline</th>
                                        <th className="px-6 text-right font-black">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingSlips.map((slip) => (
                                        <tr key={slip.id} className="group font-black">
                                            <td className="px-6 py-5 rounded-l-[1.5rem] bg-white/[0.04] border-y border-l border-white/5 font-black">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><User size={14} /></div>
                                                    <div className="flex flex-col"><p className="font-black text-sm text-white">@{slip.username || 'ระบบไม่พบชื่อ'}</p><p className="text-[9px] text-white/20 uppercase tracking-widest">ID: {slip.user_id}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 bg-white/[0.04] border-y border-white/5 font-black text-emerald-400">฿{slip.amount.toLocaleString()}</td>
                                            <td className="px-6 py-5 bg-white/[0.04] border-y border-white/5 text-[12px] opacity-60 font-black">{slip.transfer_date} • {slip.transfer_time}</td>
                                            <td className="px-6 py-5 rounded-r-[1.5rem] bg-white/[0.04] border-y border-r border-white/5 text-right font-black">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSelectedSlip(slip)} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition"><Eye size={16}/></button>
                                                    <button onClick={() => handleAction(slip.id, "APPROVE")} className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition"><CheckCircle2 size={16}/></button>
                                                    <button onClick={() => handleAction(slip.id, "REJECT")} className="p-3 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition"><XCircle size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <EmptyState text="No Pending Slips" />}
                    </div>
                )}

                {/* ✅ แท็บ History */}
                {activeTab === 'history' && (
                    <div className="overflow-x-auto text-left animate-in fade-in duration-500 font-black">
                        {paymentHistory.length > 0 ? (
                            <table className="w-full border-separate border-spacing-y-3 font-black">
                                <thead>
                                    <tr className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-black">
                                        <th className="px-6 font-black">User / Customer</th>
                                        <th className="px-6 font-black">Total (THB)</th>
                                        <th className="px-6 font-black">Timeline</th>
                                        <th className="px-6 font-black">Status</th>
                                        <th className="px-6 text-right font-black">Proof</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((slip) => (
                                        <tr key={slip.id} className="group font-black">
                                            <td className="px-6 py-5 rounded-l-[1.5rem] bg-white/[0.04] border-y border-l border-white/5 opacity-80">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/20"><User size={14} /></div>
                                                    <div className="flex flex-col"><p className="font-black text-sm text-white">@{slip.username || 'ระบบไม่พบชื่อ'}</p><p className="text-[9px] text-white/20 uppercase tracking-widest">ID: {slip.user_id}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 bg-white/[0.04] border-y border-white/5 font-black text-lg text-white">฿{Number(slip.amount).toLocaleString()}</td>
                                            <td className="px-6 py-5 bg-white/[0.04] border-y border-white/5 font-black"><p className="text-[12px] text-white/70 mb-0.5">{slip.transfer_date}</p><p className="text-[10px] text-white/30 tracking-widest">{slip.transfer_time}</p></td>
                                            <td className="px-6 py-5 bg-white/[0.04] border-y border-white/5 font-black"><span className={`px-4 py-1.5 rounded-full text-[9px] border ${slip.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{slip.status}</span></td>
                                            <td className="px-6 py-5 rounded-r-[1.5rem] bg-white/[0.04] border-y border-r border-white/5 text-right font-black"><button onClick={() => setSelectedSlip(slip)} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-indigo-400 transition"><Eye size={18}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <EmptyState text="History Empty" />}
                    </div>
                )}

                {/* ✅ แท็บ Script Manager */}
                {activeTab === 'products' && (
                    <div className="overflow-x-auto text-left animate-in fade-in duration-500 font-black">
                        {products.length > 0 ? (
                            <table className="w-full border-separate border-spacing-y-3 font-black">
                                <thead>
                                    <tr className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-black">
                                        <th className="px-6 font-black">ชื่อสคริปต์</th>
                                        <th className="px-6 font-black">ราคา</th>
                                        <th className="px-6 font-black">สถานะ</th>
                                        <th className="px-6 text-right font-black">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                                        <tr key={product.id} className="group font-black">
                                            <td className="px-6 py-5 rounded-l-[1.5rem] bg-white/[0.04] border-y border-l border-white/5 font-black">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Package size={18} /></div>
                                                    <div><p className="font-black text-sm text-white uppercase">{product.name}</p><p className="text-[9px] text-white/20 tracking-widest font-black font-black">RESOURCE</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 bg-white/[0.04] border-y border-white/5 font-black text-indigo-400">฿{Number(product.price).toLocaleString()}</td>
                                            <td className="px-6 py-5 bg-white/[0.04] border-y border-white/5 font-black"><span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] border border-emerald-500/20 uppercase font-black">พร้อมขาย</span></td>
                                            <td className="px-6 py-5 rounded-r-[1.5rem] bg-white/[0.04] border-y border-r border-white/5 text-right font-black">
                                                <div className="flex justify-end gap-2 font-black">
                                                    <Link href={`/admin/products/edit?id=${product.id}`} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition"><Edit3 size={16}/></Link>
                                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-3 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <EmptyState text="No Scripts in Database" />}
                    </div>
                )}
            </div>
          </section>
        </div>
      </div>

      {/* --- Modal: Slip Preview --- */}
      {selectedSlip && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300 font-black">
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-[3rem] max-w-md w-full shadow-2xl relative text-left">
            <button onClick={() => setSelectedSlip(null)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-red-500 transition text-white/40 font-black"><XCircle size={20}/></button>
            <div className="mb-6 font-black">
                <h3 className="text-indigo-400 text-xs mb-1 uppercase tracking-widest font-black">ตรวจสอบสลิป</h3>
                <h2 className="text-2xl font-black uppercase font-black font-black">@{selectedSlip.username || 'UNKNOWN'}</h2>
                <p className="text-[11px] font-black opacity-40 mt-1 uppercase tracking-widest font-black font-black font-black font-black">฿{selectedSlip.amount} • {selectedSlip.transfer_time}</p>
            </div>
            <div className="rounded-[2rem] overflow-hidden border border-white/10 mb-8 bg-black/50 aspect-[3/4] flex items-center justify-center relative group">
                <img src={selectedSlip.slip_img?.startsWith('http') ? selectedSlip.slip_img : `/uploads/slips/${selectedSlip.slip_img}`} className="w-full h-full object-contain" alt="slip" />
                <a href={selectedSlip.slip_img?.startsWith('http') ? selectedSlip.slip_img : `/uploads/slips/${selectedSlip.slip_img}`} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-widest">ดูรูปจริง</a>
            </div>
            {selectedSlip.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-4 font-black">
                    <button onClick={() => handleAction(selectedSlip.id, "APPROVE")} className="py-5 bg-emerald-500 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-emerald-400 transition font-black">อนุมัติรายการ</button>
                    <button onClick={() => handleAction(selectedSlip.id, "REJECT")} className="py-5 bg-white/5 text-red-500 font-black rounded-2xl text-[11px] uppercase tracking-widest border border-red-500/10 hover:bg-red-500 hover:text-white transition font-black">ปฏิเสธสลิป</button>
                </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function EmptyState({text}) {
    return <div className="py-32 text-center text-white/10 font-black uppercase tracking-[0.5em] border-2 border-dashed border-white/5 rounded-[3rem] font-black">{text}</div>
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:border-white/20 group backdrop-blur-md">
            <div className="flex justify-between items-start mb-4 text-white/20 group-hover:text-white/40 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{title}</span>
                <div className={`${color} opacity-40 group-hover:opacity-100 transition-opacity`}>{icon}</div>
            </div>
            <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
        </div>
    );
}

function AdminNavItem({ active, onClick, icon, label, badge }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all group ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-white/20 hover:bg-white/5 hover:text-white/60'}`}>
            <div className="flex items-center gap-4"><span className={`${active ? 'text-white' : 'text-white/20 group-hover:text-indigo-400'} transition-colors`}>{icon}</span><span className="tracking-tight">{label}</span></div>
            {badge > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${active ? 'bg-white/20' : 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50'}`}>{badge}</span>}
        </button>
    );
}