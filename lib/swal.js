import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// กำหนดธีมพื้นฐานสำหรับ DVL Store (สีมืด-ม่วง)
const swalConfig = {
  background: '#0f172a',
  color: '#fff',
  confirmButtonColor: '#7c3aed', // สีม่วง Indigo
  cancelButtonColor: '#ef4444',  // สีแดง
  customClass: {
    popup: 'rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl',
    confirmButton: 'px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] outline-none',
    cancelButton: 'px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] outline-none'
  }
};

export const confirmModal = async (title, text, icon = 'question') => {
  return await MySwal.fire({
    ...swalConfig,
    title: <span className="font-black uppercase tracking-tighter text-2xl">{title}</span>,
    html: <span className="text-sm font-medium opacity-60">{text}</span>,
    icon: icon,
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
  });
};

export const successModal = (title, text) => {
  MySwal.fire({
    ...swalConfig,
    title: <span className="font-black uppercase tracking-tighter text-2xl">{title}</span>,
    html: <span className="text-sm font-medium opacity-60">{text}</span>,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
};

export const errorModal = (title, text) => {
  MySwal.fire({
    ...swalConfig,
    title: <span className="font-black uppercase tracking-tighter text-2xl text-red-400">{title}</span>,
    html: <span className="text-sm font-medium opacity-60">{text}</span>,
    icon: 'error',
  });
};