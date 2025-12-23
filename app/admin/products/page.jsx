'use client';

import { useState } from "react";
import { 
  PackagePlus, Upload, DollarSign, Type, 
  FileText, PlayCircle, Save, X, Plus, Loader2, Image as ImageIcon
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import Swal from 'sweetalert2';

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Script",
    video_url: "",
    features: [""]
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages([...selectedImages, ...files]);
    
    // สร้าง Preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...selectedImages];
    const newPreviews = [...previews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedImages.length === 0) return alert("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
    
    setIsSubmitting(true);

    try {
      const data = new FormData();
      // อัปโหลดหลายรูป
      selectedImages.forEach((image) => {
        data.append("images", image);
      });

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("video_url", formData.video_url);
      data.append("features", JSON.stringify(formData.features.filter(f => f.trim() !== "")));

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        await Swal.fire({ title: 'สำเร็จ!', text: 'เพิ่มสินค้าเข้า Marketplace แล้ว', icon: 'success', background: '#0f172a', color: '#fff' });
        window.location.href = "/admin";
      } else {
        const errorData = await res.json();
        alert("เกิดข้อผิดพลาด: " + errorData.error);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white pb-24 pt-32 px-6 font-black uppercase">
      <Navbar />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12 text-left">
          <div className="p-4 bg-indigo-500/10 rounded-3xl text-indigo-400 border border-indigo-500/20">
            <PackagePlus size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">New <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Resource</span></h1>
            <p className="text-white/20 text-[10px] font-bold tracking-[0.3em] mt-1">Marketplace Inventory System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-10">
          <div className="space-y-8">
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] backdrop-blur-3xl space-y-8 text-left">
              <div className="space-y-2">
                <label className="text-[10px] text-white/30 tracking-widest ml-2">Product Identity</label>
                <div className="relative">
                  <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500/50" size={20} />
                  <input type="text" required placeholder="Product Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-black focus:border-indigo-500 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/30 tracking-widest ml-2">Product Description</label>
                <textarea rows="6" required placeholder="Tell customers about this script..." className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-sm font-black focus:border-indigo-500 outline-none transition-all" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-white/30 tracking-widest ml-2">Highlighted Features</label>
                <div className="grid md:grid-cols-2 gap-3">
                    {formData.features.map((feature, index) => (
                    <input key={index} type="text" placeholder={`Feature #${index + 1}`} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black focus:border-indigo-500 outline-none" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} />
                    ))}
                </div>
                <button type="button" onClick={handleAddFeature} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-white transition-all"><Plus size={16} /> Add More Point</button>
              </div>
            </div>

            {/* ✅ Multi Image Upload Section */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-6 text-left">
                <label className="text-[10px] text-white/30 tracking-widest ml-2">Image Gallery (Multiple)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((src, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                            <img src={src} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><X size={12} /></button>
                        </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all text-white/20 hover:text-indigo-400">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        <Plus size={24} />
                        <span className="text-[9px] mt-2 font-black">Add Photo</span>
                    </label>
                </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-8 text-left sticky top-32">
              <div className="space-y-2">
                <label className="text-[10px] text-white/30 tracking-widest ml-2">Pricing (PTS)</label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                  <input type="number" required placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-2xl font-black outline-none focus:border-indigo-500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/30 tracking-widest ml-2">Media URL</label>
                <div className="relative">
                  <PlayCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                  <input type="text" placeholder="YouTube Video Link" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-[10px] font-black outline-none focus:border-indigo-500" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-3xl shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-xs tracking-widest">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSubmitting ? "Uploading..." : "Publish Item"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}