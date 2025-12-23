'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut, User, ChevronDown, MessageSquare, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  // ID ของแอดมิน (คุณ)
  const ADMIN_ID = "711119862302375956";

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    window.location.href = "/api/logout";
  };

  // const getAvatarUrl = (userData) => {
  //   if (userData && userData.avatar) {
  //     return `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
  //   }
  //   return "/avatar.png";
  // };

  const getAvatarUrl = (user) => {
  if (!user) return "https://cdn.discordapp.com/embed/avatars/0.png";
  
  // 1. ตรวจสอบว่ามี avatar hash หรือไม่
  const avatarHash = user.avatar;
  
  // 2. ตรวจสอบหา Discord ID จากทุกช่องทางที่อาจเป็นไปได้
  // ในภาพหน้าจอของคุณ บางครั้งเลขดิสคอร์ดจะอยู่ใน id หรือ discord_id
  const userId = user.discord_id || user.id;

  if (userId && avatarHash) {
    // ลิงก์ที่ถูกต้องสำหรับการดึงรูปจาก Discord
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=256`;
  }
  
  // 3. ถ้าไม่มีข้อมูลจริงๆ ให้โชว์รูปโลโก้ดิสคอร์ดที่คุณเห็นอยู่ตอนนี้
  return "https://cdn.discordapp.com/embed/avatars/0.png"; 
};

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-6xl">
      <div className="flex items-center justify-between px-6 py-3 rounded-2xl
        bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all">

        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0d0d0d] rounded-[11px] flex items-center justify-center overflow-hidden">
              <Image 
                src="/Logo_DVL_03-01.png" 
                alt="DVL Logo" 
                width={40}
                height={40} 
                className="object-contain"
              />
            </div>
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-black text-white tracking-tight group-hover:text-purple-300 transition">
              DVL DEVELOPER
            </p>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest -mt-1">
              FiveM Resources
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-8 text-sm font-bold text-white/70">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/products">Products</NavItem>
            <NavItem href="/docs">Docs</NavItem>
          </ul>

          <div className="h-6 w-[1px] bg-white/10" />

          <div className="flex items-center gap-6">
            <Link href="https://discord.gg/xxxx" target="_blank" className="text-white/50 hover:text-[#5865F2] transition">
              <MessageSquare size={20} />
            </Link>

            {/* --- ADMIN BUTTON (แสดงเฉพาะ ID ที่ระบุ) --- */}
            {user?.isAdmin && ( // ✅ เปลี่ยนมาใช้ isAdmin ที่ส่งมาจาก API
              <Link href="/admin">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[11px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5">
                  <ShieldCheck size={14} /> Admin
                </button>
              </Link>
            )}

            {!user ? (
              <button
                onClick={() => window.location.href = "/api/auth/discord"}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition font-black text-xs text-white shadow-lg shadow-purple-500/30"
              >
                Login with Discord
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-3 bg-white/10 pr-3 pl-1.5 py-1.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all active:scale-95"
                >
                  <img
                    src={getAvatarUrl(user)}
                    className="w-8 h-8 rounded-xl ring-2 ring-purple-500/20 object-cover shadow-lg"
                    alt="avatar"
                  />
                  <span className="text-white font-bold text-xs">{user.username}</span>
                  <ChevronDown size={14} className={`text-white/40 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
                    >
                      <User size={18} className="text-purple-400" /> My Profile
                    </Link>
                    <div className="h-[1px] bg-white/5 my-1" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Button */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white/70">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mt-3 rounded-[2rem] bg-slate-900/95 backdrop-blur-3xl border border-white/20 p-6 lg:hidden flex flex-col gap-4 shadow-2xl animate-in fade-in slide-in-from-top-4 text-left">
          <ul className="flex flex-col gap-4">
            <NavItem href="/" onClick={() => setOpen(false)}>Home</NavItem>
            <NavItem href="/products" onClick={() => setOpen(false)}>Products</NavItem>
            <NavItem href="/docs" onClick={() => setOpen(false)}>Docs</NavItem>
            
            <div className="h-[1px] bg-white/10 my-2" />
            
            {/* Mobile Admin Link */}
            {user?.id === ADMIN_ID && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase text-sm">
                <ShieldCheck size={18} /> Admin Panel
              </Link>
            )}

            {!user ? (
              <button
                onClick={() => window.location.href = "/api/auth/discord"}
                className="w-full py-4 rounded-2xl bg-purple-600 text-white font-black text-center"
              >
                Login with Discord
              </button>
            ) : (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <img src={getAvatarUrl(user)} className="w-10 h-10 rounded-xl" alt="mobile-avatar" />
                  <span className="text-white font-black">{user.username}</span>
                </Link>
                <button onClick={logout} className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400 font-bold hover:bg-red-400/10 transition">
                  Logout
                </button>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

function NavItem({ href, children, onClick }) {
  return (
    <li className="list-none">
      <Link
        href={href}
        onClick={onClick}
        className="text-white/60 hover:text-white transition-all font-bold relative group block"
      >
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-purple-500 transition-all duration-300 group-hover:w-full" />
      </Link>
    </li>
  );
}