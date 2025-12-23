'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Package, Info, Upload, Tag } from "lucide-react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Swal from 'sweetalert2';

// 1. แยกเนื้อหาฟอร์มออกมาเป็น Component ย่อย
function EditProductForm() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();

    const [formData, setFormData] = useState({ 
        name: '', 
        price: '', 
        description: '', 
        version: '',
        image: '' 
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetch(`/api/admin/products/get?id=${id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setFormData(data);
                        if (data.image) setPreviewUrl(`/uploads/products/${data.image}`);
                    }
                    setLoading(false);
                });
        }
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('id', id || '');
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('version', formData.version);
        if (selectedFile) data.append('image', selectedFile);

        try {
            const res = await fetch("/api/admin/products/update", {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                await Swal.fire({ 
                    title: 'บันทึกสำเร็จ!', 
                    icon: 'success', 
                    background: '#111827', 
                    color: '#fff',
                    confirmButtonColor: '#4f46e5'
                });
                router.push("/admin");
            }
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <p className="animate-pulse text-indigo-400 tracking-widest">LOADING PRODUCT DATA...</p>
        </div>
    );

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl font-black">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 font-black">
                        <Package size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl tracking-tighter font-black">แก้ไขข้อมูล <span className="text-indigo-400">สคริปต์</span></h1>
                        <p className="text-white/20 text-[10px] tracking-widest font-black">Product ID: #{id}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 font-black">
                <div className="space-y-4 font-black">
                    <label className="text-[10px] text-white/40 tracking-widest ml-1 font-black">รูปภาพหน้าปก (Thumbnail)</label>
                    <div className="flex flex-col md:flex-row gap-6 items-start font-black">
                        {previewUrl && (
                            <div className="w-40 h-40 rounded-3xl overflow-hidden border border-white/10 bg-black/40 shrink-0 font-black">
                                <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                            </div>
                        )}
                        <div className="relative flex-1 w-full font-black">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10 font-black" />
                            <div className="border-2 border-dashed border-white/10 rounded-3xl py-12 px-6 flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-all font-black">
                                <Upload className="text-white/20 mb-3 font-black" size={32} />
                                <p className="text-[10px] text-white/40 font-black">คลิกเพื่อเปลี่ยนรูปภาพใหม่</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 font-black">
                    <div className="space-y-2 font-black">
                        <label className="text-[10px] text-white/40 tracking-widest ml-1 font-black">ชื่อสินค้า (Product Name)</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 outline-none transition-all font-black" required />
                    </div>
                    <div className="space-y-2 font-black">
                        <label className="text-[10px] text-white/40 tracking-widest ml-1 font-black">เวอร์ชั่น (Version)</label>
                        <div className="relative font-black">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input type="text" placeholder="1.0.0" value={formData.version || ''} onChange={(e) => setFormData({...formData, version: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-indigo-500 outline-none transition-all font-black" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 font-black">
                    <label className="text-[10px] text-white/40 tracking-widest ml-1 font-black">ราคา (Price THB)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 outline-none transition-all font-mono font-black" required />
                </div>

                <div className="space-y-2 font-black">
                    <label className="text-[10px] text-white/40 tracking-widest ml-1 font-black">รายละเอียด (Description)</label>
                    <textarea rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 outline-none transition-all text-sm font-black"></textarea>
                </div>

                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    <Save size={18} /> บันทึกข้อมูลทั้งหมด
                </button>
            </form>
        </div>
    );
}

// 2. Main Page ที่ใช้ Suspense ครอบเพื่อให้ Build ผ่าน
export default function EditProductPage() {
    return (
        <main className="min-h-screen bg-[#0a0f1d] text-white pb-20 pt-28 px-4 font-black uppercase">
            <Navbar />
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 font-black">
                <Link href="/admin" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-xs tracking-widest font-black">
                    <ArrowLeft size={16} /> กลับสู่ระบบจัดการ
                </Link>

                <Suspense fallback={
                    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-20 text-center">
                        <p className="animate-pulse text-white/20">LOADING INTERFACE...</p>
                    </div>
                }>
                    <EditProductForm />
                </Suspense>
            </div>
        </main>
    );
}