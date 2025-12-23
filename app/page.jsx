'use client';

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Play, ArrowUpRight, ShieldCheck, Zap, Globe, Loader2, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ดึงข้อมูลสินค้าล่าสุด 3 ชิ้นจากฐานข้อมูล
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // เลือกมาแสดง 3 ชิ้นล่าสุด
          setFeaturedProducts(data.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch featured products error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0f1d] text-white pb-20 relative overflow-hidden font-sans">
      <Navbar />

      {/* --- Background Glows --- */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

      {/* --- HERO SECTION --- */}
      <section className="pt-52 pb-20 text-center px-6 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-bounce">
            <Zap size={14} className="text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-200">Premium FiveM Resources</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 uppercase">
          DVL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 text-glow">DEVELOPER</span>
          <br />
          <span className="text-white/10 uppercase text-4xl md:text-6xl tracking-[0.2em]">Collective</span>
        </h1>

        <p className="mt-8 max-w-2xl mx-auto text-lg text-white/50 font-medium leading-relaxed">
            สัมผัสประสบการณ์สคริปต์ระดับพรีเมียม ออกแบบเพื่อประสิทธิภาพสูงสุด
            <br className="hidden md:block" /> 
            ความปลอดภัย และ UI ที่ลื่นไหลที่สุดสำหรับเซิร์ฟเวอร์ของคุณ
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/products">
            <button className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition shadow-[0_10px_40px_rgba(255,255,255,0.2)] tracking-tight uppercase text-sm">
              VIEW ALL PRODUCTS
            </button>
          </Link>
          <button className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition font-bold backdrop-blur-md uppercase text-sm tracking-widest text-white/60">
            DOCUMENTATION
          </button>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS --- */}
      <section className="max-w-7xl mx-auto mt-20 px-6">
        <div className="flex items-center justify-between mb-12 text-left">
            <div>
                <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">FEATURED <span className="text-purple-500">RESOURCES</span></h2>
                <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-transparent rounded-full" />
            </div>
            <Link href="/products" className="text-sm font-bold text-white/40 hover:text-white transition flex items-center gap-2 font-black uppercase tracking-widest">
                Explore Store <ArrowUpRight size={16} />
            </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Syncing Products...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                />
              ))
            ) : (
              <div className="col-span-full py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 text-center">
                 <p className="opacity-20 font-black uppercase tracking-widest text-sm">No resources available in database</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* --- FOOTER --- */}
      <footer className="max-w-7xl mx-auto mt-40 px-6 border-t border-white/10 pt-16 pb-12 opacity-60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-2xl">
                    YL
                </div>
                <div className="text-left">
                    <p className="text-white font-black tracking-[0.2em] text-lg uppercase leading-none mb-1">YL DEVELOPER</p>
                    <p className="text-purple-300/40 font-bold text-[10px] uppercase tracking-widest">Premium FiveM Resources</p>
                </div>
            </div>
            <p className="text-white/40 font-bold text-[10px] uppercase tracking-[0.2em]">
                © 2025 All rights reserved to <span className="text-white font-black underline decoration-purple-500 decoration-2 underline-offset-4">YLDEV</span>
            </p>
        </div>
      </footer>
    </main>
  );
}

function ProductCard({ item }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // แปลงลิงก์ YouTube เป็น Embed URL
  const getEmbedUrl = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` : "";
  };

  return (
    <div className="group relative rounded-[2.5rem] border border-white/10 bg-[#111827]/40 backdrop-blur-md hover:border-purple-500/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden shadow-2xl text-left">
      
      {/* Media Section */}
      <div className="relative aspect-video bg-black overflow-hidden group/media">
        <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[9px] font-black tracking-widest text-purple-400 border border-purple-500/30 uppercase">
            {item.category}
        </div>

        {isPlaying && item.video_url ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={getEmbedUrl(item.video_url)}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <>
            <img 
              src={item.image_url ? `/uploads/products/${item.image_url}` : "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1031&auto=format&fit=crop"} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-700 group-hover:scale-105" 
              alt={item.name} 
            />
            {/* Play Button Overlay */}
            {item.video_url && (
              <button 
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition group"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition duration-500">
                  <PlayCircle size={32} fill="currentColor" className="ml-1" />
                </div>
              </button>
            )}
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-transparent to-transparent z-[5] pointer-events-none" />
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Featured Resource</span>
        </div>
        
        <h3 className="text-xl font-black tracking-tight mb-2 text-white group-hover:text-purple-300 transition-colors uppercase line-clamp-1 leading-none">
          {item.name}
        </h3>
        <p className="text-[13px] text-white/40 mb-8 font-medium leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Lifetime Price</span>
            <span className="text-2xl font-black text-white leading-none">
                {item.price?.toLocaleString()} <span className="text-xs text-purple-400 uppercase tracking-tighter">Pts</span>
            </span>
          </div>

          <Link href="/products">
            <button className="flex items-center gap-2 px-6 py-3.5 text-[11px] font-black rounded-2xl bg-white text-slate-900 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 uppercase tracking-tighter active:scale-95">
               GET NOW <ArrowUpRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}