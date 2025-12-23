'use client';

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { 
  ShoppingCart, ChevronRight, Star, 
  Box, Layout, Code2, Search, X, 
  PlayCircle, CheckCircle, Info, DownloadCloud,
  CreditCard, ExternalLink, Loader2, Plus, Sparkles,
  Zap, ShieldCheck
} from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- Swal Theme Config ---
const swalConfig = {
  background: '#0f172a',
  color: '#fff',
  confirmButtonColor: '#6366f1',
  cancelButtonColor: '#334155',
  customClass: {
    popup: 'rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl',
    confirmButton: 'px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] outline-none transition-all hover:scale-105',
    cancelButton: 'px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] outline-none transition-all hover:scale-105'
  }
};

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => { if (data && !data.error) setUser(data); });

    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&mute=1` : "";
  };

  const handlePurchase = async (product) => {
    if (!user) {
      return MySwal.fire({ ...swalConfig, icon: 'warning', title: 'กรุณาล็อกอิน', text: 'คุณต้องเข้าสู่ระบบก่อนซื้อสินค้า' });
    }
    
    if (user.points < product.price) {
      return MySwal.fire({ ...swalConfig, icon: 'error', title: 'แต้มไม่เพียงพอ', text: 'กรุณาเติมเงินเพื่อซื้อสินค้านี้' });
    }
    
    const confirm = await MySwal.fire({
      ...swalConfig,
      icon: 'question',
      title: 'ยืนยันการชำระเงิน?',
      text: `ต้องการซื้อ ${product.name} ราคา ${product.price.toLocaleString()} พอยท์?`,
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการซื้อ',
      cancelButtonText: 'ยกเลิก'
    });

    if (confirm.isConfirmed) {
        MySwal.fire({ title: 'กำลังดำเนินการ...', allowOutsideClick: false, didOpen: () => { MySwal.showLoading(); } });
        
        try {
            const res = await fetch("/api/products/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    productId: product.id, 
                    userId: String(user.discord_id || user.id) 
                })
            });
            const result = await res.json();
            
            if (res.ok) {
                await MySwal.fire({ ...swalConfig, icon: 'success', title: 'สำเร็จ!', text: 'ขอบคุณที่ใช้บริการ ตรวจสอบสินค้าได้ที่โปรไฟล์ของคุณ' });
                window.location.href = "/profile";
            } else {
                MySwal.fire({ ...swalConfig, icon: 'error', title: 'ผิดพลาด', text: result.error || 'ไม่สามารถทำรายการได้' });
            }
        } catch (err) {
            MySwal.fire({ ...swalConfig, icon: 'error', title: 'Error', text: 'การเชื่อมต่อล้มเหลว' });
        }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#030712] text-white pb-24 overflow-hidden font-sans uppercase font-black">
      <Navbar user={user} />

      {/* Hero Section & Search */}
      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[150px] -z-10 animate-pulse" />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] tracking-[0.3em] mb-8">
            <Sparkles size={14} /> PREMIUM RESOURCES MARKETPLACE
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 uppercase leading-none">
            DVL <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500">STORE</span>
        </h1>
        <p className="text-white/30 text-xs md:text-sm tracking-widest max-w-2xl mx-auto mb-12">แหล่งรวมสคริปต์คุณภาพสูงสำหรับการปรับแต่งเซิร์ฟเวอร์ของคุณให้โดดเด่นและมีประสิทธิภาพสูงสุด</p>

        <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
                type="text" 
                placeholder="ค้นหาสคริปต์ที่คุณต้องการ..." 
                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-16 pr-6 text-sm outline-none focus:border-indigo-500/50 transition-all backdrop-blur-xl"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
            <p className="tracking-widest text-[10px]">กำลังโหลดข้อมูลสคริปต์...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.length > 0 ? filteredProducts.map((item) => (
              <div key={item.id} className="group bg-[#0f172a]/40 border border-white/5 rounded-[2.8rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 hover:translate-y-[-8px] flex flex-col h-full">
                {/* Image Section */}
                <div className="relative aspect-[16/10] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(item)}>
                  <img 
                    src={item.image ? `/uploads/products/${item.image}` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                    alt={item.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm">
                      <div className="px-8 py-3 bg-white text-black font-black text-[10px] rounded-2xl tracking-[0.2em] flex items-center gap-2 shadow-2xl scale-90 group-hover:scale-100 transition-all">
                          <ExternalLink size={14} /> รายละเอียด
                      </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black tracking-tight leading-tight uppercase group-hover:text-indigo-400 transition-colors">{item.name}</h3>
                      <div className="px-3 py-1 bg-indigo-500/10 rounded-lg text-[9px] font-black text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">{item.category || 'Resource'}</div>
                  </div>
                  <p className="text-white/20 text-[11px] mb-8 line-clamp-2 font-black leading-relaxed">{item.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="text-left">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Price / Points</p>
                      <p className="text-2xl font-black">{item.price?.toLocaleString()} <span className="text-[10px] text-indigo-400 ml-1">PTS</span></p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedProduct(item)} className="p-4 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                          <Info size={18} />
                      </button>
                      <button onClick={() => handlePurchase(item)} className="px-7 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.4rem] font-black text-[11px] tracking-wider shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2">
                          <ShoppingCart size={16} /> ซื้อสคริปต์
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center opacity-10">
                <p className="tracking-[1em] text-sm">ไม่พบสินค้าที่คุณต้องการ</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL: PRODUCT DETAILS --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 backdrop-blur-3xl bg-black/90 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#0b101f] border border-white/10 rounded-[3.5rem] max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(79,70,229,0.1)] relative scrollbar-hide">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-all text-white/40 z-10 border border-white/5">
              <X size={20} />
            </button>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-0">
              {/* Media Section */}
              <div className="p-8 lg:p-14 bg-indigo-500/[0.01] border-r border-white/5">
                <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-video bg-[#030712] relative mb-10 group">
                  {selectedProduct.video_url ? (
                    <iframe 
                      src={getEmbedUrl(selectedProduct.video_url)} 
                      className="w-full h-full" 
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <img src={selectedProduct.image ? `/uploads/products/${selectedProduct.image}` : "https://cdn.discordapp.com/embed/avatars/0.png"} className="w-full h-full object-cover" alt="preview" />
                  )}
                  <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[9px] font-black tracking-widest text-indigo-400 border border-white/5">PREVIEW MODE</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Preview Gallery</p>
                  <div className="grid grid-cols-3 gap-4">
                      {/* วนลูปแสดงรูปภาพจากคอลัมน์ gallery */}
                      {(() => {
                          try {
                              // แปลงข้อมูล gallery จาก JSON string เป็น Array
                              const galleryImages = selectedProduct.gallery ? JSON.parse(selectedProduct.gallery) : [];
                              
                              // หากไม่มีรูปใน gallery ให้แสดงรูปหลัก (image) แทนเป็นรูปแรก
                              const displayImages = galleryImages.length > 0 ? galleryImages : [selectedProduct.image];

                              return displayImages.map((imgName, index) => (
                                  <div key={index} className={`rounded-2xl border overflow-hidden aspect-video transition-all cursor-pointer hover:border-indigo-500/50 ${index === 0 ? 'border-indigo-500/30' : 'border-white/5'}`}>
                                      <img 
                                          src={imgName ? `/uploads/products/${imgName}` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                                          className="w-full h-full object-cover" 
                                          alt={`gallery-${index}`}
                                          // สามารถเพิ่มฟังก์ชัน onClick เพื่อเปลี่ยนรูปหลักที่แสดงผลด้านบนได้
                                      />
                                  </div>
                              ));
                          } catch (e) {
                              // กรณีเกิดข้อผิดพลาดในการ Parse JSON ให้แสดงรูปหลักเพียงรูปเดียว
                              return (
                                  <div className="rounded-2xl border border-indigo-500/30 overflow-hidden aspect-video">
                                      <img src={selectedProduct.image ? `/uploads/products/${selectedProduct.image}` : "https://cdn.discordapp.com/embed/avatars/0.png"} className="w-full h-full object-cover" />
                                  </div>
                              );
                          }
                      })()}
                      
                      {/* หากมีรูปน้อยกว่า 3 รูป สามารถแสดงช่องว่างหรือปุ่ม Plus เพิ่มเติมได้ */}
                      {(!selectedProduct.gallery || JSON.parse(selectedProduct.gallery).length < 2) && (
                          <div className="bg-white/[0.02] rounded-2xl border border-white/5 flex flex-col items-center justify-center text-white/10 aspect-video opacity-40">
                              <Box size={20} />
                          </div>
                      )}
                  </div>
              </div>
              </div>

              {/* Info & Content Section */}

              {/* Info & Content Section */}
                <div className="p-8 lg:p-14 flex flex-col h-[90vh] lg:h-[700px]"> {/* กำหนดความสูงที่แน่นอนให้ Container ฝั่งขวา */}
                  
                  {/* ส่วนที่ 1: Header (อยู่กับที่) */}
                  <div className="flex-none">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="px-4 py-1.5 bg-indigo-500/10 rounded-xl text-indigo-400 text-[10px] font-black tracking-[0.2em] border border-indigo-500/20">
                              {selectedProduct.category || 'RESOURCES'}
                          </div>
                          {selectedProduct.version && (
                              <div className="px-4 py-1.5 bg-white/5 rounded-xl text-white/40 text-[10px] font-black tracking-widest border border-white/5">
                                  VER {selectedProduct.version}
                              </div>
                          )}
                      </div>
                      
                      <h2 className="text-5xl font-black tracking-tighter mb-8 leading-none uppercase">{selectedProduct.name}</h2>
                      
                      <div className="flex items-center gap-3 mb-6">
                          <Layout className="text-indigo-400" size={20} />
                          <h3 className="text-sm font-black tracking-[0.2em] text-white/90">รายละเอียดสินค้า</h3>
                      </div>
                  </div>

                  {/* ส่วนที่ 2: รายละเอียดสินค้า (เลื่อนได้เฉพาะตรงนี้) */}
                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                      <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-black text-indigo-400">#</span>
                              <p className="text-white font-black text-sm uppercase tracking-tight">
                                  {selectedProduct.name}
                              </p>
                          </div>
                          
                          <div className="space-y-4">
                              {selectedProduct.description?.split('\n').map((line, index) => (
                                  line.trim() !== "" && (
                                      <div key={index} className="flex items-start gap-4 group">
                                          <span className="text-indigo-500 font-black mt-1 group-hover:scale-125 transition-transform">+</span>
                                          <p className="text-[12px] font-medium text-white/60 leading-relaxed font-black tracking-wide group-hover:text-white transition-colors">
                                              {line.replace(/^\+ /, '')}
                                          </p>
                                      </div>
                                  )
                              ))}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                              <div className="flex items-center gap-3">
                                  <ShieldCheck className="text-emerald-500/50" size={16} />
                                  <span className="text-[10px] text-white/30 tracking-widest font-black uppercase">Verified Script</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <Zap className="text-amber-500/50" size={16} />
                                  <span className="text-[10px] text-white/30 tracking-widest font-black uppercase">Instant Access</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* ส่วนที่ 3: Footer Action (อยู่กับที่ด้านล่าง) */}
                  <div className="flex-none mt-10 pt-10 border-t border-white/5 flex items-center justify-between gap-8">
                    <div className="text-left">
                          <p className="text-[10px] font-black text-white/20 tracking-[0.3em] mb-2">LICENSING: LIFETIME</p>
                          <p className="text-5xl font-black text-white leading-none tracking-tighter">
                              {selectedProduct.price?.toLocaleString()} <span className="text-sm text-indigo-400 ml-1">PTS</span>
                          </p>
                    </div>
                    <button 
                      onClick={() => handlePurchase(selectedProduct)} 
                      className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-3 group"
                    >
                          <ShoppingCart size={20} className="group-hover:rotate-[-12deg] transition-transform" /> PURCHASE NOW
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function EmptyState({text}) {
    return <div className="py-32 text-center text-white/10 font-black uppercase tracking-[0.5em] border-2 border-dashed border-white/5 rounded-[3rem]">{text}</div>
}